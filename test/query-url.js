import test from 'ava';
import Graphin from '../src';

const graphqlEndpoint = 'https://graphql.endpoint.com';
const graphin = new Graphin(graphqlEndpoint);

test('Simple query', t => {
	const query = `{
		photoList {
			id
			url:downloadUrl
			description
		}
	}`;
	t.is(graphin.getQueryURL(query), `${graphqlEndpoint}?query=%7B%0A%09%09photoList%20%7B%0A%09%09%09id%0A%09%09%09url%3AdownloadUrl%0A%09%09%09description%0A%09%09%7D%0A%09%7D`);
});
test('Empty query', t => {
	const query = '';
	t.is(graphin.getQueryURL(query), `${graphqlEndpoint}?query=`);
});
