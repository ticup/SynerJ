require.config({
	paths: {
  // libraries
		jquery: 'libs/jquery/jquery-require',
		jqueryui: 'libs/jquery-ui-require/jqueryui',
		hotkeys: 'libs/jquery/jquery.hotkeys',
    eventdrag: 'libs/jquery/jquery.event.drag-2.0.min',
    jstree: 'libs/jstree/jstree.jquery.require',
		slickgrid: 'libs/SlickGrid/slick.grid.require',
    socket: 'libs/socket/socket.io',
    order: 'libs/order',
    text: 'libs/text',
  // shared env code
    sDobject: '../shared/Dobject',
    'sDobject.core': '../shared/Dobject.core',
    sSynerJ: '../shared/SynerJ',
    'sSynerJ.core': '../shared/SynerJ.core',
    sEventHandlers: '../shared/eventHandlers',
  // client env code
    Dobject : '../client/env/Dobject',
    SynerJ: '../client/env/SynerJ',
    Mode: '../client/env/Mode',
    eventHandlers: '../client/env/eventHandlers',
    sox: '../client/env/sox',
  // misc
    sConfig: '../shared/config',
    config: '../client/config',
	},
  priority: ['jquery'],
  baseUrl: window.location.protocol + "//" + window.location.host + window.location.pathname.split("/").slice(0, -1).join("/") + "/public"

});
var propsLink = "public/js/" + window.location.pathname.slice(1).split(".")[0] + ".js";
define(["jquery", "SynerJ", "require", "sox", propsLink], 
	function($, SynerJ, require) {

  var installProperties = require(propsLink);
  var parent = SynerJ(SynerJ.objectsParent);

  $(function () {
    // shared inputs
    $('input, textarea:not(.native)').live('change', function (e) {
      if (!$(this).hasClass('native'))
        SynerJ($(this).attr('id')).setAttr('value', $(this).val());
    });
  });
});
