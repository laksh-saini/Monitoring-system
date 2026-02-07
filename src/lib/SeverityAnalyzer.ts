/**
 * SeverityAnalyzer - Calculates accident severity score using TensorFlow.js detection data
 * 
 * This module analyzes object detection results (vehicles, pedestrians, collisions)
 * and calculates a severity score from 0-100 based on:
 * - Number and types of vehicles involved
 * - Detection confidence scores
 * - Collision detection (IoU overlaps)
 * - Velocity estimation
 * - Pedestrian proximity to vehicles
 */

export interface Detection {
    class: string;
    confidence: number;
    bbox: number[]; // [x, y, width, height]
    velocity?: number; // pixels per second
}

export interface CollisionData {
    pair: string; // e.g., "Car & Truck"
    iou: number;
    highVelocity: boolean;
}

export interface SeverityAnalysisInput {
    detections: Detection[];
    collisions: CollisionData[];
    frameTimestamp: number;
}

export interface SeverityAnalysisResult {
    score: number;
    label: "LOW" | "MODERATE" | "CRITICAL";
    factors: string[];
}

// Vehicle classes recognized by COCO-SSD
const VEHICLE_CLASSES = new Set(["car", "truck", "bus", "motorcycle", "bicycle"]);

/**
 * Calculate IoU (Intersection over Union) between two bounding boxes
 */
export function calculateIoU(boxA: number[], boxB: number[]): number {
    const [ax, ay, aw, ah] = boxA;
    const [bx, by, bw, bh] = boxB;

    const ax2 = ax + aw;
    const ay2 = ay + ah;
    const bx2 = bx + bw;
    const by2 = by + bh;

    const ix = Math.max(0, Math.min(ax2, bx2) - Math.max(ax, bx));
    const iy = Math.max(0, Math.min(ay2, by2) - Math.max(ay, by));
    const intersection = ix * iy;

    const union = aw * ah + bw * bh - intersection;
    return union <= 0 ? 0 : intersection / union;
}

/**
 * Check if a pedestrian is near any vehicle (within proximity threshold)
 */
function isPedestrianNearVehicle(pedestrian: Detection, vehicles: Detection[]): boolean {
    const PROXIMITY_THRESHOLD = 0.1; // IoU threshold for "near"

    for (const vehicle of vehicles) {
        // Expand pedestrian bbox to check proximity
        const expandedBbox = [
            pedestrian.bbox[0] - 50,
            pedestrian.bbox[1] - 50,
            pedestrian.bbox[2] + 100,
            pedestrian.bbox[3] + 100,
        ];

        const proximity = calculateIoU(expandedBbox, vehicle.bbox);
        if (proximity > PROXIMITY_THRESHOLD) {
            return true;
        }
    }
    return false;
}

/**
 * Calculate severity score based on detection data
 * 
 * Scoring algorithm:
 * - Base score: 50
 * - +10 per vehicle involved (max +30)
 * - +15 if pedestrian detected near vehicles
 * - +5 per collision detected (IoU > 0.15), max +20
 * - +10 if high velocity detected
 * - +5 per high-confidence detection (> 90%), max +10
 * - Score capped at 100
 */
export function calculateSeverityScore(input: SeverityAnalysisInput): SeverityAnalysisResult {
    const { detections, collisions } = input;
    const factors: string[] = [];

    // Separate vehicles and pedestrians
    const vehicles = detections.filter(d => VEHICLE_CLASSES.has(d.class));
    const pedestrians = detections.filter(d => d.class === "person");

    // Start with base score
    let score = 50;

    // Factor 1: Number of vehicles involved (+10 per vehicle, max +30)
    const vehicleCount = Math.min(vehicles.length, 3);
    if (vehicleCount > 0) {
        score += vehicleCount * 10;
        factors.push(`${vehicles.length} vehicle(s) detected`);
    }

    // Factor 2: Pedestrian near vehicles (+15)
    const pedestrianNearVehicle = pedestrians.some(p => isPedestrianNearVehicle(p, vehicles));
    if (pedestrianNearVehicle) {
        score += 15;
        factors.push("Pedestrian in proximity to vehicles");
    }

    // Factor 3: Collisions detected (+5 per collision, max +20)
    const collisionCount = Math.min(collisions.length, 4);
    if (collisionCount > 0) {
        score += collisionCount * 5;
        factors.push(`${collisions.length} potential collision(s) detected`);
    }

    // Factor 4: High velocity detected (+10)
    const hasHighVelocity = collisions.some(c => c.highVelocity) ||
        detections.some(d => (d.velocity ?? 0) > 200);
    if (hasHighVelocity) {
        score += 10;
        factors.push("High velocity impact detected");
    }

    // Factor 5: High confidence detections (+5 per, max +10)
    const highConfidenceCount = Math.min(
        detections.filter(d => d.confidence > 0.9).length,
        2
    );
    if (highConfidenceCount > 0) {
        score += highConfidenceCount * 5;
        factors.push(`${highConfidenceCount} high-confidence detection(s)`);
    }

    // Cap score at 100
    score = Math.min(score, 100);

    // Determine severity label
    let label: "LOW" | "MODERATE" | "CRITICAL";
    if (score >= 75) {
        label = "CRITICAL";
    } else if (score >= 50) {
        label = "MODERATE";
    } else {
        label = "LOW";
    }

    return { score, label, factors };
}

/**
 * Detect collisions between objects based on IoU overlap
 */
export function detectCollisions(detections: Detection[], velocities: Map<string, number>): CollisionData[] {
    const collisions: CollisionData[] = [];
    const HIGH_VELOCITY_THRESHOLD = 200; // pixels per second
    const COLLISION_IOU_THRESHOLD = 0.15;

    for (let i = 0; i < detections.length; i++) {
        for (let j = i + 1; j < detections.length; j++) {
            const a = detections[i];
            const b = detections[j];

            const iou = calculateIoU(a.bbox, b.bbox);
            if (iou > COLLISION_IOU_THRESHOLD) {
                const velocityA = velocities.get(`${a.class}-${i}`) ?? 0;
                const velocityB = velocities.get(`${b.class}-${j}`) ?? 0;
                const highVelocity = velocityA > HIGH_VELOCITY_THRESHOLD || velocityB > HIGH_VELOCITY_THRESHOLD;

                collisions.push({
                    pair: `${capitalize(a.class)} & ${capitalize(b.class)}`,
                    iou,
                    highVelocity,
                });
            }
        }
    }

    return collisions;
}

function capitalize(s: string): string {
    return s && s[0].toUpperCase() + s.slice(1);
}

/**
 * SeverityTracker class for maintaining state across video frames
 * Uses PEAK-HOLD mechanism: score rises immediately but decays slowly
 */
export class SeverityTracker {
    private lastScore: number = 10;
    private peakScore: number = 10;
    private readonly decayRate = 2; // Points to decay per frame when no crash detected

    /**
     * Update severity with new detection data
     * Uses peak-hold: score goes UP immediately, but decays slowly
     */
    update(input: SeverityAnalysisInput): SeverityAnalysisResult {
        const result = calculateSeverityScore(input);
        const currentScore = result.score;

        // Peak-hold logic: take the higher of current score or slowly decayed peak
        if (currentScore >= this.peakScore) {
            // New peak detected - update immediately
            this.peakScore = currentScore;
            this.lastScore = currentScore;
        } else {
            // No new peak - decay slowly (but never below current frame's score)
            this.peakScore = Math.max(currentScore, this.peakScore - this.decayRate);
            this.lastScore = this.peakScore;
        }

        // Determine severity label
        let label: "LOW" | "MODERATE" | "CRITICAL";
        if (this.lastScore >= 70) {
            label = "CRITICAL";
        } else if (this.lastScore >= 40) {
            label = "MODERATE";
        } else {
            label = "LOW";
        }

        return {
            score: this.lastScore,
            label,
            factors: result.factors,
        };
    }

    /**
     * Get the current severity score
     */
    getScore(): number {
        return this.lastScore;
    }

    /**
     * Reset the tracker
     */
    reset(): void {
        this.lastScore = 10;
        this.peakScore = 10;
    }
}
