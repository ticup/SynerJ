// client/interface/Inspector.js
//
// Lets you inspect the environment in a tree-like structure.
// Also lets you add, reorder and rename the Dobjects in it.
//
//
define(['config',
        'jquery', 
        'SynerJ',
        'jqueryui/dialog',
        'jstree',
        'sox'],
			function (config, $, SynerJ) {
  
  var Inspector = (function () {

    // Constructor
		function Inspector (Editor) {
      this.jqContainer = $("<div id='Inspector' title='Inspector'>");
			this.Editor = Editor;
			this.init();
		};

    // init: makes and inserts the jstree and adds the necessary buttons
    // to add/edit/delete objects.
		Inspector.prototype.init = function () {
      this.installButtons();
			var jst = this.jst = createTree($('#SynerJ-Objects'));
			var jqContainer = this.jqContainer.append(jst);
      this.installJsTree();
      this.show();
		};
    
    // show
		Inspector.prototype.show = function () {
      this.jqContainer.dialog({height: 500, width: 300, title: 'Inspector'});
    };
	  
    // hide
    Inspector.prototype.hide = function () {
      this.jqContainer.hide();
    };

    // refresh 
		Inspector.prototype.refresh = function () {
		  $('#Inspector').remove();	
			this.init();
		};	
    
    // installJsTree: initializes the jstree
		Inspector.prototype.installJsTree = function() {
			var Editor = this.Editor;
			var container = this.jqContainer;
      var inspctr = this;
      var jst = this.jst;
      $(function () {
				jst.jstree({ "plugins" : ["themes", "html_data", "ui", "dnd", "crrm"],
                     "dnd": {
                        "drop_finish": function (data) {
                          if (SynerJ.Editor.type == 'properties') {
                            var id = data.o.attr('name');
                            var val = SynerJ(id);
                            var cell = data.r;
                            var propCell = cell.siblings('.l0');
                            var prop = propCell.html();
                            var jqEl = Editor.jqEl;
                            var obj = SynerJ(jqEl);
                            obj.setProp(prop, val);
                          }
                        }
                     },
                   })
           .bind("dblclick.jstree", function (event) { 
					    var node = $(event.target).closest("li");
						  var id = node.attr('name');
              var dobj = SynerJ(id);
						  Editor.show(dobj);
					  })
            .bind("move_node.jstree", function (event, data) {
              // if the move_node is triggered by the user dragging the node.
              // this data.rslt.ut is a hack I inserted into jstree, to be able to
              // distinguish user_triggered moves and programmatically triggered moves.
              // Otherwise you get endless server/client loops.
              if(data.rslt.ut) {
                var node = data.rslt.o;
                var child = SynerJ(node.attr('name'));
                var rnode = data.rslt.or;
                // There is a right node given, we can use before.
                if (rnode.length > 0) {
                  return SynerJ(rnode.attr('name')).before(child);
                }
                var pnode = data.rslt.np;
                // No right node given, use append if the parent != root (container).
                if (pnode[0] != jst[0])
                  return SynerJ(pnode.attr('name')).append(child);
                // special case: parent = root
                SynerJ('Dobjects').append(child);
              }
            })
					  .bind("rename_node.jstree", function (event, data) {
              // same as move_node
              if (data.rslt.ut) {
                var nname = data.rslt.name;
                var oname = $(data.rslt.obj).attr('name');
                var obj = SynerJ(oname);
                // set the name back to its old value. If the new value is accepted
                // the node's name will be changed.
                inspctr.renameNode(oname, oname);
                // request id change
                obj.id(nname);
              }
            })
            .delegate("a", "click", function (event, data) { event.preventDefault(); });
			});
		};

    // createTree: creates an ul/li list that corresponds to the structure
    // of the elements in given jqEl.
		function createTree(jqEl) {
      var jst = $('<div id=jstreeBox>');
      var jqLi = createNode(jqEl);
      jst.append(jqLi.children());
      $('#SynerJ').append(jst);
      return jst;
		};
		
    // createNode: creates an li node for the list with corresponding name and children.
		function createNode (jqEl) {
			var jqLi = $("<li name='" + jqEl.attr('id') + "'id= sJstree-" + jqEl.attr('id') + ">"
									+ "<a href='#'>" + jqEl.attr('id') + "</a>"
									+ "</li>");
			var jqUl = $('<ul>');
			jqLi.append(jqUl);
			var children = jqEl.children();
			children.each(function () {
				jqUl.append(createNode($(this)));
			});
			return jqLi;
		};
		
    // installButtons: installs the add/edit/delete buttons with corresponding triggers.
    Inspector.prototype.installButtons = function () {
      var container = $('<div class=actions></div>');
      this.jqContainer.append(container);
      var editor = this.Editor;
      var jst = this.jst;
      var self = this;
      $(function () {
        // DOM types dropdown
        var select = $("<select>");
        var types = config.DOMtypes;
        for(var i=0; i<types.length; i++) {
          select.append($("<option value=" + types[i] + (types[i] == 'none' ? " selected=selected>" : ">") + types[i] + "</option>"));
        }
        
        // Create button
        var create = $("<a>create</a>");
        create.bind('click', function (e) {
          var type = select[0].options[select[0].selectedIndex].value;
          SynerJ.create({type: type});
          e.preventDefault();
        });

        // Clone button
        var clone = $("<a>clone</a>");
        clone.bind('click', function (e) {
          var id = self.getSelectedId();
          var dobj = SynerJ(id);
          dobj.clone();
          e.preventDefault();
        });

        // Edit button
        var edit = $("<a>edit</a>");
        edit.bind('click', function (e) {
          var id = self.getSelectedId();
          var dobj = SynerJ(id);
          if (dobj)
            editor.show(dobj);
          e.preventDefault();
        });
          
        // Rename button
        var rename = $('<a>rename</a>');
        rename.bind('click', function (e) {
          var id = self.getSelectedId();
          if (id)
            self.jst.jstree("rename", '#sJstree-' + id);
          e.preventDefault();
        });
        // Delete button
        var del = $("<a>delete</a>");
        del.bind('click', function (e) {
          var id = self.getSelectedId();
          if (id)
            SynerJ.delete(id);
          e.preventDefault();
        });

        // insert into container.
        container.append(select)
                 .append(create)
                 .append(clone)
                 .append(edit)
                 .append(rename)
                 .append(del);
       });
    };
  
    // getSelected: returns the current selected Dobject
    Inspector.prototype.getSelectedId = function () {
      var id = this.jst.jstree('get_selected').attr('name');
      return id;
    };
	
    // addNode
    Inspector.prototype.addNode = function(id, parentId) {
      this.jst.jstree("create", parentId ? "#sJstree-" + parentId : -1, "last",
        { attr: { id: "sJstree-" + id, name: id },
          data: id }
        , false, true);
    };

    // deleteNode
    Inspector.prototype.deleteNode = function (id) {
      this.jst.jstree("remove", "#sJstree-" + id);
    };

    // beforeNode
    Inspector.prototype.beforeNode = function (rId, lId) {
      this.jst.jstree("move_node", "#sJstree-" + lId, "#sJstree-" + rId, "before");
    };

    // appendNode
    Inspector.prototype.appendNode = function (parentId, childId) {
      // special case: parent = root
      if (parentId == 'Dobjects') 
        this.jst.jstree("move_node", "#sJstree-" + childId, -1, "last");
      else
        this.jst.jstree("move_node", "#sJstree-" + childId, "#sJstree-" + parentId);
    };
    
    // renameNode
    Inspector.prototype.renameNode = function (id, newId) {
      var node = $("#sJstree-" + id);
      this.jst.jstree("rename_node", node, newId);
      node.attr('id', "sJstree-" + newId);
      node.attr('name', newId);
    };

		return Inspector;
	})();

	return Inspector;
});
