define(["order!jquery",
        'order!hotkeys'],
        function ($) {
  
  var Menu = (function () {
    
    // Constructor
    function Menu(Inspector, Evaluator, Mode) {
      // menu container
      this.jqContainer = $("<div id=SynerJ-Menu></div>");
      
      // save variables
      this.Inspector = Inspector;
      this.Evaluator = Evaluator;
      this.Mode = Mode;
      
      installTitle(this);
      installButtons(this);
      installInfo(this);
      
      // setup show/hide listener
      setupListener(this);

      // add container to document
      $('#SynerJ').append(this.jqContainer);
     }

      
     // creates the buttons to show the Inspector and Evaluator
     // and appends them to the jqContainer.
     function installButtons(menu) {
      // show inspector button
      var inspector = $('<button>show inspector</button>');
      inspector.bind('click', function (e) {
        menu.Inspector.show();
        e.preventDefault();
      });

      // show evaluator button
      var evaluator = $('<button>show evaluator</button>');
      evaluator.bind('click', function (e) {
        menu.Evaluator.show();
        e.preventDefault();
      });
      
      // application mode button
      var application = $('<button>Application Mode</button>');
      application.bind('click', function (e) {
        menu.Mode.application();
        e.preventDefault();
      });

      // development mode button
      var development = $('<button>Development Mode</button>');
      development.bind('click', function (e) {
        menu.Mode.development();
        e.preventDefault();
      });

      // add to container
      menu.jqContainer.append(inspector)
                      .append(evaluator)
                      .append(application)
                      .append(development);

     }

     // installTitle
     function installTitle(menu) {
      var title = $('<h1> SynerJ </h1>');
      menu.jqContainer.append(title);
     }

     // installInfo
     function installInfo(menu) {
      var info = $('<p> You can hide/show this toolbar by pressing ctrl+h </p>');
      menu.jqContainer.append(info);
     }
      
     // setupListener: sets up a listener that hides/shows the menu upon ctr+h
     function setupListener(menu) {
      $(document).bind('keydown', 'ctrl+h', function (e) {
        menu.jqContainer.toggle();
      });
     }

     return Menu;
  })();

  return Menu;
});
