var define = require('requirejs');
var should = require('should');

define.config({
	baseUrl: 'lib',
	paths: {
		// shared env code
		sDobject: '../shared/Dobject',
		'sDobject.core': '../shared/Dobject.core',
		sSynerJ: '../shared/SynerJ',
		'sSynerJ.core': '../shared/SynerJ.core',
		sConfig: '../shared/config',
		sEventHandlers: '../shared/eventHandlers',
		// server env code
		Dobject: 'env/Dobject',
		'Dobject.core': 'env/Dobject.core',
		SynerJ: 'env/SynerJ',
		'SynerJ.core': 'env/SynerJ.core',
		eventHandlers: 'env/eventHandlers',
		// server managing/servering code
		pages: 'server/pages',
		scripts: 'server/scripts',
		Page: 'server/Page',
		sox: 'server/sox',
		Sockets: 'server/Sockets'
	}
});

define(['Page'], function (Page) {
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