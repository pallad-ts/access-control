export interface AccessQuery<TPrincipal = unknown, TAction extends string = string, TSubject = unknown> {
    principal: TPrincipal;
    action: TAction;
    subject: TSubject;
}
