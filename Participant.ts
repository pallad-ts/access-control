export interface Participant {
    type: string
}

export class AnonymousParticipant implements Participant {
    static TYPE = 'anonymous';
    type = AnonymousParticipant.TYPE;
}

export class UserParticipant<T> implements Participant {
    static TYPE = 'user';

    type: string;

    constructor(public user: T) {
        this.type = UserParticipant.TYPE;
    }
}

export class SystemParticipant implements Participant {
    static TYPE = 'system';

    type = SystemParticipant.TYPE;
}