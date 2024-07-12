const csrfMiddleware = require('../../lib/cjs');

describe('CSRF Middleware', () => {
	let req, res, next;

	beforeEach(() => {
		req = {
			session: {},
			cookies: {},
			method: 'POST',
			body: {}
		};
		res = {
			status: jest.fn().mockReturnThis(),
			send: jest.fn().mockReturnThis(),
			cookie: jest.fn().mockReturnThis(),
			clearCookie: jest.fn().mockReturnThis(),
			locals: {}
		};
		next = jest.fn();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('generate function', () => {
		it('should generate CSRF token and store it', async () => {
			const middleware = csrfMiddleware.generate();

			await middleware(req, res, next);

			expect(req.session._csrf).toBeDefined();
		});

		it('should not generate a new token if one already exists', async () => {
			req.session._csrf = 'existingToken';

			const middleware = csrfMiddleware.generate();

			await middleware(req, res, next);

			expect(req.session._csrf).toEqual('existingToken');
			expect(res.cookie).not.toHaveBeenCalled();
		});
	});

	describe('setTokenLocalsParam function', () => {
		it('should set CSRF token in response locals', () => {
			req.session._csrf = 'testToken';

			csrfMiddleware.setTokenLocalsParam(req, res, next);
			expect(res.locals.csrfToken).toEqual('testToken');
			expect(next).toHaveBeenCalled();
		});
	});

	describe('protect function', () => {
		it('should pass through if method is not POST, PUT, or DELETE', () => {
			req.method = 'GET';

			csrfMiddleware.protect(req, res, next);

			expect(next).toHaveBeenCalled();
			expect(res.status).not.toHaveBeenCalled();
		});

		it('should pass through if token is valid', () => {
			req.method = 'POST';
			req.body._csrf = 'validToken';
			req.session._csrf = 'validToken';

			csrfMiddleware.protect(req, res, next);

			expect(res.status).not.toHaveBeenCalled();
		});

		it('should respond with 403 if token is invalid', () => {
			req.method = 'POST';
			req.body._csrf = 'invalidToken';
			req.session._csrf = 'validToken';

			csrfMiddleware.protect(req, res, next);

			expect(res.status).toHaveBeenCalledWith(403);
			expect(res.send).toHaveBeenCalledWith('CSRF token invalid');
		});
	});
});
