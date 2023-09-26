import {TypeCheck} from "@pallad/type-check";

export namespace BasicPrincipal {
	/**
	 * Represents a principal that system cannot identify
	 */
	export class Anonymous extends new TypeCheck<Anonymous>('@pallad/access-control/Principal/Anonymous').clazz {
		readonly kind = 'principal';
		readonly type = 'anonymous'
		static INSTANCE = new Anonymous();
	}

	/**
	 * Represents a system principal with possibly the widest possible permissions
	 */
	export class UnsafeSystem extends new TypeCheck<UnsafeSystem>('@pallad/access-control/Principal/System').clazz {
		readonly kind = 'principal';
		readonly type = 'system';

		static INSTANCE = new UnsafeSystem();
	}
}
