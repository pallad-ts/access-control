import {Subject} from "@src/Subject";

describe('Subject', () => {
	it('Global', () => {
		expect(Subject.Global.isType(Subject.Global.INSTANCE)).toBe(true);
		expect(Subject.Global.isType({})).toBe(false);
	});
});
