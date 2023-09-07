import {TypeCheck} from "@pallad/type-check";

export namespace Principal {
	export class Anonymous extends new TypeCheck<Anonymous>('@pallad/access-control/Principal/Anonymous').clazz {
		readonly kind = 'principal';
		readonly type = 'anonymous'
		static INSTANCE = new Anonymous();
	}

	export class System extends new TypeCheck<System>('@pallad/access-control/Principal/System').clazz {
		readonly kind = 'principal';
		readonly type = 'system';

		static INSTANCE = new System();
	}
}
