var fetch = require('fetch-ponyfill')();

/**
 * Graphin class
 * @param {string} endpoint – GraphQL endpoint URL
 * @constructor
 */
function Graphin(endpoint, params) {
	params = params || {};

	if (typeof endpoint !== 'string') {
		throw new Error('The first argument must be a string containing GraphQL endpoint URL');
	}
	this.getQueryURL = function (query) {
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
Graphin.prototype._fetch = function (url, options) {
	options = options || {};

	return fetch(url, options)
		.then(response => {
			if (!response.ok) {
				throw new Error(`Request error: ${response.statusText}`);
			}

			return response.json()
				.then(data => {
					if (data.errors) {
						throw new GraphinError(data.errors[0]);
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
Graphin.prototype.query = function (query, options) {
	options = options || {};
	const queryURL = this.getQueryURL(query);
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
		.then((function (data) {
			if (options.cache) {
				if (this._cacheStorage[queryURL]) {
					this._cacheStorage[queryURL].update(data);
				} else {
					this._cacheStorage[queryURL] = new GraphinCache(data, options.cache);
				}
			}
			return data;
		}).bind(this));
};

/**
 * Makes GraphQL Mutation
 * @param {string} url – GraphQL Query
 * @param {object} options – Request options
 * @param {number} options.cache – Time to live cache in ms
 * @param {object} options.fetch – Fetch options
 * @returns {Promise}
 */
Graphin.prototype.mutation = function (query, options) {
	options = options || {};
	const queryURL = this.getQueryURL(query);
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
		.then((function (data) {
			if (options.cache) {
				if (this._cacheStorage[queryURL]) {
					this._cacheStorage[queryURL].update(data);
				} else {
					this._cacheStorage[queryURL] = new GraphinCache(data, options.cache);
				}
			}
			return data;
		}).bind(this));
};

/**
 * Graphin request cache class
 * @param {*} data – Any data to cache
 * @param {number} ttl – Time to live in ms
 * @constructor
 */
function GraphinCache(data, ttl) {
	this._ttl = ttl || 0;
	this.update(data);
}

/**
 * Update cached data
 * @param {*} newData – New data
 * @returns {GraphinCache}
 */
GraphinCache.prototype.update = function (newData) {
	this._data = newData;
	this._timestamp = Number(new Date());
	return this;
};

/**
 * Returns cached data
 * @returns {*}
 */
GraphinCache.prototype.getData = function () {
	return this._data;
};

/**
 * Check if cache is outdated
 * @returns {boolean}
 */
GraphinCache.prototype.isOutdated = function () {
	return (Number(new Date()) - this._timestamp) > this._ttl;
};

/**
 * @param {Error} err – GraphQL error object
 * @constructor
 */
function GraphinError(err) {
	Error.call(this, err.message);
}

module.exports = Graphin;
