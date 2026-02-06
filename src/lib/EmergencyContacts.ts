export type ContactType = "ems" | "police" | "fire" | "security" | "witness" | "supervisor";

export interface EmergencyContact {
    id: string;
    name: string;
    phone: string;
    type: ContactType;
    priority: "critical" | "high" | "medium" | "low";
    description?: string;
}

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
    {
        id: "ems",
        name: "Emergency Medical Services",
        phone: "112",
        type: "ems",
        priority: "critical",
        description: "Ambulance and medical emergencies"
    },
    {
        id: "police",
        name: "Police Emergency Line",
        phone: "112",
        type: "police",
        priority: "critical",
        description: "Law enforcement and security threats"
    },
    {
        id: "fire",
        name: "Fire Department",
        phone: "112",
        type: "fire",
        priority: "critical",
        description: "Fire emergencies and hazardous situations"
    },
    {
        id: "security",
        name: "Security Patrol Unit",
        phone: "+91 123445656656",
        type: "security",
        priority: "high",
        description: "On-site security and patrol services"
    },
];

export function getContactByType(type: ContactType): EmergencyContact | undefined {
    return EMERGENCY_CONTACTS.find(contact => contact.type === type);
}

export function getContactById(id: string): EmergencyContact | undefined {
    return EMERGENCY_CONTACTS.find(contact => contact.id === id);
}

export function initiateCall(contact: EmergencyContact): void {
    // Use tel: protocol for phone calls
    // Works on mobile devices and desktop apps (Skype, Teams, etc.)
    window.location.href = `tel:${contact.phone}`;
}
