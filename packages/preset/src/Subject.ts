export namespace Subject {
	/**
	 * Global subject representation.
	 * It is sometimes useful to indicate that operation is performed on whole system.
	 */
	export class Global {
		static INSTANCE = new Global();

		static is(value: any): value is Global {
			return value instanceof Global;
		}
	}

	/**
	 * Organization subject.
	 * Means that permission is being tested directly on Organization.
	 */
	export class Organization<T = unknown> {
		constructor(readonly id: T) {
		}

		static is<T = any>(value: any): value is Organization<T> {
			return value instanceof Organization;
		}
	}

	/**
	 * Within organization subject.
	 * Means that permission is being test on some entity (of given type) within given organization
	 */
	export class WithinOrganization<TId = any, TPayload = any> {
		constructor(readonly entityType: string,
					readonly organizationId: TId,
					readonly payload: TPayload) {

		}

		static is<TId = any, TPayload = any>(value: any): value is WithinOrganization<TId, TPayload> {
			return value instanceof WithinOrganization;
		}

		static isForEntity<TId = any, TPayload = any>(value: any, entityType: string): value is WithinOrganization<TId, TPayload> {
			return WithinOrganization.is(value) && value.entityType === entityType;
		}
	}

	/**
	 * Within scope subject.
	 *
	 * Similar to WithinOrganization subject but this one is more abstract and does not specify what is the scope.
	 * Might be anything like:
	 * - workspace
	 * - user application
	 */
	export class WithinScope<TId = any, TPayload = any> {
		constructor(readonly entityType: string,
					readonly scopeId: TId,
					readonly payload: TPayload) {
		}
	}
}
