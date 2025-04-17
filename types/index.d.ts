declare namespace _exports {
    export { CsrfConfig, Csrf };
}
declare namespace _exports {
    export { CONSTANT };
    export function generate(csrfConfig?: CsrfConfig): Function;
    export function setTokenLocalsParam(req: any, res: any, next: Function): void;
    export function protect(req: any, res: any, next: Function): void;
}
export = _exports;
type CsrfConfig = {
    /**
     * - The length of the CSRF token in bytes.
     */
    tokenLength?: number;
    /**
     * - The storage configuration for the CSRF token.
     */
    storage?: {
        type?: string;
        options?: any;
    };
    /**
     * - The name of the request body or query parameter to check for the CSRF token.
     */
    param?: string;
    /**
     * - The name of the local variable to set the CSRF token to for use in templates.
     */
    value?: string;
    /**
     * - A function to call when the CSRF token is invalid.  It should accept `(req, res, next)` and send an appropriate error response.
     */
    errorResponse?: Function;
    /**
     * - A function to determine if CSRF protection should be applied.  It should accept `(req)` and return `true` to protect, `false` to skip.
     */
    protectCondition?: Function;
    /**
     * - A function to retrieve the CSRF token from the request.  It should accept `(req)` and return the token string or `null`.
     */
    getTransmitToken?: Function;
};
type Csrf = {
    /**
     * - The name of the request body or query parameter to check for the CSRF token.
     */
    param: string;
    /**
     * - The name of the local variable to set the CSRF token to for use in templates.
     */
    value: string;
    /**
     * - The storage configuration for the CSRF token.
     */
    storage: {
        type: string;
        options: any;
    };
    /**
     * - The length of the CSRF token in bytes.
     */
    tokenLength: number;
    /**
     * - A function to get the CSRF token from the request.
     */
    getToken: Function;
    /**
     * - A function to clear the CSRF token from the request and/or response.
     */
    clearToken: Function;
    /**
     * - A function to determine if CSRF protection should be applied.
     */
    protectCondition: Function;
    /**
     * - A function to retrieve the CSRF token from the request.
     */
    getTransmitToken: Function;
    /**
     * - A function to call when the CSRF token is invalid.
     */
    errorResponse: Function;
};
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
declare const CONSTANT: any;
