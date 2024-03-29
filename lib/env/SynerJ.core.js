define(["shared/SynerJ", "lib/config"], function (sSynerJ, settings) {
 
  // extend the shared SynerJ object with an environment for the user to
  // execute commands in.
  function SynerJ(window) {
    sSynerJ.call(this, window);
    var $ = window.jQuery;
    
    // locked objects
    this.lockedObjects = {};
    this.functionProperties = {};
    // install the id generator if not available yet
    if ($('#SynerJ-idGenerator').length === 0) {
      $('#SynerJ-info').append($('<div id=SynerJ-idGenerator>0</div>'));
    }
  }

  SynerJ.prototype = sSynerJ.prototype;
  SynerJ.__proto__ = sSynerJ.prototype;

 
  // nextId
  SynerJ.prototype.nextId = function nextId() {
    var idGenerator = this.window.jQuery('#SynerJ-idGenerator');
    var id = parseInt(idGenerator.html());
    idGenerator.html(++id);
    return id;
  };

  // create: if no id is given by the client, a unique id
  // is generated by the server.
  SynerJ.prototype._create = (function () {

    // save the shared code method
    var sCreate = sSynerJ.prototype._create;
    
    function create(config) {
      config = typeof config == 'undefined' ? {} : config;
      config.id = typeof config.id == 'undefined' ?
        (settings.DobjectIdName + settings.tagSeparator + this.nextId()) :
        config.id;
      var dobj = sCreate.call(this, config);
      return dobj;
    }

    return create;
  })();
  
    
  SynerJ.prototype._setFunctionString = function (obj, nam, val) {
    var id = obj.id();
    var objs = this.functionProperties;
    var props = objs[id];
    if (!props) props = objs[id] = {};
    val = val.replace(/\n/g, "\\" + "n").replace(/'/g, "\\" + "'");
    props[nam] = val;
  };

  SynerJ.prototype._getFunctionString = function (obj, nam) {
    var id = obj.id();
    var objs = this.functionProperties;
    var props = objs[id];
    if (!props) props = objs[id] = {};
    return objs[id][nam];
  };

  SynerJ.prototype._removeFunctionString = function (obj, nam) {
    var id = obj.id();
    var props = this.functionProperties[id];
    if (!props) return false;
    delete props[nam];
  };

  SynerJ.prototype._addHandler = (function () {
    var sAdd = SynerJ.prototype._addHandler;

    function addHandler(id, event, handler) {
      handler = handler.replace(/\n/g, "\\" + "n").replace(/'/g, "\\" + "'");
      return sAdd.call(this, id, event, handler);
    }

    return addHandler;
  })();

  SynerJ.prototype._updateId = function updateId(old, newId) {
    var objs = this.functionProperties;
    var props = objs[old];
    delete objs[old];
    objs[newId] = props;
  };

  return SynerJ;
});
