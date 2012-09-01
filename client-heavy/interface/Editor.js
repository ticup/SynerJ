define(['SynerJ', 'slickgrid', 'customEditor', 'sox', 'Dobject'],
    function (SynerJ, $, customEditor) {
	var Editor = (function () {

		// constructor
		function Editor() {
			this.jqHeader = createHeader(this);
			this.jqTable = $("<div id='gridContainer'>");
			this.jqContainer = $("<div id='Editor'>");
			this.jqContainer.append(this.jqHeader)
											.append($("<div class='clear'>"))
											.append(this.jqTable);
			$('#SynerJ').append(this.jqContainer);
      this.setupGrid('#gridContainer');
			this.hide();
		};
	

		Editor.prototype.refresh = function () {
      this.data = {};
      this.initFilter();
      if (this.jqEl) {	
        switch (this.type) {
          case 'properties':
            this.jqHeader.find('ul li:first a').trigger('click');
            break;
          case 'attr':
			      this.jqHeader.find('ul li:nth(1) a').trigger('click');
            break;
          case 'css':
			      this.jqHeader.find('ul li:nth(2) a').trigger('click');
            break;
          case 'events':
			      this.jqHeader.find('ul li:nth(3) a').trigger('click');
            break;
        }
      }
		};
		
		// show
		Editor.prototype.show = function (obj) {
      this.jqEl = $(obj.jqEl);
      this.jqContainer.show();
      this.jqHeader.find('ul li:first a').trigger('click');
      this.initFilter();
      this.jqContainer.dialog( { width: 'auto', height: 'auto' });
      this.setTitle();
		};

		// hide
		Editor.prototype.hide = function () {
			this.jqContainer.hide();
		};

		// setTitle
		Editor.prototype.setTitle = function () {
			var title = this.jqEl.attr('id');
			$('#Editor').dialog("option", "title", title);
		  $('#Editor').css('width', 'auto');
    };

		// setupGrid
		Editor.prototype.setupGrid = function(container) {
			var editor = this;
			var data = [];
			this.data = data;
			var columns = [ { id: "name", name: "Name",
												field:"name", editor: customEditor, 
												validator: requiredFieldValidator,
		 										width: 150,
                        sortable: true},
											{ id: "value", name: "Value",
												field:"value", editor: customEditor,
										 		resizable: true,
												width: 185,
                        cssClass: 'jstree-drop',
                        formatter: valueFormatter,
                        sortable: true,
												cannotTriggerInsert: true, }, 
                      { id: "actions",
                        field: "actions",
												editor: customEditor,
                        formatter: linkFormatter,
                        cannotTriggerInsert: true, 
                        width: 20 }];
			var options = { editable: true,
											enableAddRow: true,
                      enableCellNavigation: true,
											asyncEditorLoading: true
										};
			$(container).css('height', '400px');
			$(container).css('width', '370px');
      this.sortcol = "name";
			this.sortAsc = true;
			this.searchString = "";

      // linkFormatter
      function linkFormatter(row, cell, value, columnDef, dataContext) {
        return "<a>" + value + "</a>";
      };

      // valueFormattor
      function valueFormatter(row, cell, value, columnDef, dataContext) {
        if (value.length > 30)
		      return value.slice(0, 30) + "...";
        return value;
      }

      // wire up the grid and dataView
			$(function () {
					editor.dataView = new Slick.Data.DataView();
					editor.grid = new Slick.Grid(container, editor.dataView, columns, options);
					editor.grid.onAddNewRow.subscribe(function(e, args) {
						var item = args.item;
            dobj = SynerJ.get(editor.jqEl);
						switch (editor.type) {
							case 'properties':
								dobj.setProp(item.name, 'undefined', editValue);
								break;
              case 'attr':
                if (item.name.toLowerCase().indexOf('text') === 0) {
                  dobj.text(item.name, 'undefined', editValue);
                  break;
                }
                dobj.setAttr(item.name, 'undefined', editValue);
                break;
              case 'css':
								addNewCss(dobj, item.name, editValue);	
								break;
						  case 'events':
                dobj.bind(item.name, "function (event) {\n}");
                break;  
            }
            // editValue: set the editor to the value of the added row.
            function editValue() {
            editor.dataView.sort(comp, editor.sortAsc);
              var row;
              // find the row of the new cell
              $('.slick-cell').each(function (el) {
                  if ($(this).html() == item.name)
                    row = parseInt($(this).parent().attr('row'));
               });
              // activate edit of the value of the added row
              editor.grid.setActiveCell(row, editor.grid.getColumnIndex('value'));
              editor.grid.editActiveCell();
            }
          });
					editor.grid.onSort.subscribe(function (e, args) {
            editor.sortAsc = args.sortAsc;
						editor.sortcol = args.sortCol.field;
						editor.dataView.sort(comp, args.sortAsc);
					});
          // comparator for sorting
          function comp(a, b) {
            var x = a[editor.sortcol];
            var y = b[editor.sortcol];
            return (x == y ? 0 : (x > y ? 1 : -1));
          };
					editor.grid.onCellChange.subscribe(function (e, args) {
            editCell(args.item.id, args.cell, args.item, editor, clearActive);
            // This sets the last cell active, which does nothing, instead of setting the
            // nex cell in edit mode.
            function clearActive () {
							//editor.dataView.updateItem(args.item.id,args.item);
              var l = editor.dataView.getLength();
              var i = editor.grid.getColumnIndex('value');
              editor.grid.setActiveCell(l, i);
            }
          });
					editor.dataView.onRowCountChanged.subscribe(function (e, args) {
						editor.grid.updateRowCount();
						editor.grid.render();
					}); 

					// necessary for sorting
          editor.dataView.onRowsChanged.subscribe(function (e, args) {
            editor.grid.invalidateRows(args.rows);
						editor.grid.render();
					});

          editor.grid.onBeforeEditCell.subscribe(function (e, args) {
            // If the value requested to be edited is an object, show that object
            // in the editor instead.
            if (args.item &&
                args.item.value &&
                args.column.id === 'value' &&
                args.item.value.indexOf('object:') === 0) {
              var id = args.item.value.slice(7);
              var obj = SynerJ(id);
              editor.show(obj);
              // returning false stops the grid from editing the cell
              return false;
            }
            // actions triggered
            if (args.item && args.column.id === 'actions') {
              var id = args.item.id;
              var obj = SynerJ(editor.jqEl);
              deleteRow(obj, id, editor.type);
              return false;
            }
            var obj = SynerJ(editor.jqEl);
            
            // if object is not locked.
            if (!SynerJ.isLocked(obj)) {
              // undo editing the cell. The cell will be available for editing
              // after a lock is granted.
              editor.grid.setActiveCell(editor.dataView.getLength(), 1);
              editor.grid.editActiveCell();

              // request lock for the object and make it editable when granted.
              SynerJ.lockObject(obj, function afterLockGranted () {
                editor.grid.setActiveCell(args.row, args.cell);
                editor.grid.editActiveCell();
              });
              return false;
            }
          });
          editor.grid.onActiveCellChanged.subscribe(function (e, args) {
             //editor.resetFilter();
          });
					addSearchBox(editor);
			});
		};
	
    function deleteRow(obj, id, type) {
      switch (type) {
        case 'properties':
          obj.removeProp(id);
          break;
        case 'attr':
          obj.removeAttr(id);
          break;
        case 'css':
          obj.removeCss(id);
          break;
        case 'events':
          obj.unbind(id);
          break;
      }
    }

		function addNewCss(dobj, name) {
      var val = dobj.jqEl.css(name);
      dobj.setCss(name, val);
		};


		function requiredFieldValidator(value) {
			if (value == null || value == undefined || !value.length || value.replace(/\s/g, '') == "")
				return { valid:false, msg:"This is a required field" };
			else
				return { valid:true, msg:null };
		}; 

		function addSearchBox(editor) {
			var input = $("<input id=editorSearch class=native type=search>");
			editor.jqHeader.append(input);
			input.keyup(function (e) {
				//Slick.GlobalEditorLock.cancelCurrentEdit();
				// clear on esc
				if (e.which == 27)
					this.value == "";
				editor.searchString = this.value;
				editor.updateFilter();
			});
			editor.initFilter();
		};

		Editor.prototype.updateFilter = function () {
			this.dataView.setFilterArgs({
				searchString: this.searchString
			});
			this.dataView.refresh();
			this.grid.updateRowCount();
			this.grid.render();
		};

		Editor.prototype.initFilter = function () {
			this.dataView.beginUpdate();
			this.dataView.setItems(this.data);
			this.dataView.setFilterArgs({
				searchString: this.searchString
			});
			this.dataView.setFilter(filter);
			this.dataView.endUpdate();
			this.dataView.refresh();
		};

    Editor.prototype.resetFilter = function () {
      this.searchString = "";
      $('#editorSearch').val("");
      this.updateFilter();
    };


		function filter(item, args) {
			if (args.searchString != "" && item["name"].indexOf(args.searchString) == -1)
				return false;
			return true;
		};

		function editCell(id, column, item, editor, callback) {
			var dobj = SynerJ.get(editor.jqEl);
			var type = editor.type;
			var oldName = id;
			var newName = item.name;
			// if you want to implement an undo action, you can keep a stack here
			// with all the editCommands and call .undo() on the pop.
			if (oldName != newName)
				editName(item, dobj, id, type, callback);
			else
				editValue(item, dobj, id, type, callback);
		}

		function editValue(item, dobj, name, type, callback) {
			var newVal = item.value;
			switch (type) {
				case 'properties':
					dobj.setProp(name, newVal, callback);
					break;
        case 'attr':
          if (name.toLowerCase().indexOf("text") === 0) {
            dobj.text(newVal, callback);
            break;
          }
          dobj.setAttr(name, newVal, callback);
          break;
        case 'css':
					dobj.setCss(name, newVal, callback);
					break;
				case 'events':
					dobj.unbind(name);
					dobj.bind(name, newVal, callback);
					break;
			}
		}

		function editName(item, dobj, oldName, type, callback) {
			var name = item.name;
			var val = item.value;
			switch (type) {
				case 'properties':
					dobj.removeProp(oldName);
					dobj.setProp(name, val, callback);
					break;
				case 'attr':
          if (oldName.toLowerCase().indexOf("text") === 0) 
            dobj.text(" ");
          else
            dobj.removeAttr(oldName);
          dobj.setAttr(name, val, callback);
        case 'css':
				// this is not supported;
				 	break;
				case 'events':
					dobj.unbind(oldName);
					dobj.bind(name, val, callback);
					break;	
			}
		}	
    
    // createHeader: 
		createHeader = function (editor) {
			var jqEl = editor.jqEl;
			var header = $("<div class='header'>"
										+ "<ul></ul>"
                    + "</div>");
			var props = $("<li><a>Properties</a></li>");
			var attrs = $("<li><a>Attributes</a></li>");
      var css = $("<li><a>css</a></li>");
			var events = $("<li><a>events</a></li>");
			props.find('a').on('click', editor.createPropertiesHandler(editor));
			attrs.find('a').on('click', editor.createAttrHandler(editor));
			css.find('a').on('click', editor.createCssHandler(editor));
			events.find('a').on('click', editor.createEventsHandler(editor));
			$(header.find('ul')).append(props)
													.append(attrs)
                          .append(css)
													.append(events);
			return header;
		};

    // propsHandler
		Editor.prototype.createPropertiesHandler = function (editor) {
			return function () {
        var properties = editor.jqEl.data();
        var props = {};
        for (var name in properties) {
          var value = properties[name];
          props[name] = value.toString();
        }
        editor.type = 'properties';
        editor.fillTable(props);
        editor.initFilter();
        editor.resetFilter();
      };
		};

    // cssHandler
		Editor.prototype.createCssHandler = function (editor) {
			return function () {
				//var style = window.getComputedStyle(editor.jqEl[0]);
				var style = SynerJ(editor.jqEl)._getStyle();
				editor.type = 'css';
				editor.fillTable(style);
				editor.initFilter();
        editor.resetFilter();
			};
		};
  
    // EventHandler
		Editor.prototype.createEventsHandler = function (editor) {
			return function () {
			 	var obj = SynerJ(editor.jqEl);
        var events = SynerJ.getHandlers(obj.id());
				var data = {};
				for (var name in events) {
					var handler = events[name].toString();
          data[name] = handler; 
				}
				editor.type = 'events';
				editor.fillTable(data);
		 		editor.initFilter();
        editor.resetFilter();
			};
		};		
    
    // Attribute Handler
		Editor.prototype.createAttrHandler = function (editor) {
			return function () {
				var obj = SynerJ(editor.jqEl);
        var data = {};
        var attributes = obj._getAttr();
        for (var i=0; i<attributes.length; i++) {
          var name = attributes[i].name;
          if (name.indexOf('data') !== 0) {
            var value = attributes[i].value;
            data[name] = value;
          }
        }
				var children = obj.children();
        if (children.length == 0) {
          var text = obj.text();
          data['text'] = text;
        }
        editor.type = 'attr';
				editor.fillTable(data);
				editor.initFilter();
        editor.resetFilter();
			};
		};
				
		Editor.prototype.fillTable = function (items) {
			var data = [];
			for (var name in items)
				data.push({ id: name, name: name, value: items[name] , actions: "X"});
			this.data = data;
			this.grid.setData(data);
			this.grid.updateRowCount();
			this.grid.render();
		};
		
		return Editor;
	})();

	return Editor;
});	

