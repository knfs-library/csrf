"use strict";

/**
 * @module csrf
 * @description Cross-site request forgery (CSRF) protection middleware.
 */

const crypto = require("crypto");

/**
 * @typedef {Object} CsrfConfig
 * @property {number} [tokenLength=16] - The length of the CSRF token in bytes.
 * @property {Object} [storage] - The storage configuration for the CSRF token.
 * @property {string} [storage.type='session'] - The type of storage to use for the CSRF token ('session' or 'cookie').
 * @property {Object} [storage.options={}] - Options to pass to the cookie storage (e.g., `domain`, `path`, `secure`, `httpOnly`). Only applicable when `storage.type` is 'cookie'.
 * @property {string} [param='_csrf'] - The name of the request body or query parameter to check for the CSRF token.
 * @property {string} [value='csrfToken'] - The name of the local variable to set the CSRF token to for use in templates.
 * @property {function} [errorResponse] - A function to call when the CSRF token is invalid.  It should accept `(req, res, next)` and send an appropriate error response.
 * @property {function} [protectCondition] - A function to determine if CSRF protection should be applied.  It should accept `(req)` and return `true` to protect, `false` to skip.
 * @property {function} [getTransmitToken] - A function to retrieve the CSRF token from the request.  It should accept `(req)` and return the token string or `null`.
 */

/**
 * @type {Object}
 * @property {Object} STORAGE
 * @property {string} STORAGE.SESSION - String constant representing session storage type.
 * @property {string} STORAGE.COOKIE - String constant representing cookie storage type.
 */
const CONSTANT = {
	STORAGE: {
		SESSION: 'session',
		COOKIE: 'cookie',
	}
}

/**
 * @typedef {Object} Csrf
 * @property {string} param - The name of the request body or query parameter to check for the CSRF token.
 * @property {string} value - The name of the local variable to set the CSRF token to for use in templates.
 * @property {Object} storage - The storage configuration for the CSRF token.
 * @property {string} storage.type - The type of storage to use for the CSRF token ('session' or 'cookie').
 * @property {Object} storage.options - Options to pass to the cookie storage (e.g., `domain`, `path`, `secure`, `httpOnly`).
 * @property {number} tokenLength - The length of the CSRF token in bytes.
 * @property {function} getToken - A function to get the CSRF token from the request.
 * @property {function} clearToken - A function to clear the CSRF token from the request and/or response.
 * @property {function} protectCondition - A function to determine if CSRF protection should be applied.
 * @property {function} getTransmitToken - A function to retrieve the CSRF token from the request.
 * @property {function} errorResponse - A function to call when the CSRF token is invalid.
 */

/**
 * @private
 * @type {Csrf}
 */
let csrf = {
	param: '_csrf',
	value: 'csrfToken',
	storage: {
		type: CONSTANT.STORAGE.SESSION,
		options: {}
	},
	tokenLength: 16,
	/**
	 * Gets the CSRF token from the request, based on the configured storage type.
	 * @param {Object} req - The Express request object.
	 * @returns {string|null} The CSRF token, or null if not found.
	 */
	getToken: (req) => {
		switch (csrf.storage.type) {
			case CONSTANT.STORAGE.SESSION:
				return req.session[csrf.param] || null;
			case CONSTANT.STORAGE.COOKIE:
				return req.cookies[csrf.param] || null;
			default:
				console.warn("CSRF: Unknown storage type:", csrf.storage.type);
				return null; // Or throw an error
		}
	},
	/**
	 * Clears the CSRF token from the request and/or response, based on the configured storage type.
	 * @param {Object} req - The Express request object.
	 * @param {Object} res - The Express response object.
	 * @returns {void}
	 */
	clearToken: (req, res) => {
		switch (csrf.storage.type) {
			case CONSTANT.STORAGE.SESSION:
				delete req.session[csrf.param];
				break;
			case CONSTANT.STORAGE.COOKIE:
				res.clearCookie(csrf.param)
				break
			default:
				console.warn("CSRF: Unknown storage type:", csrf.storage.type);
				break;
		}
	},
	/**
	 * Determines if CSRF protection should be applied to the request.
	 * @param {Object} req - The Express request object.
	 * @returns {boolean} True if CSRF protection should be applied, false otherwise.
	 */
	protectCondition: (req) => {
		return req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE'
	},
	/**
	 * Gets the CSRF token from the request headers or body.
	 * @param {Object} req - The Express request object.
	 * @returns {string|null|undefined} The CSRF token, or undefined if not found.
	 */
	getTransmitToken: (req) => {
		return req.body._csrf || req.headers['csrf-token'];
	},
	/**
	 * Sends an error response when the CSRF token is invalid.
	 * @param {Object} req - The Express request object.
	 * @param {Object} res - The Express response object.
	 * @param {function} next - The Express next function.
	 * @returns {void}
	 */
	errorResponse: (req, res, next) => {
		res.status(403).send('CSRF token invalid');
	}
}

module.exports = {
	CONSTANT,
	/**
	 * Generates CSRF protection middleware.
	 *
	 * @param {CsrfConfig} [csrfConfig] - The CSRF configuration object.
	 * @returns {function} An Express middleware function.
	 *
	 * @example
	 * const csrfMiddleware = csrf.generate({
	 *   storage: { type: 'cookie', options: { secure: true } }
	 * });
	 * app.use(csrfMiddleware);
	 */
	generate: (csrfConfig = {
		tokenLength: 16,
		storage: {
			type: CONSTANT.STORAGE.SESSION,
			options: {}
		},
		param: '_csrf',
		value: 'csrfToken',
		errorResponse: csrf.errorResponse,
		protectCondition: csrf.protectCondition,
		getTransmitToken: csrf.getTransmitToken
	}) => {
		//@ts-ignore
		csrf = { ...csrf, ...csrfConfig };
		return async (req, res, next) => {
			if (csrfConfig.storage.type === CONSTANT.STORAGE.SESSION && typeof req.session === 'undefined') {
				throw new Error('CSRF: Session middleware (e.g., express-session) is required when using session storage.');
			}

			// Check for cookie middleware
			if (csrfConfig.storage.type === CONSTANT.STORAGE.COOKIE && typeof req.cookies === 'undefined') {
				throw new Error('CSRF: cookie-parser middleware is required when using cookie storage.');
			}

			try {
				if (!csrf.getToken(req)) {
					const token = crypto.randomBytes(csrf.tokenLength).toString('hex');
					console.info("CREATE CSRF TOKEN:", token)
					switch (csrf.storage.type) {
						case CONSTANT.STORAGE.SESSION:
							req.session[csrf.param] = token;
							break;
						case CONSTANT.STORAGE.COOKIE:
							res.cookie(csrf.param, token, csrf.storage.options);
							break;
						default:
							console.warn("CSRF: Unknown storage type:", csrf.storage.type);
							break;
					}
					req.currentCsrfToken = token
				}
				next();
			} catch (error) {
				console.error(error)
				next(error)
			}
		}
	},
	/**
	 * Sets the CSRF token in the response locals, making it available to templates.
	 *
	 * @param {Object} req - The Express request object.
	 * @param {Object} res - The Express response object.
	 * @param {function} next - The Express next function.
	 * @returns {void}
	 *
	 * @example
	 * app.use(csrf.setTokenLocalsParam);
	 */
	setTokenLocalsParam: (req, res, next) => {
		res.locals[csrf.value] = csrf.getToken(req) || req.currentCsrfToken
		next();
	},
	/**
	 * Protects routes from CSRF attacks by validating the CSRF token.
	 *
	 * @param {Object} req - The Express request object.
	 * @param {Object} res - The Express response object.
	 * @param {function} next - The Express next function.
	 * @returns {void}
	 *
	 * @example
	 * app.post('/form', csrf.protect, (req, res) => {
	 *   // ... handle form submission
	 * });
	 */
	protect: (req, res, next) => {
		try {
			if (csrf.protectCondition(req)) {
				const token = csrf.getTransmitToken(req);

				if (!token || token !== csrf.getToken(req)) {
					return csrf.errorResponse(req, res, next)
				} else {
					console.info("DELETE CSRF TOKEN: ", token)
					csrf.clearToken(req, res)
				}
			}
			next();
		} catch (error) {
			console.error(error)
			next(error)
		}
	},
}
