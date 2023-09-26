export class ScopeWorkspace {
	readonly kind = 'scope';
	readonly type = 'workspace';

	constructor(readonly workspaceId: number) {
		Object.freeze(this);
	}
}

export class ScopeUnsafeGlobal {
	readonly kind = 'scope';

	readonly type = 'unsafe-global';
	static INSTANCE = new ScopeUnsafeGlobal();

	constructor() {
		Object.freeze(this);
	}
}
