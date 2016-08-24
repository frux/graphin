import test from 'ava';
import Graphin from '../src';

const graphqlEndpoint = 'https://graphql.endpoint.com';

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
	const response = await graphin.query(`{
		test(arg1: "test", arg2: true){
			id
		}
	}`);
	t.truthy(response);
});
