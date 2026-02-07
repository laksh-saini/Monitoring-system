import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface IncidentData {
    incidentId: string;
    title: string;
    description: string;
    timestamp: Date;
    severityScore: number;
    evidenceScores: {
        visual: number;
        audio: number;
        textReports: number;
    };
    actionsCompleted: string[];
    location?: string;
}

export class IncidentReportGenerator {
    private doc: jsPDF;

    constructor() {
        this.doc = new jsPDF();
    }

    generate(data: IncidentData): void {
        this.addHeader(data);
        this.addIncidentOverview(data);
        this.addSeverityAnalysis(data);
        this.addEvidenceScores(data);
        this.addActionsLog(data);
        this.addFooter();

        // Download the PDF
        this.doc.save(`Incident_${data.incidentId}_Report.pdf`);
    }

    private addHeader(data: IncidentData): void {
        // Logo/Title
        this.doc.setFontSize(24);
        this.doc.setTextColor(33, 37, 41);
        this.doc.text("🛡️ OmniSense AI", 20, 20);

        this.doc.setFontSize(10);
        this.doc.setTextColor(108, 117, 125);
        this.doc.text("Incident Analysis Report", 20, 28);

        // Incident ID Badge
        this.doc.setFillColor(220, 53, 69);
        this.doc.roundedRect(150, 15, 45, 10, 2, 2, "F");
        this.doc.setFontSize(10);
        this.doc.setTextColor(255, 255, 255);
        this.doc.text(`Incident #${data.incidentId}`, 155, 21);

        // Date
        this.doc.setFontSize(9);
        this.doc.setTextColor(108, 117, 125);
        this.doc.text(`Generated: ${data.timestamp.toLocaleString()}`, 150, 28);

        // Line separator
        this.doc.setDrawColor(222, 226, 230);
        this.doc.line(20, 35, 190, 35);
    }

    private addIncidentOverview(data: IncidentData): void {
        let yPos = 45;

        this.doc.setFontSize(14);
        this.doc.setTextColor(33, 37, 41);
        this.doc.text("Incident Overview", 20, yPos);

        yPos += 8;
        this.doc.setFontSize(10);
        this.doc.setTextColor(73, 80, 87);

        // Title
        this.doc.setFont("helvetica", "bold");
        this.doc.text("Title:", 20, yPos);
        this.doc.setFont("helvetica", "normal");
        this.doc.text(data.title, 45, yPos);

        yPos += 6;

        // Description
        this.doc.setFont("helvetica", "bold");
        this.doc.text("Description:", 20, yPos);
        this.doc.setFont("helvetica", "normal");

        const descLines = this.doc.splitTextToSize(data.description, 140);
        this.doc.text(descLines, 45, yPos);
        yPos += descLines.length * 5 + 5;

        if (data.location) {
            this.doc.setFont("helvetica", "bold");
            this.doc.text("Location:", 20, yPos);
            this.doc.setFont("helvetica", "normal");
            this.doc.text(data.location, 45, yPos);
            yPos += 6;
        }
    }

    private addSeverityAnalysis(data: IncidentData): void {
        let yPos = this.doc.internal.pageSize.height / 3 + 10;

        this.doc.setFontSize(14);
        this.doc.setTextColor(33, 37, 41);
        this.doc.text("Severity Analysis", 20, yPos);

        yPos += 10;

        // Severity Score Box
        const scoreColor = this.getSeverityColor(data.severityScore);
        this.doc.setFillColor(scoreColor.r, scoreColor.g, scoreColor.b, 0.1);
        this.doc.roundedRect(20, yPos, 170, 25, 3, 3, "F");

        // Score
        this.doc.setFontSize(32);
        this.doc.setTextColor(scoreColor.r, scoreColor.g, scoreColor.b);
        this.doc.text(data.severityScore.toString(), 30, yPos + 18);

        // Severity Label
        this.doc.setFontSize(12);
        this.doc.text(this.getSeverityLabel(data.severityScore), 60, yPos + 12);

        // Progress bar
        const barWidth = 100;
        const barHeight = 6;
        const barX = 60;
        const barY = yPos + 16;

        this.doc.setFillColor(233, 236, 239);
        this.doc.roundedRect(barX, barY, barWidth, barHeight, 3, 3, "F");

        const progressWidth = (data.severityScore / 100) * barWidth;
        this.doc.setFillColor(scoreColor.r, scoreColor.g, scoreColor.b);
        this.doc.roundedRect(barX, barY, progressWidth, barHeight, 3, 3, "F");

    }

    private addEvidenceScores(data: IncidentData): void {
        let yPos = 160;

        this.doc.setFontSize(14);
        this.doc.setTextColor(33, 37, 41);
        this.doc.text("Evidence Confidence", 20, yPos);

        yPos += 8;

        // Table
        autoTable(this.doc, {
            startY: yPos,
            head: [["Evidence Type", "Confidence Score", "Status"]],
            body: [
                [
                    "Visual Analysis",
                    `${data.evidenceScores.visual}%`,
                    this.getScoreStatus(data.evidenceScores.visual),
                ],
                [
                    "Audio Analysis",
                    `${data.evidenceScores.audio}%`,
                    this.getScoreStatus(data.evidenceScores.audio),
                ],
                [
                    "Text Reports",
                    `${data.evidenceScores.textReports}%`,
                    this.getScoreStatus(data.evidenceScores.textReports),
                ],
            ],
            theme: "grid",
            headStyles: {
                fillColor: [108, 117, 125],
                fontSize: 10,
            },
            styles: {
                fontSize: 9,
            },
            columnStyles: {
                0: { cellWidth: 70 },
                1: { cellWidth: 50, halign: "center" },
                2: { cellWidth: 50, halign: "center" },
            },
        });
    }

    private addActionsLog(data: IncidentData): void {
        let yPos = (this.doc as any).lastAutoTable.finalY + 15;

        this.doc.setFontSize(14);
        this.doc.setTextColor(33, 37, 41);
        this.doc.text("Actions Taken", 20, yPos);

        yPos += 8;

        if (data.actionsCompleted.length > 0) {
            data.actionsCompleted.forEach((action, index) => {
                this.doc.setFontSize(10);
                this.doc.setTextColor(40, 167, 69);
                this.doc.text("✓", 20, yPos);
                this.doc.setTextColor(73, 80, 87);
                this.doc.text(action, 28, yPos);
                yPos += 6;
            });
        } else {
            this.doc.setFontSize(10);
            this.doc.setTextColor(108, 117, 125);
            this.doc.text("No actions completed yet.", 20, yPos);
        }
    }

    private addFooter(): void {
        const pageHeight = this.doc.internal.pageSize.height;

        this.doc.setDrawColor(222, 226, 230);
        this.doc.line(20, pageHeight - 20, 190, pageHeight - 20);

        this.doc.setFontSize(8);
        this.doc.setTextColor(108, 117, 125);
        this.doc.text(
            "This report was generated by OmniSense AI - Automated Incident Analysis System",
            105,
            pageHeight - 15,
            { align: "center" }
        );
        this.doc.text(
            `Page 1 of 1 | Confidential`,
            105,
            pageHeight - 10,
            { align: "center" }
        );
    }

    private getSeverityColor(score: number): { r: number; g: number; b: number } {
        if (score >= 75) return { r: 220, g: 53, b: 69 }; // Critical - Red
        if (score >= 50) return { r: 255, g: 193, b: 7 }; // Warning - Yellow
        return { r: 40, g: 167, b: 69 }; // Safe - Green
    }

    private getSeverityLabel(score: number): string {
        if (score >= 75) return "CRITICAL SEVERITY";
        if (score >= 50) return "MODERATE SEVERITY";
        return "LOW SEVERITY";
    }

    private getScoreStatus(score: number): string {
        if (score >= 80) return "High";
        if (score >= 60) return "Medium";
        return "Low";
    }
}

// Helper function to generate report
export function generateIncidentReport(data: IncidentData): void {
    const generator = new IncidentReportGenerator();
    generator.generate(data);
}
