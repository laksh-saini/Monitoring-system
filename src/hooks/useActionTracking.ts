import { useState, useEffect, useCallback } from "react";

export interface ActionItem {
    id: string;
    label: string;
    completed: boolean;
    completedAt?: Date;
}

const STORAGE_KEY_PREFIX = "omnisense_actions_";

export function useActionTracking(incidentId: string, totalActions: number) {
    const storageKey = `${STORAGE_KEY_PREFIX}${incidentId}`;

    const [completedActions, setCompletedActions] = useState<Set<string>>(() => {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            try {
                return new Set(JSON.parse(stored));
            } catch {
                return new Set();
            }
        }
        return new Set();
    });

    // Persist to localStorage whenever completedActions changes
    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(completedActions)));
    }, [completedActions, storageKey]);

    const completeAction = useCallback((actionId: string) => {
        setCompletedActions(prev => {
            const newSet = new Set(prev);
            newSet.add(actionId);
            return newSet;
        });
    }, []);

    const uncompleteAction = useCallback((actionId: string) => {
        setCompletedActions(prev => {
            const newSet = new Set(prev);
            newSet.delete(actionId);
            return newSet;
        });
    }, []);

    const isCompleted = useCallback((actionId: string) => {
        return completedActions.has(actionId);
    }, [completedActions]);

    const completionCount = completedActions.size;
    const completionPercentage = totalActions > 0 ? Math.round((completionCount / totalActions) * 100) : 0;

    const resetActions = useCallback(() => {
        setCompletedActions(new Set());
        localStorage.removeItem(storageKey);
    }, [storageKey]);

    return {
        completedActions,
        completeAction,
        uncompleteAction,
        isCompleted,
        completionCount,
        completionPercentage,
        resetActions,
    };
}
