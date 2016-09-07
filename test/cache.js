import test from 'ava';
import Graphin from '../src';
import {mockFetch} from './fixtures/utils';

const graphqlEndpoint = 'https://graphql.endpoint.com';
const fetcher = mockFetch({
	response: () => ({data: Number(new Date())})
});

test('General caching', t => {
	const graphin = new Graphin(graphqlEndpoint, {cache: 60000}, fetcher);

	let actual1;
	let actual2;

	t.plan(3);

	return graphin.query('test')
		.then(response => {
			actual1 = response;
			return graphin.query('test');
		})
		.then(response => {
			actual2 = response;
			t.true(isFinite(actual1));
			t.true(isFinite(actual2));
			t.true(actual1 === actual2);
		});
});

test('General cache expires', t => {
	const graphin = new Graphin(graphqlEndpoint, {cache: 100}, fetcher);

	t.plan(3);

	return new Promise(resolve => {
		graphin.query('test')
			.then(actual1 => {
				setTimeout(() => {
					graphin.query('test')
						.then(actual2 => {
							t.true(isFinite(actual1));
							t.true(isFinite(actual2));
							t.true(actual1 !== actual2);
							resolve();
						});
				}, 200);
			});
	});
});

test('General cache is disabled by default', t => {
	const graphin = new Graphin(graphqlEndpoint, {}, fetcher);

	let actual1;
	let actual2;

	t.plan(3);

	return graphin.query('test')
		.then(response => {
			actual1 = response;
			return graphin.query('test');
		})
		.then(response => {
			actual2 = response;
			t.true(isFinite(actual1));
			t.true(isFinite(actual2));
			t.true(actual1 !== actual2);
		});
});

test('Query caching', t => {
	const graphin = new Graphin(graphqlEndpoint, {}, fetcher);
	const queryOptions = {cache: 60000};

	let actual1;
	let actual2;

	t.plan(3);

	return graphin.query('test', queryOptions)
		.then(response => {
			actual1 = response;
			return graphin.query('test', queryOptions);
		})
		.then(response => {
			actual2 = response;
			t.true(isFinite(actual1));
			t.true(isFinite(actual2));
			t.true(actual1 === actual2);
		});
});

test('Query cache expires', t => {
	const graphin = new Graphin(graphqlEndpoint, {}, fetcher);
	const queryOptions = {cache: 100};

	t.plan(3);

	return new Promise(resolve => {
		graphin.query('test', queryOptions)
			.then(actual1 => {
				setTimeout(() => {
					graphin.query('test', queryOptions)
						.then(actual2 => {
							t.true(isFinite(actual1));
							t.true(isFinite(actual2));
							t.true(actual1 !== actual2);
							resolve();
						});
				}, 200);
			});
	});
});

test('Query cache is disabled by default', t => {
	const graphin = new Graphin(graphqlEndpoint, {}, fetcher);
	const queryOptions = {};

	let actual1;
	let actual2;

	t.plan(3);

	return graphin.query('test', queryOptions)
		.then(response => {
			actual1 = response;
			return graphin.query('test', queryOptions);
		})
		.then(response => {
			actual2 = response;
			t.true(isFinite(actual1));
			t.true(isFinite(actual2));
			t.true(actual1 !== actual2);
		});
});
