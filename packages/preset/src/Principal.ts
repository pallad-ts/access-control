export namespace Principal {
    export class Anonymous {
        static INSTANCE = new Anonymous();

        static is(value: any): value is Anonymous {
            return value instanceof Anonymous;
        }
    }

    export class Account<T = any> {
        constructor(readonly account: T) {

        }

        static is<T = any>(value: any): value is Account<T> {
            return value instanceof Account;
        }
    }

    export class System {
        static INSTANCE = new System();

        static is(value: any): value is System {
            return value instanceof System;
        }
    }
}
