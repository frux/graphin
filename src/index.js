import fetchPonyfill from 'fetch-ponyfill';

const fetch = fetchPonyfill();

/**
 * Graphin request cache class
 * @param {*} data – Any data to cache
 * @param {number} ttl – Time to live in ms
 * @constructor
 */
class GraphinCache {
	constructor(data, ttl) {
		this._ttl = ttl || 0;
		this.update(data);
	}

	/**
	 * Update cached data
	 * @param {*} newData – New data
	 * @returns {GraphinCache}
	 */
	update(newData) {
		this._data = newData;
		this._timestamp = Number(new Date());
		return this;
	}

	/**
	 * Returns cached data
	 * @returns {*}
	 */
	getData() {
		return this._data;
	}

	/**
	 * Check if cache is outdated
	 * @returns {boolean}
	 */
	isOutdated() {
		return (Number(new Date()) - this._timestamp) > this._ttl;
	}
}

/**
 * Removes extra indention
 * @param {string} text Text with extra indention
 * @return {string}
 */
function normalizeIndent(text) {
	const reduceSize = /\n(\s*)\S?.*$/.exec(text)[1].length;
	return text.split('\n').map(row => {
		return row.replace(new RegExp(`^\\s{${reduceSize}}`), '');
	}).join('\n');
}

/**
 * @param {Error} err – GraphQL error object
 * @constructor
 */
class GraphinError extends Error {
	constructor(apiErrors, url) {
		const query = normalizeIndent(decodeURIComponent(url.replace(/^.+\?query=/, '')));
		const errors = apiErrors.reduce(
			(errors, error) => {
				const message = error.message;
				const stack = `${message}\n${query}\n${JSON.stringify(error.locations)}`;
				errors.message += `\n\n${message}`;
				errors.stack += `\n\n${stack}`;
				errors.originalErrors.push(new Error(message));
				return errors;
			},
			{
				originalErrors: [],
				message: 'GraphQl error:',
				stack: 'GraphQl error:'
			});
		super(errors.message);
		this.stack = errors.stack;
		this.originalErrors = errors.errors;
		this.url = errors.url;
	}
}

/**
 * Graphin class
 * @param {string} endpoint – GraphQL endpoint URL
 * @constructor
 */
export default class Graphin {
	constructor(endpoint) {
		if (typeof endpoint !== 'string') {
			throw new Error('The first argument must be a string containing GraphQL endpoint URL');
		}
		this.getQueryURL = function (query) {
			const inlineQuery = encodeURIComponent(query);
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
	_fetch(url, options = {}) {
		return fetch(url, options)
			.then(response => {
				return response.json()
					.then(data => {
						if (response.ok) {
							return data.data;
						}
						if (data.errors) {
							throw new GraphinError(data.errors, url);
						} else {
							throw new Error(`Request error: ${response.statusText}`);
						}
					});
			});
	}

	/**
	 * Makes GraphQL Query
	 * @param {string} query – GraphQL Query
	 * @param {object|undefined} options – Request options. Default {}
	 * @param {number} options.cache – Time to live cache in ms
	 * @param {object} options.fetch – Fetch options
	 * @returns {Promise}
	 */
	query(query, options = {}) {
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
			.then(data => {
				if (options.cache) {
					if (this._cacheStorage[queryURL]) {
						this._cacheStorage[queryURL].update(data);
					} else {
						this._cacheStorage[queryURL] = new GraphinCache(data, options.cache);
					}
				}
				return data;
			});
	}
}
