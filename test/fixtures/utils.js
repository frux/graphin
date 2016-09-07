export function mockFetch({code, response, assertions}) {
	code = code || 200;
	response = response || null;
	assertions = assertions || function () {};

	return function (url, options) {
		assertions(url, options);
		return Promise.resolve({
			ok: code === 200,
			json() {
				if (typeof response === 'function') {
					return Promise.resolve(response());
				}

				return Promise.resolve(response);
			}
		});
	};
}
