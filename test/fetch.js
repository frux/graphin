import test from 'ava';
import Graphin from '../src';

const graphqlEndpoint = 'https://graphql.endpoint.com';

function exampleQuery() {
	return `{
		test(time: ${Number(new Date())}, arg2: true){
			id
		}
	}`;
}

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

test('Initializing', t => {
	const graphin = new Graphin(graphqlEndpoint);
	t.true(graphin instanceof Graphin);
});

test('Fetch', t => {
	const graphin = new Graphin(graphqlEndpoint, {}, fetchMock(200, () => ({
		data: true
	})));
	t.plan(1);
	return graphin.query(exampleQuery())
		.then(response => t.true(response));
});

test('Query options doesn\'t affect general options', t => {
	const graphin = new Graphin(graphqlEndpoint, {}, fetchMock(200, () => ({
		data: true
	})));
	t.plan(1);
	return graphin.query(exampleQuery(), {cache: 100500})
		.then(() => t.is(graphin._options.cache, false));
});

test('Error', t => {
	const graphin = new Graphin(graphqlEndpoint, {}, fetchMock(502, () => ({
		errors: [{message: 'error1'}]
	})));
	t.throws(graphin.query(exampleQuery()));
});
