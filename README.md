
<p align="center">
  <br>
	<a href="https://app.fossa.com/projects/git%2Bgithub.com%2Fknfs-jsc%2Fbamimi-security?ref=badge_shield&issueType=license" alt="FOSSA Status"><img src="https://app.fossa.com/api/projects/git%2Bgithub.com%2Fknfs-jsc%2Fbamimi-security.svg?type=shield&issueType=license"/></a>
	<a href="https://app.fossa.com/projects/git%2Bgithub.com%2Fknfs-jsc%2Fbamimi-security?ref=badge_shield&issueType=security" alt="FOSSA Status"><img src="https://app.fossa.com/api/projects/git%2Bgithub.com%2Fknfs-jsc%2Fbamimi-security.svg?type=shield&issueType=security"/></a>
	<a href="https://scrutinizer-ci.com/g/knfs-library/csrf/build-status/master"alt="scrutinizer">
	<img src="https://scrutinizer-ci.com/g/knfs-library/csrf/badges/build.png?b=master" alt="Build Status" /></a>
	<a href="https://scrutinizer-ci.com/g/knfs-library/csrf/?branch=master"alt="scrutinizer">
	<img src="https://scrutinizer-ci.com/g/knfs-library/csrf/badges/quality-score.png?b=master" alt="Scrutinizer Code Quality" /></a>
	<a href="https://github.com/knfs-library/csrf/actions"alt="scrutinizer">
	<a href="https://github.com/knfs-library/csrf/actions/workflows/test.yml" alt="github">
		<img src="https://github.com/knfs-library/csrf/actions/workflows/test.yml/badge.svg" alt="Github " />
	</a>
</p>


<h1> <span style="color:#013C4D;">About</span> <span style="color:#2B7F84;">CSRF</span></h1>

This npm package provides Cross-site request forgery module for various security measures.

## Install

Install the package via npm:

```bash
npm install @knfs-tech/csrf
```

Or via yarn:

```bash
yarn add @knfs-tech/csrf
```

## Usage
This module provides functionality to protect against CSRF attacks.

Usage:
```javascript
const csrf = require('@knfs-tech/csrf');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");

const app = express();

// Initialize session middleware
app.use(session({
  secret: 'your_secret_here',
  resave: false,
  saveUninitialized: true
}));
// Initialize cookie middleware
app.use(cookieParser());

// Initialize CSRF protection middleware with cookie
app.use(
	csrf.generate({
		param: '_csrf', // param key to check and verify (option)
		value: 'csrfToken', // param to get value (option)
		tokenLength: 16, // param to get value (option)
		storage: {
			type: csrf.CONSTANT.STORAGE.COOKIE,
			options: {
				httpOnly: true,
				maxAge: 1 * 24 * 60 * 60 * 1000, // 1days
				secure: true
			}
		} // param to get value (option)
	})
);

//OR with session
// app.use(
// 	csrf.generate({
// 		tokenLength: 16,
// 		storage: {
// 			type: csrf.CONSTANT.STORAGE.SESSION,
// 		}
// 	})
// )

//OR default
// app.use(csrf.generate())

// Set CSRF token in response locals
// if you use with view engine as ejs, bug,...
// <input type="hidden" name="_csrf" value="${csrfToken}">
// csrfToken is param to get value, you can see above
app.use(csrf.setTokenLocalsParam);



// Protect routes from CSRF attacks
/** You wile have body 
 * {_csrf: <token>, ...}
 * _csrf is param key to check and verify, you can see above
 * 
*/
app.post('/your-protected-route', csrf.protect, (req, res) => {
  res.send('CSRF protected route');
});


app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

**Custom protectCondition**

- Default protectCondition is
```javascript
protectCondition = (req) => {
  return req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE'
}
```
  
- When you custom

```javascript
// when you custom
const newProtectCondition = (req) => {
  return true		
}
app.use(csrf.generate({
  protectCondition: newProtectCondition
}))
```

**Custom getTransmitToken**

- Default getTransmitToken is
```javascript
getTransmitToken: (req) => {
  return req.body._csrf || req.headers['csrf-token'];
}
```
  
- When you custom

```javascript
// when you custom
const newGetTransmitToken = (req) => {
  return req.body._csrf || req.headers['csrf-token'] || req.query._csrf;
},
app.use(csrf.generate({
  getTransmitToken: newGetTransmitToken
}))
```

**Custom errorResponse**

- Default errorResponse is
```javascript
errorResponse: (req, res, next) => {
  return res.status(403).send('CSRF token invalid');
}
```
  
- When you custom

```javascript
// when you custom
const newErrorResponse = (req, res, next) => {
  return res.status(403).render('<h1>CSRF token invalid</h1>');
}
app.use(csrf.generate({
  errorResponse: newErrorResponse
}))
```

## License

Bamimi is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## Author
* [Kent Phung](https://github.com/khapu2906)
  
## Owner
* [Knfs.,jsc](https://github.com/knfs-library)



