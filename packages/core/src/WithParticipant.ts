export type WithParticipant<T> = T & { participant: any };

export function assignParticipantToObject<T = any>(participant: any, obj: T): WithParticipant<T> {
    return {
        ...obj,
        participant
    };
}