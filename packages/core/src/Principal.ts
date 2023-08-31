export namespace Principal {
	export class Anonymous {
		static INSTANCE = new Anonymous();

		static is(value: any): value is Anonymous {
			return value instanceof Anonymous;
		}
	}

	export class System {
		static INSTANCE = new System();

		static is(value: any): value is System {
			return value instanceof System;
		}
	}
}
