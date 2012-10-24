require.config({
  shim: {
    slickGrid: ['jquery'],
    jqueryui: ['jquery']
  },
	paths: {
  // libraries
		jquery: 'libs/jquery/jquery-require',
		jqueryui: 'libs/jquery-ui-require/jqueryui',
		hotkeys: 'libs/jquery/jquery.hotkeys',
    eventdrag: 'libs/jquery/jquery.event.drag-2.0.min',
    jstree: 'libs/jstree/jstree.jquery.require',
		slickgrid: 'libs/slick.grid.require',
    socket: 'libs/socket/socket.io',
    order: 'libs/requirejs/order',
    text: 'libs/requirejs/text',
  // shared env code
    'shared/Dobject': '../shared/Dobject',
    'shared/Dobject.core': '../shared/Dobject.core',
    'shared/SynerJ': '../shared/SynerJ',
    'shared/SynerJ.core': '../shared/SynerJ.core',
    'shared/eventHandlers': '../shared/eventHandlers',
  // client env code
    Dobject : '../client/env/Dobject',
    'Dobject.core' : '../client/env/Dobject.core',
    SynerJ: '../client/env/SynerJ',
    Mode: '../client/env/Mode',
    eventHandlers: '../client/env/eventHandlers',
    sox: '../client/env/sox',
  // misc
    'shared/css': '../shared/css',
    'shared/config': '../shared/config',
    config: '../client/config'
	},
  baseUrl: window.location.protocol + "//" + window.location.host + window.location.pathname.split("/").slice(0, -1).join("/") + "/public"

});
var propsLink = "public/js/" + window.location.pathname.slice(1).split(".")[0] + ".js";
define(["jquery", "SynerJ", "require", "Mode", "sox", propsLink],
	function($, SynerJ, require, Mode) {

  var installProperties = require(propsLink);
  var parent = SynerJ(SynerJ.objectsParent);
  SynerJ.Mode = new Mode(SynerJ);
  SynerJ.Mode.application();

  $(function () {
    SynerJ.Mode.application();
  });
});
