var fetch = require('fetch-ponyfill');

/**
 * Graphon class
 * @param {string} endpoint – GraphQL endpoint URL
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

	this._cacheStorage = {};
}

/**
 * Fetches query
 * @param {string} url – Url to fetch
 * @param {object} options – Request options
 * @param {'omit'|'same-origin'|'include'|undefined} options.credential – Should send cookies
 * @returns {Promise}
 * @private
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
 * Makes GraphQL Query
 * @param {string} query – GraphQL Query
 * @param {object} options – Request options
 * @param {number} options.cache – Time to live cache in ms
 * @param {object} options.fetch – Fetch options
 * @returns {Promise}
 */
Graphon.prototype.query = function (query, options) {
	options = options || {};
	const queryURL = this._getQuery(query);
	const fetchOptions = options.fetch || {};
	fetchOptions.method = fetchOptions.method || 'GET';
	fetchOptions.credential = fetchOptions.credential || 'omit';

	if (options.cache && this._cacheStorage[queryURL] && !this._cacheStorage[queryURL].isOutdated()) {
		return Promise.resolve(this._cacheStorage[queryURL].getData());
	}

	if (typeof query !== 'string') {
		throw new Error('Query must be a string');
	}

	return this._fetch(queryURL, fetchOptions)
		.then(function (data) {
			if (options.cache) {
				if (this._cacheStorage[queryURL]) {
					this._cacheStorage[queryURL].update(data);
				} else {
					this._cacheStorage[queryURL] = new GraphonCache(data, options.cache);
				}
			}
			return data;
		});
};

/**
 * Makes GraphQL Mutation
 * @param {string} url – GraphQL Query
 * @param {object} options – Request options
 * @param {number} options.cache – Time to live cache in ms
 * @param {object} options.fetch – Fetch options
 * @returns {Promise}
 */
Graphon.prototype.mutation = function (query, options) {
	options = options || {};
	const queryURL = this._getQuery(query);
	const fetchOptions = options.fetch || {};
	fetchOptions.method = fetchOptions.method || 'POST';
	fetchOptions.credential = fetchOptions.credential || 'omit';

	if (options.cache && this._cacheStorage[queryURL] && !this._cacheStorage[queryURL].isOutdated()) {
		return Promise.resolve(this._cacheStorage[queryURL].getData());
	}

	if (typeof query !== 'string') {
		throw new Error('Query must be a string');
	}

	return this._fetch(queryURL, fetchOptions)
		.then(function (data) {
			if (options.cache) {
				if (this._cacheStorage[queryURL]) {
					this._cacheStorage[queryURL].update(data);
				} else {
					this._cacheStorage[queryURL] = new GraphonCache(data, options.cache);
				}
			}
			return data;
		});
};

/**
 * Graphon request cache class
 * @param {*} data – Any data to cache
 * @param {number} ttl – Time to live in ms
 * @constructor
 */
function GraphonCache(data, ttl) {
	this._ttl = ttl || 0;
	this._data = data;
	this._updateTime();
}

/**
 * Update cached data
 * @param {*} newData – New data
 * @returns {GraphonCache}
 */
GraphonCache.prototype.update = function (newData) {
	this._data = newData;
	this._timestamp = Number(new Date());
	return this;
};

/**
 * Returns cached data
 * @returns {*}
 */
GraphonCache.prototype.getData = function () {
	return this._data;
};

/**
 * Check if cache is outdated
 * @returns {boolean}
 */
GraphonCache.prototype.isOutdated = function () {
	return (Number(new Date()) - this._timestamp) > this._ttl;
};

/**
 * @param {Error} err – GraphQL error object
 * @constructor
 */
function GraphonError(err) {
	Error.call(this, err.message);
}

module.exports = Graphon;
