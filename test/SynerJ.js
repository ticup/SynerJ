var define = require('requirejs');
var should = require('should');

define.config({
	baseUrl: __dirname + '/../',
	//nodeRequire: require,
	paths: {
    // code called by shared code
    Dobject: 'lib/env/Dobject',
    SynerJ: 'lib/env/SynerJ',
    eventHandlers: 'lib/env/eventHandlers'
    }
});

define(['lib/server/Page'], function (Page) {
	new Page('test', function tests(page) {
		var SynerJ = page.window.SynerJ;

		describe('SynerJ', function () {

			describe('.create()', function () {
				var obj = SynerJ.create();

				it('should return a Dobject', function () {
					SynerJ.Dobject.instanceOf(obj).should.be.true;
				});

				it('should be a hidden Dobject', function () {
				});
			});
		});
	});
});