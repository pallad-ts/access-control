import {StubMatcher} from "@src/StubMatcher";
import {ACCESS_QUERY, ACTION, ACTION_2, PRINCIPAL, PRINCIPAL_2, SUBJECT, SUBJECT_2} from "./fixtures";

describe('StubMatcher', () => {

	let matcher: StubMatcher;
	beforeEach(() => {
		matcher = new StubMatcher();
	});

	describe('matching access query', () => {
		it('it is impossible to match access query if none of access query parts matcher is defined', () => {
			expect(() => {
				matcher.matchAccessQuery({
					principal: PRINCIPAL,
					subject: SUBJECT,
					action: ACTION
				})
			})
				.toThrowErrorMatchingSnapshot();
		});
	});

	it('anyAccessQuery effectively allow everything', () => {
		matcher.anyAccessQuery();

		expect(matcher.matchAccessQuery({
			principal: Math.random(),
			action: String(Math.random()),
			subject: Math.random()
		}))
			.toBe(true);
	});

	describe('defining principal', () => {
		beforeEach(() => {
			matcher.subject(SUBJECT)
				.action(ACTION);
		});

		it('fails if principal matcher is not defined', () => {
			expect(() => {
				matcher.matchAccessQuery(ACCESS_QUERY);
			})
				.toThrowErrorMatchingSnapshot();
		});

		it('anyPrincipal cause to match any principal', () => {
			matcher.anyPrincipal();

			expect(matcher.matchAccessQuery({
				action: ACTION,
				subject: SUBJECT,
				principal: Math.random()
			}))
				.toBe(true);
		});

		it('principal matching by deep equality comparison', () => {
			matcher.principal({
				some: 'principal'
			})

			expect(matcher.matchAccessQuery({
				subject: SUBJECT,
				action: ACTION,
				principal: {some: 'principal'}
			}))
				.toBe(true);

			expect(matcher.matchAccessQuery({
				subject: SUBJECT,
				action: ACTION,
				principal: {some: 'principal', withUnnecessary: 'property'}
			}))
				.toBe(false);
		});

		it('multiple principals', () => {
			matcher.principal(PRINCIPAL, PRINCIPAL_2)

			expect(matcher.matchAccessQuery({
				subject: SUBJECT,
				action: ACTION,
				principal: PRINCIPAL
			}))
				.toBe(true);
			expect(matcher.matchAccessQuery({
				subject: SUBJECT,
				action: ACTION,
				principal: PRINCIPAL_2
			}))
				.toBe(true);

			expect(matcher.matchAccessQuery({
				subject: SUBJECT,
				action: ACTION,
				principal: {}
			}))
				.toBe(false);
		});

		it('principal matching by predicate', () => {
			matcher.principal((x: any) => x.some === 'principal')

			expect(matcher.matchAccessQuery({
				subject: SUBJECT,
				action: ACTION,
				principal: {some: 'principal'}
			}))
				.toBe(true);

			expect(matcher.matchAccessQuery({
				subject: SUBJECT,
				action: ACTION,
				principal: {some: 'principal', withUnnecessary: 'property'}
			}))
				.toBe(true);
		})
	});

	describe('defining action', () => {
		beforeEach(() => {
			matcher.subject(SUBJECT)
				.principal(PRINCIPAL);
		});

		it('fails if action matcher is not defined', () => {
			expect(() => {
				matcher.matchAccessQuery(ACCESS_QUERY);
			})
				.toThrowErrorMatchingSnapshot();
		});

		it('anyAction cause to match any action', () => {
			matcher.anyAction();

			expect(matcher.matchAccessQuery({
				action: String(Math.random()),
				subject: SUBJECT,
				principal: PRINCIPAL,
			}))
				.toBe(true);
		});

		it('action matching by strict equality comparison', () => {
			matcher.action('some-action')

			expect(matcher.matchAccessQuery({
				subject: SUBJECT,
				action: 'some-action',
				principal: PRINCIPAL
			}))
				.toBe(true);

			expect(matcher.matchAccessQuery({
				subject: SUBJECT,
				action: 'different-action',
				principal: PRINCIPAL
			}))
				.toBe(false);
		});

		it('multiple actions', () => {
			matcher.action(ACTION, ACTION_2)

			expect(matcher.matchAccessQuery({
				subject: SUBJECT,
				action: ACTION,
				principal: PRINCIPAL
			}))
				.toBe(true);

			expect(matcher.matchAccessQuery({
				subject: SUBJECT,
				action: ACTION_2,
				principal: PRINCIPAL
			}))
				.toBe(true);

			expect(matcher.matchAccessQuery({
				subject: SUBJECT,
				action: 'random-action',
				principal: PRINCIPAL
			}))
				.toBe(false);
		});

		it('action matching by predicate', () => {
			matcher.action(x => x.startsWith('foo_'))

			expect(matcher.matchAccessQuery({
				subject: SUBJECT,
				action: 'foo_zee',
				principal: PRINCIPAL
			}))
				.toBe(true);

			expect(matcher.matchAccessQuery({
				subject: SUBJECT,
				action: 'foo_bar',
				principal: PRINCIPAL
			}))
				.toBe(true);

			expect(matcher.matchAccessQuery({
				subject: SUBJECT,
				action: 'bar_foo',
				principal: PRINCIPAL
			}))
				.toBe(false);
		});
	});

	describe('defining subject', () => {
		beforeEach(() => {
			matcher.action(ACTION)
				.principal(PRINCIPAL);
		});

		it('fails if subject matcher is not defined', () => {
			expect(() => {
				matcher.matchAccessQuery(ACCESS_QUERY);
			})
				.toThrowErrorMatchingSnapshot();
		});

		it('anySubject cause to match any subject', () => {
			matcher.anySubject();

			expect(matcher.matchAccessQuery({
				action: ACTION,
				subject: Math.random(),
				principal: PRINCIPAL,
			}))
				.toBe(true);
		});

		it('subject matching by deep equality comparison', () => {
			matcher.subject({some: 'subject'})

			expect(matcher.matchAccessQuery({
				subject: {some: 'subject'},
				action: ACTION,
				principal: PRINCIPAL
			}))
				.toBe(true);

			expect(matcher.matchAccessQuery({
				subject: {some: 'subject', unnecessaryProperty: 'value'},
				action: ACTION,
				principal: PRINCIPAL
			}))
				.toBe(false);
		});

		it('multiple subjects', () => {
			matcher.subject(SUBJECT, SUBJECT_2)

			expect(matcher.matchAccessQuery({
				subject: SUBJECT,
				action: ACTION,
				principal: PRINCIPAL
			}))
				.toBe(true);

			expect(matcher.matchAccessQuery({
				subject: SUBJECT_2,
				action: ACTION,
				principal: PRINCIPAL
			}))
				.toBe(true);

			expect(matcher.matchAccessQuery({
				subject: {},
				action: ACTION,
				principal: PRINCIPAL
			}))
				.toBe(false);
		});

		it('subject matching by predicate', () => {
			matcher.subject((x: any) => x.some === 'subject')
			expect(matcher.matchAccessQuery({
				subject: {some: 'subject'},
				action: ACTION,
				principal: PRINCIPAL
			}))
				.toBe(true);

			expect(matcher.matchAccessQuery({
				subject: {some: 'subject', unnecessaryProperty: 'value'},
				action: ACTION,
				principal: PRINCIPAL
			}))
				.toBe(true);
		});
	});
});
