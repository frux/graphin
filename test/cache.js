import test from 'ava';
import Graphin from '../src';

const graphqlEndpoint = 'https://graphql.endpoint.com';

function fetchMock(responseCode, response, assertions = () => {}) {
	return function (url, options) {
		assertions(url, options);
		return Promise.resolve({
			ok: responseCode === 200,
			json() {
				return Promise.resolve(response());
			}
		});
	};
}

test('General caching', t => {
	const graphin = new Graphin(graphqlEndpoint, {cache: 60000}, fetchMock(200, () => ({
		data: Number(new Date())
	})));
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
	const graphin = new Graphin(graphqlEndpoint, {cache: 100}, fetchMock(200, () => ({
		data: Number(new Date())
	})));

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
	const graphin = new Graphin(graphqlEndpoint, {}, fetchMock(200, () => ({
		data: Number(new Date())
	})));
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
