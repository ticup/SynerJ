// shared/SynerJ.js
//
// Adds the synchronized methods to the SynerJ object for:
// - add
// - delete
// - get
//
// Author: Tim Coppieters
// Date: September 2011

define(['shared/SynerJ.core', 'Dobject'], function (SynerJ, Dobject) {
      
  // sync
  SynerJ.prototype.sync = function () {
    throw({message: "ERROR: SynerJ.sync must be defined by both client and server"});
  };

  // get
  SynerJ.prototype.get = SynerJ.prototype._get;
  
  // create
  SynerJ.prototype.create = function (config, callback) {
    config = typeof config == 'undefined' ? {} : config;
    if (config.parent && Dobject.instanceOf(config.parent)) {
      config.parentId = config.parent.id();
      delete config.parent;
    }
    this.sync('create', config, callback);
  };

  // delete
  SynerJ.prototype.delete = function (obj, callback) {
    var id = obj;
    if (Dobject.instanceOf(obj))
      id = obj.id();
    this.sync('delete', { id: id }, callback);
  };

  return SynerJ;
});
