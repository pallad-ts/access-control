import {TypeCheck} from "@pallad/type-check";

export namespace Subject {
	/**
	 * Representation of global subject.
	 * It is sometimes useful to indicate that operation is performed on whole system.
	 */
	export class Global extends new TypeCheck<Global>('@pallad/access-control/Subject/Global').clazz {
		readonly kind = 'subject';
		readonly type = 'global';

		static INSTANCE = new Global();
	}
}
