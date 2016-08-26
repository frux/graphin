'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fetchPonyfill2 = require('fetch-ponyfill');

var _fetchPonyfill3 = _interopRequireDefault(_fetchPonyfill2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _fetchPonyfill = (0, _fetchPonyfill3.default)();

var fetch = _fetchPonyfill.fetch;

/**
 * Graphin request cache class
 * @param {*} data – Any data to cache
 * @param {number} ttl – Time to live in ms
 * @constructor
 */

var GraphinCache = function () {
	function GraphinCache(data, ttl) {
		_classCallCheck(this, GraphinCache);

		this._ttl = ttl || 0;
		this.update(data);
	}

	/**
  * Update cached data
  * @param {*} newData – New data
  * @returns {GraphinCache}
  */


	_createClass(GraphinCache, [{
		key: 'update',
		value: function update(newData) {
			this._data = newData;
			this._timestamp = Number(new Date());
			return this;
		}

		/**
   * Returns cached data
   * @returns {*}
   */

	}, {
		key: 'getData',
		value: function getData() {
			return this._data;
		}

		/**
   * Check if cache is outdated
   * @returns {boolean}
   */

	}, {
		key: 'isOutdated',
		value: function isOutdated() {
			return Number(new Date()) - this._timestamp > this._ttl;
		}
	}]);

	return GraphinCache;
}();

/**
 * Removes extra indention
 * @param {string} text Text with extra indention
 * @return {string}
 */


function normalizeIndent(text) {
	var indents = /\n(\s*)\S?.*$/.exec(text);
	if (indents) {
		var _ret = function () {
			var reduceSize = indents && indents[1].length;
			return {
				v: text.split('\n').map(function (row) {
					return row.replace(new RegExp('^\\s{' + reduceSize + '}'), '');
				}).join('\n')
			};
		}();

		if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
	}
	return text;
}

/**
 * Remembers time and return function which measure time between calls
 * @returns {funciton}
 */
function _startProfiling() {
	var startTime = Number(new Date());
	return function () {
		return Number(new Date()) - startTime;
	};
}

/**
 * @param {Error} err – GraphQL error object
 * @constructor
 */

var GraphinError = function (_Error) {
	_inherits(GraphinError, _Error);

	function GraphinError(apiErrors, url) {
		_classCallCheck(this, GraphinError);

		var query = normalizeIndent(decodeURIComponent(url.replace(/^.+\?query=/, '')));
		var errors = apiErrors.reduce(function (errors, error) {
			var message = error.message;
			var stack = message + '\n' + query + '\n' + JSON.stringify(error.locations);
			errors.message += '\n\n' + message;
			errors.stack += '\n\n' + stack;
			errors.originalErrors.push(new Error(message));
			return errors;
		}, {
			originalErrors: [],
			message: 'GraphQl error:',
			stack: 'GraphQl error:'
		});

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(GraphinError).call(this, errors.message));

		_this.stack = errors.stack;
		_this.originalErrors = errors.errors;
		_this.url = errors.url;
		return _this;
	}

	return GraphinError;
}(Error);

/**
 * Graphin class
 * @param {string} endpoint – GraphQL endpoint URL
 * @param {object|undefined} щзешщты – General Graphin requests options. Default {}
 * @param {number} requestOptions.cache – Time to live cache in ms
 * @param {object} requestOptions.fetch – Fetch options
 * @param {boolean} requestOptions.verbose – Verbose mode
 * @param {function|undefined} fetcher – Fetch function (url, options) => Promise
 * @constructor
 */


var Graphin = function () {
	function Graphin(endpoint) {
		var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
		var fetcher = arguments.length <= 2 || arguments[2] === undefined ? fetch : arguments[2];

		_classCallCheck(this, Graphin);

		if (typeof endpoint !== 'string') {
			throw new Error('The first argument must be a string containing GraphQL endpoint URL');
		}
		this.getQueryURL = function (query) {
			var inlineQuery = encodeURIComponent(query);
			return endpoint + '?query=' + inlineQuery;
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


	_createClass(Graphin, [{
		key: '_fetch',
		value: function _fetch(url) {
			var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

			return this._fetcher(url, options).then(function (response) {
				return response.json().then(function (data) {
					if (response.ok) {
						return data.data;
					}
					if (data.errors) {
						throw new GraphinError(data.errors, url);
					} else {
						throw new Error('Request error: ' + response.statusText);
					}
				});
			});
		}

		/**
   * Makes GraphQL Query
   * @param {string} query – GraphQL Query
   * @param {object|undefined} requestOptions – Current request options. Default {}
   * @param {number} requestOptions.cache – Time to live cache in ms
   * @param {object} requestOptions.fetch – Fetch options
   * @param {boolean} requestOptions.verbose – Verbose mode
   * @returns {Promise}
   */

	}, {
		key: 'query',
		value: function query(_query) {
			var _this2 = this;

			var requestOptions = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

			var queryURL = this.getQueryURL(_query);
			var options = Object.assign(this._options, requestOptions);
			var fetchOptions = Object.assign(this._options.fetch, requestOptions.fetch);
			var _stopProfiling = _startProfiling();
			fetchOptions.method = fetchOptions.method || 'POST';
			fetchOptions.credential = fetchOptions.credential || 'omit';

			if (options.cache && this._cacheStorage[queryURL] && !this._cacheStorage[queryURL].isOutdated()) {
				return Promise.resolve(this._cacheStorage[queryURL].getData());
			}

			if (typeof _query !== 'string') {
				throw new Error('Query must be a string');
			}

			return this._fetch(queryURL, fetchOptions).then(function (data) {
				if (options.verbose) {
					console.log('Graphin ' + _stopProfiling() + 'ms ✔︎\n' + normalizeIndent(_query) + '\n' + queryURL);
				}
				return data;
			}).then(function (data) {
				if (options.cache) {
					if (_this2._cacheStorage[queryURL]) {
						_this2._cacheStorage[queryURL].update(data);
					} else {
						_this2._cacheStorage[queryURL] = new GraphinCache(data, options.cache);
					}
				}
				return data;
			}).catch(function (err) {
				if (options.verbose) {
					console.log('Graphin ' + _stopProfiling() + 'ms ✘\n' + normalizeIndent(_query) + '\n' + queryURL);
				}
				throw err;
			});
		}
	}]);

	return Graphin;
}();

exports.default = Graphin;
