export type ActionType =
    | "CALL_INITIATED"
    | "CALL_COMPLETED"
    | "REPORT_GENERATED"
    | "UNIT_ALERTED"
    | "ACTION_COMPLETED";

export interface ActionLog {
    id: string;
    type: ActionType;
    timestamp: Date;
    incidentId: string;
    contactName?: string;
    contactPhone?: string;
    details?: string;
}

const STORAGE_KEY = "omnisense_action_logs";

export class ActionLogger {
    static log(
        type: ActionType,
        incidentId: string,
        details?: { contactName?: string; contactPhone?: string; description?: string }
    ): ActionLog {
        const log: ActionLog = {
            id: crypto.randomUUID(),
            type,
            timestamp: new Date(),
            incidentId,
            contactName: details?.contactName,
            contactPhone: details?.contactPhone,
            details: details?.description,
        };

        this.saveLog(log);
        return log;
    }

    private static saveLog(log: ActionLog): void {
        const logs = this.getLogs();
        logs.push(log);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    }

    static getLogs(incidentId?: string): ActionLog[] {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];

        const logs: ActionLog[] = JSON.parse(stored);

        if (incidentId) {
            return logs.filter(log => log.incidentId === incidentId);
        }

        return logs;
    }

    static clearLogs(incidentId?: string): void {
        if (incidentId) {
            const logs = this.getLogs();
            const filtered = logs.filter(log => log.incidentId !== incidentId);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }
}
