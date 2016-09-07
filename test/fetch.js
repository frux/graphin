import test from 'ava';
import Graphin from '../src';
import {mockFetch} from './fixtures/utils';

const graphqlEndpoint = 'https://graphql.endpoint.com';

function exampleQuery() {
	return `{
		test(time: ${Number(new Date())}, arg2: true){
			id
		}
	}`;
}

test('Initializing', t => {
	const graphin = new Graphin(graphqlEndpoint);
	t.true(graphin instanceof Graphin);
});

test('Fetching', t => {
	const fetcher = mockFetch({response: {data: true}});
	const graphin = new Graphin(graphqlEndpoint, {}, fetcher);
	t.plan(1);
	return graphin.query(exampleQuery())
		.then(response => t.true(response));
});

test(`Query options doesn't affect general options`, t => {
	const fetcher = mockFetch({response: {data: true}});
	const graphin = new Graphin(graphqlEndpoint, {}, fetcher);
	t.plan(1);
	return graphin.query(exampleQuery(), {cache: 100500})
		.then(() => {
			t.is(graphin._options.cache, false);
		});
});

test('Default Accept header should be application/json', t => {
	const fetcher = mockFetch({
		response: {data: true},
		assertions: (url, options) => {
			t.is(options.headers.Accept, 'application/json');
		}
	});
	const options = {
		fetch: {
			credentials: 'include'
		}
	};
	const graphin = new Graphin(graphqlEndpoint, options, fetcher);
	t.plan(1);
	return graphin.query('test');
});

test('Error', t => {
	const fetcher = mockFetch({
		code: 500,
		errors: [{message: 'error1'}]
	});
	const graphin = new Graphin(graphqlEndpoint, {}, fetcher);
	t.throws(graphin.query(exampleQuery()));
});
