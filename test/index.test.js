import test from 'ava';
import Graphon from '../index';

test('Test placeholder', t => {
	const graphqlEndpoint = 'https://graphql.endpoint.com';
	const graphon = new Graphon(graphqlEndpoint);
	t.true(graphon instanceof Graphon);
});
