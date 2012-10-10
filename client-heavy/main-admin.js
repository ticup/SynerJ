require.config({
	paths: {
  // libraries
		jquery: 'libs/jquery/jquery-require',
		jqueryui: 'libs/jquery-ui-require/jqueryui',
		hotkeys: 'libs/jquery/jquery.hotkeys',
    eventdrag: 'libs/jquery/jquery.event.drag-2.0.min',
    jstree: 'libs/jstree/jstree.jquery.require',
		slickgrid: 'libs/SlickGrid/slick.grid.require',
    order: 'libs/order',
    text: 'libs/text',
    socket: 'libs/socket/socket.io',
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
  // client interface code
    Menu: '../client/interface/Menu',
    Evaluator: '../client/interface/Evaluator',
    Inspector: '../client/interface/Inspector',
    Editor: '../client/interface/Editor',
    customEditor: '../client/interface/customEditor',
  // misc
    sConfig: '../shared/config',
    config: '../client/config'
	},
  priority: ['jquery'],
  baseUrl: window.location.protocol + "//" + window.location.host + "/public"

});
var propsLink = "public/js/" + window.location.pathname.slice(1).split(".")[0] + ".js";
require(["jquery", "SynerJ", "Inspector",
         "Editor", "Evaluator", "Menu", "require", propsLink
         ],
	function($, SynerJ, Inspector, Editor, Evaluator, Menu, require) {

  SynerJ.Editor = new Editor();
  SynerJ.Inspector = new Inspector(SynerJ.Editor);
  SynerJ.Evaluator = new Evaluator();
  SynerJ.Menu = new Menu(SynerJ.Inspector, SynerJ.Evaluator, SynerJ.Mode);
  
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
