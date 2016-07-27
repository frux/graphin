# Graphin
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
graphin.mutation(`mutation {
	updatePhoto(id: 100500, description: "Photo of a real Unicorn!") {
		id
	}
}`);
```

## API

### new Graphin(endpoint) ⇒ ``Graphin``

| Param | Type | Description |
| --- | --- | --- |
| endpoint | ``string`` | GraphQL endpoint URL |

-----------------

### graphin.query(url, options) ⇒ ``Promise``
Makes GraphQL Query

| Param | Type | Description |
| --- | --- | --- |
| url | ``string`` | GraphQL Query |
| options | ``object`` | Request options |
| options.cache | ``number`` | Cache TTL in ms |
| options.fetch | ``object`` | Fetch options |

-----------------

### graphin.mutation(url, options) ⇒ ``Promise``
Makes GraphQL Mutation

| Param | Type | Description |
| --- | --- | --- |
| url | ``string`` | GraphQL Query |
| options | ``object`` | Request options |
| options.cache | ``number`` | Cache TTL in ms |
| options.fetch | ``object`` | Fetch options |
