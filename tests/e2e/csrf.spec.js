"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const supertest = require("supertest");
const csrfMiddleware = require('../../lib/cjs');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
	session({
		secret: "test-secret",
		resave: false,
		saveUninitialized: true,
	})
);

// Adding CSRF middleware to the app
app.use(csrfMiddleware.generate({
	tokenLength: 24,
	storage: {
		type: csrfMiddleware.CONSTANT.STORAGE.COOKIE,
		options: {
			httpOnly: true,
			maxAge: 1 * 24 * 60 * 60 * 1000, // 1days
			secure: true
		}
	}
}));

// Endpoint to test CSRF protection
app.post("/test-endpoint", csrfMiddleware.protect, (req, res) => {
	res.status(200).send("CSRF token valid");
});

app.get("/redirect",  (req, res) => {
	res.redirect('/');
});

app.get("/", (req, res) => {
	res.status(200).send("OK");
});


describe("CSRF Middleware End-to-End Tests", () => {
	let request;

	beforeAll(() => {
		request = supertest(app);
	});

	it("should return 403 if CSRF token is missing", async () => {
		const response = await request.post("/test-endpoint");
		expect(response.status).toBe(403);
		expect(response.text).toBe("CSRF token invalid");
	});

	it("should return 200 if CSRF token is present and valid", async () => {
		const getTokenResponse = await request.get("/");
		let csrfTokenFromCookie = getTokenResponse.headers['set-cookie'][0].split(';')[0].split('=')[1];
		
		const postRequest = request.post("/test-endpoint");
		
		if (csrfTokenFromCookie) {
			postRequest.set("Cookie", `_csrf=${csrfTokenFromCookie}`);
		}

		const response = await postRequest.send({ _csrf: csrfTokenFromCookie });

		expect(response.status).toBe(200);
		expect(response.text).toBe("CSRF token valid");
	});
});

