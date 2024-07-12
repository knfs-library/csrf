"use strict"

/**
 * ************************************
 *   Cross-site request forgery
 * ************************************
 */

const crypto = require("crypto")

/**
 * @typedef {Object} CsrfConfig
 * @property {number} tokenLength
 * @property {Object} storage
 * @property {string} storage.type
 * @property {Object} storage.options
 * @property {string} param
 * @property {string} value
 * @property {function} errorResponse
 * @property {function} protectCondition
 * @property {function} getTransmitToken
 */

/**
 * @type {Object}
 * @property {Object} STORAGE
 * @property {string} STORAGE.SESSION
 * @property {string} STORAGE.COOKIE
 */
const CONSTANT = {
	STORAGE: {
		SESSION: 'session',
		COOKIE: 'cookie',
	}
}

/**
 * @typedef {Object} Csrf
 * @property {string} param
 * @property {string} value
 * @property {Object} storage
 * @property {string} storage.type
 * @property {Object} storage.options
 * @property {number} tokenLength
 * @property {function} getToken
 * @property {function} clearToken
 * @property {function} protectCondition
 * @property {function} getTransmitToken
 * @property {function} errorResponse
 */

/**
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
	getToken: (req) => {
		switch (csrf.storage.type) {
			case CONSTANT.STORAGE.SESSION:
				return req.session[csrf.param] || null;
			case CONSTANT.STORAGE.COOKIE:
				return req.cookies[csrf.param] || null;
		}
	},
	clearToken: (req, res) => {
		switch (csrf.storage.type) {
			case CONSTANT.STORAGE.SESSION:
				delete req.session[csrf.param];
				break;
			case CONSTANT.STORAGE.COOKIE:
				res.clearCookie(csrf.param)
				break
		}
	},
	protectCondition: (req) => {
		return req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE'
	},
	getTransmitToken: (req) => {
		return req.body._csrf || req.headers['csrf-token'];
	},
	errorResponse: (req, res) => {
		res.status(403).send('CSRF token invalid');
	}
}

module.exports = {
	CONSTANT,
	/**
	 * Generate CSRF protection middleware
	 * 
	 * @param {CsrfConfig} [csrfConfig]
	 * @returns {function} Middleware function
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
		csrf = { ...csrf, ...csrfConfig };
		return async (req, res, next) => {
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
					}
				}
				next();
			} catch (error) {
				console.error(error)
				next(error)
			}
		}
	},
	/**
	 * Set CSRF token in response locals
	 * 
	 * @param {Object} req
	 * @param {Object} res
	 * @param {function} next
	 */
	setTokenLocalsParam: (req, res, next) => {
		res.locals[csrf.value] = csrf.getToken(req)
		next();
	},
	/**
	 * CSRF protection middleware
	 * 
	 * @param {Object} req
	 * @param {Object} res
	 * @param {function} next
	 */
	protect: (req, res, next) => {
		try {
			if (csrf.protectCondition(req)) {
				const token = csrf.getTransmitToken(req);

				if (!token || token !== csrf.getToken(req)) {
					return csrf.errorResponse(req, res)
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
