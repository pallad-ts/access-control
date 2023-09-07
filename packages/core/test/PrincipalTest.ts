import {Principal} from "@src/Principal";

describe('Principal', () => {
	it('Anonymous', () => {
		expect(Principal.Anonymous.isType(Principal.Anonymous.INSTANCE))
			.toBe(true);

		expect(Principal.Anonymous.isType(Principal.System.INSTANCE))
			.toBe(false);

		expect(Principal.Anonymous.isType({}))
			.toBe(false);
	});

	it('System', () => {
		expect(Principal.System.isType(Principal.System.INSTANCE))
			.toBe(true);

		expect(Principal.System.isType(Principal.Anonymous.INSTANCE))
			.toBe(false);

		expect(Principal.System.isType({}))
			.toBe(false);
	});
});
