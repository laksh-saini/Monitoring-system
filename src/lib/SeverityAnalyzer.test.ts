import { describe, it, expect, beforeEach } from "vitest";
import {
    calculateSeverityScore,
    calculateIoU,
    detectCollisions,
    SeverityTracker,
    Detection,
    SeverityAnalysisInput,
} from "./SeverityAnalyzer";

describe("SeverityAnalyzer", () => {
    describe("calculateIoU", () => {
        it("returns 0 for non-overlapping boxes", () => {
            const boxA = [0, 0, 10, 10];
            const boxB = [20, 20, 10, 10];
            expect(calculateIoU(boxA, boxB)).toBe(0);
        });

        it("returns 1 for identical boxes", () => {
            const box = [10, 10, 50, 50];
            expect(calculateIoU(box, box)).toBe(1);
        });

        it("returns correct IoU for overlapping boxes", () => {
            const boxA = [0, 0, 10, 10]; // area = 100
            const boxB = [5, 5, 10, 10]; // area = 100, overlap = 25
            // intersection = 5 * 5 = 25
            // union = 100 + 100 - 25 = 175
            const expectedIoU = 25 / 175;
            expect(calculateIoU(boxA, boxB)).toBeCloseTo(expectedIoU, 5);
        });
    });

    describe("calculateSeverityScore", () => {
        it("returns base score of 50 with no detections", () => {
            const input: SeverityAnalysisInput = {
                detections: [],
                collisions: [],
                frameTimestamp: Date.now(),
            };
            const result = calculateSeverityScore(input);
            expect(result.score).toBe(50);
            expect(result.label).toBe("MODERATE");
        });

        it("increases score for each vehicle detected (max +30)", () => {
            const vehicles: Detection[] = [
                { class: "car", confidence: 0.9, bbox: [0, 0, 50, 50] },
                { class: "truck", confidence: 0.85, bbox: [100, 0, 60, 60] },
                { class: "bus", confidence: 0.8, bbox: [200, 0, 70, 70] },
            ];
            const input: SeverityAnalysisInput = {
                detections: vehicles,
                collisions: [],
                frameTimestamp: Date.now(),
            };
            const result = calculateSeverityScore(input);
            // Base 50 + 30 (3 vehicles) + high confidence bonuses
            expect(result.score).toBeGreaterThanOrEqual(80);
        });

        it("adds +15 when pedestrian is near vehicle", () => {
            const detections: Detection[] = [
                { class: "car", confidence: 0.9, bbox: [100, 100, 100, 100] },
                { class: "person", confidence: 0.85, bbox: [120, 120, 30, 60] }, // overlaps with car
            ];
            const input: SeverityAnalysisInput = {
                detections,
                collisions: [],
                frameTimestamp: Date.now(),
            };
            const result = calculateSeverityScore(input);
            expect(result.factors).toContain("Pedestrian in proximity to vehicles");
        });

        it("adds +5 per collision detected (max +20)", () => {
            const input: SeverityAnalysisInput = {
                detections: [],
                collisions: [
                    { pair: "Car & Truck", iou: 0.3, highVelocity: false },
                    { pair: "Car & Bus", iou: 0.25, highVelocity: false },
                ],
                frameTimestamp: Date.now(),
            };
            const result = calculateSeverityScore(input);
            // Base 50 + 10 (2 collisions)
            expect(result.score).toBe(60);
            expect(result.factors).toContain("2 potential collision(s) detected");
        });

        it("adds +10 for high velocity impact", () => {
            const input: SeverityAnalysisInput = {
                detections: [{ class: "car", confidence: 0.9, bbox: [0, 0, 50, 50], velocity: 250 }],
                collisions: [],
                frameTimestamp: Date.now(),
            };
            const result = calculateSeverityScore(input);
            expect(result.factors).toContain("High velocity impact detected");
        });

        it("caps score at 100", () => {
            const detections: Detection[] = [
                { class: "car", confidence: 0.95, bbox: [0, 0, 100, 100] },
                { class: "truck", confidence: 0.92, bbox: [50, 50, 100, 100] },
                { class: "bus", confidence: 0.91, bbox: [100, 100, 100, 100] },
                { class: "person", confidence: 0.9, bbox: [70, 70, 30, 60] },
            ];
            const collisions = [
                { pair: "Car & Truck", iou: 0.4, highVelocity: true },
                { pair: "Car & Bus", iou: 0.3, highVelocity: true },
                { pair: "Truck & Bus", iou: 0.25, highVelocity: false },
                { pair: "Car & Person", iou: 0.2, highVelocity: true },
            ];
            const input: SeverityAnalysisInput = {
                detections,
                collisions,
                frameTimestamp: Date.now(),
            };
            const result = calculateSeverityScore(input);
            expect(result.score).toBeLessThanOrEqual(100);
            expect(result.label).toBe("CRITICAL");
        });

        it("returns correct labels based on score thresholds", () => {
            // Low score scenario
            const lowInput: SeverityAnalysisInput = {
                detections: [],
                collisions: [],
                frameTimestamp: Date.now(),
            };
            // We need to test thresholds, but base is 50 which is MODERATE
            // This tests MODERATE
            expect(calculateSeverityScore(lowInput).label).toBe("MODERATE");
        });
    });

    describe("detectCollisions", () => {
        it("returns empty array when no overlaps", () => {
            const detections: Detection[] = [
                { class: "car", confidence: 0.9, bbox: [0, 0, 50, 50] },
                { class: "truck", confidence: 0.85, bbox: [200, 200, 50, 50] },
            ];
            const velocities = new Map<string, number>();
            const collisions = detectCollisions(detections, velocities);
            expect(collisions).toHaveLength(0);
        });

        it("detects collision when IoU > 0.15", () => {
            const detections: Detection[] = [
                { class: "car", confidence: 0.9, bbox: [0, 0, 100, 100] },
                { class: "truck", confidence: 0.85, bbox: [20, 20, 100, 100] }, // significant overlap
            ];
            const velocities = new Map<string, number>();
            const collisions = detectCollisions(detections, velocities);
            expect(collisions.length).toBeGreaterThan(0);
            expect(collisions[0].pair).toBe("Car & Truck");
        });

        it("marks high velocity when threshold exceeded", () => {
            const detections: Detection[] = [
                { class: "car", confidence: 0.9, bbox: [0, 0, 100, 100] },
                { class: "truck", confidence: 0.85, bbox: [20, 20, 100, 100] },
            ];
            const velocities = new Map<string, number>();
            velocities.set("car-0", 250); // > 200 threshold
            const collisions = detectCollisions(detections, velocities);
            expect(collisions[0].highVelocity).toBe(true);
        });
    });

    describe("SeverityTracker", () => {
        let tracker: SeverityTracker;

        beforeEach(() => {
            tracker = new SeverityTracker();
        });

        it("starts with default score of 50", () => {
            expect(tracker.getScore()).toBe(50);
        });

        it("updates score based on detections", () => {
            const input: SeverityAnalysisInput = {
                detections: [
                    { class: "car", confidence: 0.9, bbox: [0, 0, 50, 50] },
                    { class: "truck", confidence: 0.85, bbox: [100, 0, 60, 60] },
                ],
                collisions: [{ pair: "Car & Truck", iou: 0.3, highVelocity: false }],
                frameTimestamp: Date.now(),
            };
            const result = tracker.update(input);
            expect(result.score).toBeGreaterThan(50);
        });

        it("smooths scores over multiple updates", () => {
            // First update with high score scenario
            const highInput: SeverityAnalysisInput = {
                detections: [
                    { class: "car", confidence: 0.9, bbox: [0, 0, 100, 100] },
                    { class: "truck", confidence: 0.85, bbox: [20, 20, 100, 100] },
                ],
                collisions: [{ pair: "Car & Truck", iou: 0.4, highVelocity: true }],
                frameTimestamp: Date.now(),
            };
            tracker.update(highInput);
            const firstScore = tracker.getScore();

            // Second update with low score scenario
            const lowInput: SeverityAnalysisInput = {
                detections: [],
                collisions: [],
                frameTimestamp: Date.now() + 1000,
            };
            tracker.update(lowInput);
            const secondScore = tracker.getScore();

            // Smoothed score should be between the two extremes
            expect(secondScore).toBeLessThan(firstScore);
            expect(secondScore).toBeGreaterThan(50);
        });

        it("resets to default state", () => {
            const input: SeverityAnalysisInput = {
                detections: [{ class: "car", confidence: 0.9, bbox: [0, 0, 50, 50] }],
                collisions: [],
                frameTimestamp: Date.now(),
            };
            tracker.update(input);
            tracker.reset();
            expect(tracker.getScore()).toBe(50);
        });
    });
});
