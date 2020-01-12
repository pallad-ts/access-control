export interface Rule {
    supports(privilege: any, subject: any): boolean;

    isAllowed(participant: any, privilege: any, subject: any): Promise<boolean> | boolean;
}