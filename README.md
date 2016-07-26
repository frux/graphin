# Graphon
Isomorphic JavaScript GraphQL client

```js
import Graphon from 'graphon';

const graphon = new Graphon('https://my.graphql.endpoint.com');

// Simple GraphQL query
graphon.query(`{
	userList {
		login
		name
		email
	}
}`)
	.then(list => {
		console.log(list);
	});


// List of users cached for a minute
graphon.query(`{
	photoList {
		id
		url
		description
		width
		height
	}
}`, {cache: 60000})
	.then(list => {
		console.log(list);
	});

// Simple GraphQL mutation
graphon.mutation(`mutation {
	updatePhoto(id: 100500, description: "Photo of real Unicorn!") {
		id
	}
}`);
```

## API

### new Graphon(endpoint) => ``Graphon``

| Param | Type | Description |
| --- | --- | --- |
| endpoint | ``string`` | GraphQL endpoint URL |

-----------------

### graphon.query(url, options) ⇒ ``Promise``
Makes GraphQL Query

| Param | Type | Description |
| --- | --- | --- |
| url | ``string`` | GraphQL Query |
| options | ``object`` | Request options |
| options.cache | ``number`` | Cache TTL in ms |
| options.fetch | ``object`` | Fetch options |

-----------------

### graphon.mutation(url, options) ⇒ ``Promise``
Makes GraphQL Mutation

| Param | Type | Description |
| --- | --- | --- |
| url | ``string`` | GraphQL Query |
| options | ``object`` | Request options |
| options.cache | ``number`` | Cache TTL in ms |
| options.fetch | ``object`` | Fetch options |
