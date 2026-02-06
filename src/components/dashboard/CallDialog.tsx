import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EmergencyContact, initiateCall } from "@/lib/EmergencyContacts";
import { ActionLogger } from "@/lib/ActionLogger";
import { Phone, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CallDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    contact: EmergencyContact;
    incidentId: string;
    incidentDescription: string;
    onCallCompleted?: () => void;
}

type CallStatus = "idle" | "initiating" | "calling" | "completed";

export function CallDialog({
    open,
    onOpenChange,
    contact,
    incidentId,
    incidentDescription,
    onCallCompleted,
}: CallDialogProps) {
    const [callStatus, setCallStatus] = useState<CallStatus>("idle");

    const handleConfirmCall = () => {
        // Set status to initiating
        setCallStatus("initiating");

        // Log the call initiation
        ActionLogger.log("CALL_INITIATED", incidentId, {
            contactName: contact.name,
            contactPhone: contact.phone,
            description: `Calling ${contact.name} for ${incidentDescription}`,
        });

        // Simulate brief delay for UX
        setTimeout(() => {
            setCallStatus("calling");

            // Initiate the actual call
            initiateCall(contact);

            // Log call completion after a moment
            setTimeout(() => {
                ActionLogger.log("CALL_COMPLETED", incidentId, {
                    contactName: contact.name,
                    contactPhone: contact.phone,
                });

                setCallStatus("completed");

                // Auto-close after showing success
                setTimeout(() => {
                    setCallStatus("idle");
                    onCallCompleted?.();
                    onOpenChange(false);
                }, 1500);
            }, 1000);
        }, 300);
    };

    const handleCancel = () => {
        setCallStatus("idle");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {callStatus === "completed" ? (
                            <CheckCircle2 className="w-5 h-5 text-safe" />
                        ) : (
                            <Phone className="w-5 h-5 text-critical" />
                        )}
                        {callStatus === "completed" ? "Call Initiated" : "Confirm Emergency Call"}
                    </DialogTitle>
                    <DialogDescription>
                        {callStatus === "completed"
                            ? "The emergency call has been initiated successfully."
                            : "You are about to initiate an emergency call."}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    {/* Contact Information */}
                    <div className="p-4 rounded-lg bg-accent/30 border border-accent">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-foreground">
                                {contact.name}
                            </span>
                            <span
                                className={cn(
                                    "text-xs font-bold px-2 py-0.5 rounded-full uppercase",
                                    contact.priority === "critical" && "badge-critical",
                                    contact.priority === "high" && "badge-warning",
                                    contact.priority === "medium" && "badge-info"
                                )}
                            >
                                {contact.priority}
                            </span>
                        </div>
                        <div className="text-2xl font-mono font-bold text-foreground mb-1">
                            {contact.phone}
                        </div>
                        {contact.description && (
                            <p className="text-xs text-muted-foreground">
                                {contact.description}
                            </p>
                        )}
                    </div>

                    {/* Incident Information */}
                    <div className="p-3 rounded-lg bg-warning/5 border border-warning/30">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs font-medium text-warning mb-1">
                                    Incident #{incidentId}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {incidentDescription}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Status Indicator */}
                    {callStatus !== "idle" && (
                        <div className="flex items-center justify-center gap-2 text-sm">
                            {callStatus === "initiating" && (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin text-info" />
                                    <span className="text-info">Initiating call...</span>
                                </>
                            )}
                            {callStatus === "calling" && (
                                <>
                                    <Phone className="w-4 h-4 text-warning animate-pulse" />
                                    <span className="text-warning">Dialing {contact.phone}...</span>
                                </>
                            )}
                            {callStatus === "completed" && (
                                <>
                                    <CheckCircle2 className="w-4 h-4 text-safe" />
                                    <span className="text-safe">Call initiated successfully</span>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {callStatus === "idle" ? (
                        <>
                            <Button variant="outline" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirmCall}
                                className="bg-critical hover:bg-critical/90 text-critical-foreground"
                            >
                                <Phone className="w-4 h-4 mr-2" />
                                Confirm Call
                            </Button>
                        </>
                    ) : callStatus === "completed" ? (
                        <Button onClick={() => onOpenChange(false)} className="w-full">
                            Close
                        </Button>
                    ) : null}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
