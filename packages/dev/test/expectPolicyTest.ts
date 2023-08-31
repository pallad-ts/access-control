import '@src/index';
import {ACCESS_QUERY, ACTION} from "./fixtures";
import * as sinon from 'sinon';

describe('expectPolicy', () => {
	describe('policyToAllow', () => {
		it('fails if provided value is not a function', () => {
			return expect(
				expect({})
					.policyToAllow(ACCESS_QUERY)
			)
				.rejects
				.toThrowErrorMatchingSnapshot();
		});

		it('fails if provided policy denies access for given query', async () => {
			const policy = sinon.stub().returns(false);
			await expect(
				expect(policy)
					.policyToAllow(ACCESS_QUERY)
			)
				.rejects
				.toThrowErrorMatchingSnapshot();
			sinon.assert.calledWith(policy, ACCESS_QUERY);
		});

		it('fails if provided policy abstain from voting', async () => {
			const policy = sinon.stub().returns(undefined);
			await expect(
				expect(policy)
					.policyToAllow(ACCESS_QUERY)
			)
				.rejects
				.toThrowErrorMatchingSnapshot();
			sinon.assert.calledWith(policy, ACCESS_QUERY);
		});

		it('success if provided policy allows access for given query', async () => {
			const policy = sinon.stub().returns(true);
			await expect(policy)
				.policyToAllow(ACCESS_QUERY);
			sinon.assert.calledWith(policy, ACCESS_QUERY);
		});
	});

	describe('policyToDeny', () => {
		it('fails if provided value is not a function', () => {
			return expect(
				expect({})
					.policyToDeny(ACCESS_QUERY)
			)
				.rejects
				.toThrowErrorMatchingSnapshot();
		});

		it('fails if provided policy abstain from voting', async () => {
			const policy = sinon.stub().returns(undefined);
			await expect(
				expect(policy)
					.policyToDeny(ACCESS_QUERY)
			)
				.rejects
				.toThrowErrorMatchingSnapshot();
			sinon.assert.calledWith(policy, ACCESS_QUERY);
		});

		it('fails if provided policy allows access for given query', async () => {
			const policy = sinon.stub().returns(true);
			const result = expect(policy)
				.policyToDeny(ACCESS_QUERY);
			await expect(
				result
			)
				.rejects
				.toThrowErrorMatchingSnapshot();
			sinon.assert.calledWith(policy, ACCESS_QUERY);
		});

		it('success if provided policy denies access for given query', async () => {
			const policy = sinon.stub().returns(false);
			await expect(policy)
				.policyToDeny(ACCESS_QUERY);
			sinon.assert.calledWith(policy, ACCESS_QUERY);
		});
	});
});
