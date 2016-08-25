# Graphin [![Build Status](https://travis-ci.org/frux/graphin.svg?branch=master)](https://travis-ci.org/frux/graphin) [![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
> Isomorphic JavaScript GraphQL client

```js
import Graphin from 'graphin';

const graphin = new Graphin('https://my.graphql.endpoint.com');

// Simple GraphQL query
graphin.query(`{
	userList {
		login
		name
		email
	}
}`)
	.then(list => {
		console.log(data.userList);
	});


// List of users cached for a minute
graphin.query(`{
	photoList {
		id
		url
		description
		width
		height
	}
}`, {cache: 60000})
	.then(data => {
		console.log(data.photoList);
	});

// Simple GraphQL mutation
graphin.query(`mutation {
	updatePhoto(id: 100500, description: "Photo of a real Unicorn!") {
		id
	}
}`);
```

## API

### new Graphin(endpoint, options, fetcher) ⇒ ``Graphin``

| Param | Type | Description |
| --- | --- | --- |
| endpoint | ``string`` | GraphQL endpoint URL |
| options | ``object|undefined`` | Graphin requests options. Default {} |
| options.cache | ``number`` | Cache TTL in ms |
| options.fetch | ``object`` | Fetch options |
| options.verbose | ``boolean`` | Verbose mode. Default false |
| fetcher | ``function|undefined`` | Fetch function (url, options) => Promise. Default fetch |

-----------------

### graphin.query(url, options) ⇒ ``Promise``
Makes GraphQL Query

| Param | Type | Description |
| --- | --- | --- |
| url | ``string`` | GraphQL Query |
| requestOptions | ``object|undefined`` | Request options. Default {} |
| requestOptions.cache | ``number`` | Cache TTL in ms |
| requestOptions.fetch | ``object`` | Fetch options |
| requestOptions.verbose | ``boolean`` | Verbose mode. Default false |

-----------------

### graphin.getQueryURL(query) ⇒ ``string``
Converts GraphQL query to URL

| Param | Type | Description |
| --- | --- | --- |
| query | ``string`` | GraphQL Query |
