import {Participant} from "./Participant";

export interface RuleInterface {

    supports(privilege: any, subject: any): boolean;

    isAllowed(participant: Participant, privilege: any, subject: any): Promise<boolean>|boolean;
}