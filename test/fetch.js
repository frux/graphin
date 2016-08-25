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
				return Promise.resolve(response);
			}
		});
	};
}

test('Initializing', t => {
	const graphin = new Graphin(graphqlEndpoint);
	t.true(graphin instanceof Graphin);
});

test('Fetch', async t => {
	const graphin = new Graphin(graphqlEndpoint, {verbose: true}, fetchMock(200, {
		data: true
	}));
	const response = await graphin.query(exampleQuery());
	t.truthy(response);
});

test('Error', t => {
	const graphin = new Graphin(graphqlEndpoint, {verbose: true}, fetchMock(502, {
		errors: [{message: 'error1'}]
	}));
	t.throws(graphin.query(exampleQuery()));
});
