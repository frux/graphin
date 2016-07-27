import test from 'ava';
import Graphin from '../src';

test('Test placeholder', t => {
	const graphqlEndpoint = 'https://graphql.endpoint.com';
	const graphin = new Graphin(graphqlEndpoint);
	t.true(graphin instanceof Graphin);
});
