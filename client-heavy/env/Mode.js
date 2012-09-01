define(['config', 'SynerJ', 'jqueryui/draggable'], function (config, SynerJ) {
  
  var Mode = (function () {
    
    // constructor
    function Mode(SynerJ) {
      this.SynerJ = SynerJ;
      this.active = 1;
    }

    // isDevelopment
    Mode.prototype.isDevelopment = function () {
      return (this.active === 0);
    };
    
    // isApplication
    Mode.prototype.isApplication = function () {
      return (this.active === 1);
    };
    
    // development mode
    Mode.prototype.development = function () {
      var SynerJ = this.SynerJ;

      // set active mode to development
      this.active = 0;

      // get the parent of all the Dobjects
      var parent = SynerJ(config.DobjectsParent);
      
      // remove all the current active eventHandlers from the Dobject
      function unbindHandlers(obj) {
        var events = obj.jqEl.data('events');
        for (var name in events)
          obj.jqEl.unbind(name);
        }
      
      // make the Dobject draggable
      function enableDrag(obj) {
        obj.jqEl.draggable({
          cancel: false,
          drag: function (e, ui) {
            var left = ui.position.left;
            var top = ui.position.top;
            obj.setCss('left', left + "px");
            obj.setCss('top', top + "px");
          } });
      }
      
      // do this for all Dobjects
      SynerJ.treeWalk(parent, function (obj) {
        unbindHandlers(obj);
        enableDrag(obj);
      });
      
      // fix style=relative of .draggable
      SynerJ.treeWalk(parent, function (obj) {
        obj.jqEl.removeAttr('style');
      });
    };
    

    // application mode
    Mode.prototype.application = function () {
      var Synerj = this.SynerJ;
      // set active mode to application
      this.active = 1;
      
      // get the parent of all the Dobjects
      var parent = SynerJ(config.DobjectsParent);
      
      // get the Dobject's handlers and bind them to it.
      function bindHandlers(obj) {
        var id = obj.id();
        var handlers = SynerJ.getHandlers(id);
        for (var event in handlers) {
          obj._listenForEvent(event);
        }
      }
      
      // disable draggable
      function disableDrag(obj) {
        obj.jqEl.draggable("destroy");
        obj.jqEl.removeAttr('style');
      };

      // do this for all Dobjects (all childeren of the Dobjects parent)
      SynerJ.treeWalk(parent, function (obj) {
        disableDrag(obj);
        obj._listForEvents;
      });
    };
    

    return Mode;
  })();

  return Mode;
});
