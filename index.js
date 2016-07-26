var fetch = require('fetch-ponyfill');

/**
 * @constructor
 */
function Graphon(endpoint, params) {
	params = params || {};

	if (typeof endpoint !== 'string') {
		throw new Error('The first argument must be a string containing GraphQL endpoint URL');
	}
	this._getQueryURL = function (query) {
		var inlineQuery = encodeURIComponent(query);
		return `${endpoint}?query=${inlineQuery}`;
	};
}

/**
 * Fetches query
 * @param {string} url – Url to fetch
 * @param {object} options – Request options
 * @param {'omit'|'same-origin'|'include'|undefined} oprions.credential – Should send cookies
 */
Graphon.prototype._fetch = function (url, options) {
	options = options || {};

	return fetch(url, options)
		.then(response => {
			if (!response.ok) {
				throw new Error(`Request error: ${response.statusText}`);
			}

			return response.json()
				.then(data => {
					if (data.errors) {
						throw new GraphonError(data.errors[0]);
					}
					return data.data;
				});
		});
};

/**
 * Fetches GraphQL Query
 * @param {string} url – Url to fetch
 * @param {object} options – Request options
 * @param {string} options.method – Request method. Default 'GET'.
 * @param {'omit'|'same-origin'|'include'|undefined} oprions.credential – Should send cookies. Default 'omit'.
 */
Graphon.prototype.query = function (query, options) {
	options = options || {};
	const fetchOptions = options.fetch || {};
	fetchOptions.method = fetchOptions.method || 'GET';
	fetchOptions.credential = fetchOptions.credential || 'omit';

	if (typeof query !== 'string') {
		throw new Error('Query must be a string');
	}

	return this._fetch(this._getQuery(query), fetchOptions);
};

/**
 * Fetches GraphQL Mutation
 * @param {string} url – Url to fetch
 * @param {string} options.method – Request method. Default 'POST'.
 * @param {'omit'|'same-origin'|'include'|undefined} oprions.credential – Should send cookies. Default 'omit'.
 */
Graphon.prototype.mutation = function (query, options) {
	options = options || {};
	const fetchOptions = options.fetch || {};
	fetchOptions.method = fetchOptions.method || 'POST';
	fetchOptions.credential = fetchOptions.credential || 'omit';

	if (typeof query !== 'string') {
		throw new Error('Query must be a string');
	}

	return this._fetch(this._getQuery(query), fetchOptions);
};

function GraphonCache(data, ttl) {
	this._data = data;
	this._timestamp = Number(new Date());
	this._ttl = ttl || 0;
}

GraphonCache.prototype.isOutdated = function () {

};

/**
 * @param {Error} err – GraphQL error object
 * @constructor
 */
function GraphonError(err) {
	Error.call(this, err.message);
}

module.exports = Graphon;
