export namespace Subject {
    /**
     * Global subject representation.
     * It is sometimes useful to indicate that operation is performed on whole system.
     */
    export class Global {
        readonly type = 'global-subject';
        static INSTANCE = new Global();

        static is(value: unknown): value is Global {
            return value instanceof Global;
        }
    }
}
