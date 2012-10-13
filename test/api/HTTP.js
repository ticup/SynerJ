// test/HTTP.API
//
// tests the http request API of the server for requesting, creating and editing environments.
//
// Author: Tim Coppieters
// Date: octobre 2012
var Browser = require("zombie");
var should = require("should");
var define = require('requirejs');

// starts the server
//require('../../app');

define.config({
	baseUrl: __dirname + '/../../',
	//nodeRequire: require,
	paths: {
		Dobject: 'lib/env/Dobject',
    SynerJ: 'lib/env/SynerJ',
    eventHandlers: 'lib/env/eventHandlers'
  }
});

define(['lib/config'], function (config) {
	browser = new Browser();
	var name = 'foo';

	describe("GET HTTP Requests:", function () {
		describe("Creation: ", function () {
			describe("@host:port/<name>.create", function () {
				it("should return a 401 status code", function (done) {
					browser.visit("http://localhost:" + config.port + "/" + name + ".create", function (e, browser) {
						should.equal(browser.statusCode, 401);
						done();
					});
				});
			});

			describe("username:passwordhost:port/<name>.create", function () {
				it("should create the environment", function (done) {
					browser.visit("http://test:test@localhost:" + config.port + "/" + name + ".create").
						then(function () {
							should.equal(browser.text('h1'), name + " created.");
						}).
						then(done, done);
				});
			});
		});

		describe("Retrieval:", function () {
			describe("host:port/<name>", function () {
				it("should return the application without IDE", function (done) {
					browser.visit("http://test:test@localhost:" + config.port + "/" + name + ".create", function () {
						browser.visit("http://localhost:" + config.port + "/tests").
							then(function () {
								should.exist(browser.query('#SynerJ-Objects'));
								should.not.exist(browser.query('#Inspector'));
								should.not.exist(browser.query('#Editor'));
								should.not.exist(browser.query('#Evaluator'));
							}).
							then(done, done);
					});
				});
			});
			
			describe("host:port/<name>.admin", function () {
				it("should return a 401 status code", function (done) {
					browser.visit("http://localhost:" + config.port + "/" + name + ".admin", function (e, browser) {
						should.equal(browser.statusCode, 401);
						done();
					});
				});
			});

			describe("username:password@host:port/<name>.admin", function () {
				it("should return the application with IDE", function (done) {
					browser.visit("http://test:test@localhost:" + config.port + "/" + name + ".create", function () {
						browser.visit("http://test:test@localhost:" + config.port + "/" + name + ".admin").
							then(function () {
								should.exist(browser.query('#SynerJ-Objects'));
								should.exist(browser.query('#Editor'));
							}).
							then(done, done);
					});
				});
			});
		});
	});
});