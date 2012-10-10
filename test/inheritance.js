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

		describe('CSSOM:', function () {

			function getRuleCount(page, id) {
				var classRuleCount = 0;
				var idRuleCount = 0;
				var sheet = page.window.document.styleSheets[1];
				var rules = sheet.cssRules;
				for (var i = 0; i<rules.length; i++) {
					var name = rules[i].selectorText;
					if (name === '.' + id) {
						classRuleCount++;
					} else if (name === '#' + id) {
						idRuleCount++;
					}
				}
				return {
					classRuleCount	: classRuleCount,
					idRuleCount			: idRuleCount
				};
			}

			describe('Every Dobject with style has an id and class rule:', function () {
				var obj = SynerJ.create();
				var id = obj.id();

				it('should not have rules when newly created and no style yet', function (done) {
					var counts = getRuleCount(page, id);
					counts.classRuleCount.should.equal(0);
					counts.idRuleCount.should.equal(0);
					done();
				});

				it('should have the 2 rules when style is added', function (done) {
					obj.setCss('width', '200px');
					var counts = getRuleCount(page, id);
					counts.classRuleCount.should.equal(1);
					counts.idRuleCount.should.equal(1);
					done();
				});

				it('should rename the 2 rules when the Dobject is renamed', function (done) {
					var newID = 'newID';
					obj.id(newID);
					var counts = getRuleCount(page, id);
					counts.classRuleCount.should.equal(0);
					counts.idRuleCount.should.equal(0);
					counts = getRuleCount(page, newID);
					counts.classRuleCount.should.equal(1);
					counts.idRuleCount.should.equal(1);
					done();
				});

				it('should rename the 2 rules when the Dobject is renamed (/w prototype and no rules)',
					function (done) {
						var obj2 = SynerJ.create();
						var obj3 = SynerJ.create();
						obj2.setProp('prototype', obj3);
						var id2 = obj2.id();
						var id3 = obj3.id();
						var newID = 'newID2';
						obj2.id(newID);
						var counts = getRuleCount(page, id2);
						counts.classRuleCount.should.equal(0);
						counts.idRuleCount.should.equal(0);
						counts = getRuleCount(page, id3);
						counts.classRuleCount.should.equal(1);
						counts.idRuleCount.should.equal(1);
						counts = getRuleCount(page, newID);
						counts.classRuleCount.should.equal(1);
						counts.idRuleCount.should.equal(1);
						done();
				});

				it('should remove the 2 rules when the Dobject is deleted', function (done) {
					SynerJ.delete(obj);
					var counts = getRuleCount(page, id);
					counts.classRuleCount.should.equal(0);
					counts.idRuleCount.should.equal(0);
					done();
				});

				it('should not add rules after reinitializing the page', function (done) {
					var obj = SynerJ.create();
					obj.setCss('width', '200px');
					var id = obj.id();
					page.save(function () {
						new Page('test', function (page) {
							var counts = getRuleCount(page, id);
							counts.classRuleCount.should.equal(1);
							counts.idRuleCount.should.equal(1);
							page.window.SynerJ.delete(obj);
							done();
						}, true);
					});
				});

				// using setProperty(val, "", "") (in removeInheritCss) to remove a property from the CSSOM ,
				// caused to add the rule several times. Using removeProperty instead fixed this.
				it('should not add rules after reinitializing the page (with inheritance)', function (done) {
					var prot1 = SynerJ.create();
					var prot2 = SynerJ.create();
					var obj = SynerJ.create();
					obj.prototype = prot1;
					prot1.prototype = prot2;
					var id = obj.id();
					obj.setCss('width', '200px');
					prot1.setCss('width', '600px');
					prot2.setCss('width', '800px');
					prot2.setCss('color', 'red');
					obj.prototype = prot1;
					obj.prototype = prot1;
					page.save(function () {
						new Page('test', function (page) {
							var counts = getRuleCount(page, id);
							counts.classRuleCount.should.equal(1);
							counts.idRuleCount.should.equal(1);
							done();
						}, true);
					});
				});

				it('should add the css to the id rule when css is set', function (done) {
					var obj = SynerJ.create();
					obj.setCss('width', '200px');
					var id = obj.id();
					var counts = getRuleCount(page, id);
					counts.classRuleCount.should.equal(1);
					counts.idRuleCount.should.equal(1);
					page.window.SynerJ.delete(obj);
					done();
				});

			});
		});
	}, false);
});