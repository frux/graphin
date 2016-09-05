import fetchPonyfill from 'fetch-ponyfill';

const {fetch} = fetchPonyfill();

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
	const indents = /\n(\s*)\S?.*$/.exec(text);
	if (indents) {
		const reduceSize = indents && indents[indents.length - 1].length;
		return text.split('\n').map(row => {
			return row.replace(new RegExp(`^\\s{${reduceSize}}`), '');
		}).join('\n');
	}
	return text;
}

/**
 * Remembers time and return function which measure time between calls
 * @returns {funciton}
 */
function _startProfiling() {
	const startTime = Number(new Date());
	return function () {
		return Number(new Date()) - startTime;
	};
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
 * @param {object|undefined} options – Graphin general options. Affect all requests. Default {}
 * @param {number} requestOptions.cache – Time to live cache in ms
 * @param {object} requestOptions.fetch – Fetch options
 * @param {boolean} requestOptions.verbose – Verbose mode
 * @param {function|undefined} fetcher – Fetch function (url, options) => Promise
 * @constructor
 */
export default class Graphin {
	constructor(endpoint, options = {}, fetcher = fetch) {
		if (typeof endpoint !== 'string') {
			throw new Error('The first argument must be a string containing GraphQL endpoint URL');
		}
		this.getQueryURL = function (query) {
			const inlineQuery = encodeURIComponent(query);
			return `${endpoint}?query=${inlineQuery}`;
		};

		this._options = {
			cache: options.cache || false,
			fetch: options.fetch || {},
			verbose: options.verbose || false
		};
		this._fetcher = fetcher;

		this._cacheStorage = {};
	}

	/**
	 * Fetches query
	 * @param {string} url – Url to fetch
	 * @param {object} options – Request options
	 * @returns {Promise}
	 * @private
	 */
	_fetch(url, options = {}) {
		return this._fetcher(url, options)
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
	 * @param {object|undefined} requestOptions – Request options. Affect only this request. Merge with general options. Default {}
	 * @param {number} requestOptions.cache – Time to live cache in ms
	 * @param {object} requestOptions.fetch – Fetch options
	 * @param {boolean} requestOptions.verbose – Verbose mode
	 * @returns {Promise}
	 */
	query(query, requestOptions = {}) {
		const queryURL = this.getQueryURL(query);
		const options = Object.assign({}, this._options, requestOptions);
		const fetchOptions = Object.assign({}, this._options.fetch, requestOptions.fetch);
		const _stopProfiling = _startProfiling();
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
				if (options.verbose) {
					console.log(`Graphin ${_stopProfiling()}ms ✔︎\n${normalizeIndent(query)}\n${queryURL}`);
				}
				return data;
			})
			.then(data => {
				if (options.cache) {
					if (this._cacheStorage[queryURL]) {
						this._cacheStorage[queryURL].update(data);
					} else {
						this._cacheStorage[queryURL] = new GraphinCache(data, options.cache);
					}
				}
				return data;
			})
			.catch(err => {
				if (options.verbose) {
					console.log(`Graphin ${_stopProfiling()}ms ✘\n${normalizeIndent(query)}\n${queryURL}`);
				}
				throw err;
			});
	}
}
