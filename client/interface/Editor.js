// client/interface/Editor.js
//
// Provides a User Interface to edit a Dobject its properties, css properties, event handlers
// and attributes.
//
// Uses the SlickGrid library to display the table
// NOTE: a little hack is inserted into the library (see README)
//
// Uses the ACE library to edit functions with syntax highlighting etc.
//
// Author: Tim Coppieters
// Date: september 2011

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
		}
	
    // refresh: checks which table is currently active and updates it with the current data.
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

		// setupGrid: sets SlickGrid (column and data info)
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
                      forceFitColumns: true,
											asyncEditorLoading: true
										};
			$(container).css('height', '400px');
			$(container).css('width', '370px');
      this.sortcol = "name";
			this.sortAsc = true;
			this.searchString = "";

      // linkFormatter: makes a link out of given value
      function linkFormatter(row, cell, value, columnDef, dataContext) {
        return "<a>" + value + "</a>";
      }

      // valueFormattor: limits the length of given value to 30
      function valueFormatter(row, cell, value, columnDef, dataContext) {
        if (value.length > 30)
          return value.slice(0, 30) + "...";
        return value;
      }
      
      // requireFieldValidator: validator that check if given value has a value.
      // Used for the name column of the grid.
      function requiredFieldValidator(value) {
        if (value === null || value === undefined || !value.length || value.replace(/\s/g, '') === "")
          return { valid: false, msg: "This is a required field" };
        else
          return { valid: true, msg: null };
      }

      // wire up the grid and dataView
			$(function () {
					// set up dataView and grid
          editor.dataView = new Slick.Data.DataView();
					editor.grid = new Slick.Grid(container, editor.dataView, columns, options);
          
          // onAddNewRow: check which properties are currently displayed and act appropriately
					editor.grid.onAddNewRow.subscribe(function(e, args) {
						var item = args.item;
            dobj = SynerJ.get(editor.jqEl);
						switch (editor.type) {
							case 'properties':
								dobj.setProp(item.name, 'undefined', editValue);
								break;
              case 'attr':
                if (item.name.toLowerCase() == 'text') {
                  dobj.text(item.name, 'undefined', editValue);
                  break;
                }
                dobj.attr(item.name, 'undefined', editValue);
                break;
              case 'css':
								addNewCss(dobj, item.name, editValue);
								break;
              case 'events':
                dobj.bind(item.name, "function (event) {\n}");
                break;
            }

            // gotoNewRow: set the editor to the value of the added row.
            function gotoNewRow() {
              editor.dataView.sort(comp, editor.sortAsc);
              var row;
              // find the row of the new cell
              $('.slick-cell').each(function (el) {
                  if ($(this).html() == item.name)
                    row = parseInt($(this).parent().attr('row'), 10);
               });
              // activate edit of the value of the added row
              editor.grid.setActiveCell(row, editor.grid.getColumnIndex('value'));
              editor.grid.editActiveCell();
            }
          });

          // onSort: sort the data
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
          }

          // onCellChange: execute command that lies underneath the editing of the cell
          // and stop the UI of actually displaying the change. The change will be displayed
          // when the server instructs the client to do so.
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

          // onRowCountChanged: update the grid
					editor.dataView.onRowCountChanged.subscribe(function (e, args) {
						editor.grid.updateRowCount();
						editor.grid.render();
					});

					// onRowsChanged: necessary for sorting
          editor.dataView.onRowsChanged.subscribe(function (e, args) {
            editor.grid.invalidateRows(args.rows);
						editor.grid.render();
					});

          // onBeforeEditCell: Some cells are not used for editing or objects that are
          // not locked cannot be edited either, this should be checked here and acted
          // upon appropriately. If you return false, the normal editing will not continue.
          editor.grid.onBeforeEditCell.subscribe(function (e, args) {
            var id, obj;
            // If the value requested to be edited is an object, show that object
            // in the editor instead.
            if (args.item &&
                args.item.value &&
                args.column.id === 'value' &&
                args.item.value.indexOf('object:') === 0) {
              id = args.item.value.slice(7);
              obj = SynerJ(id);
              editor.show(obj);
              // returning false stops the grid from editing the cell
              return false;
            }
            // actions triggered
            if (args.item && args.column.id === 'actions') {
              id = args.item.id;
              obj = SynerJ(editor.jqEl);
              deleteRow(obj, id, editor.type);
              return false;
            }
            obj = SynerJ(editor.jqEl);
            
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

          // onActiveCellChanged
          editor.grid.onActiveCellChanged.subscribe(function (e, args) {
             //editor.resetFilter();
          });

          // addSearchBox: add a filter input field to the editor
					addSearchBox(editor);
			});
		};
	
    // deleteRow: called when the row with given id was deleted by the user.
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

    // addNewCss: executed when the user added the css property name through the ui.
		function addNewCss(dobj, name) {
      var val = dobj.jqEl.css(name);
      dobj.setCss(name, val);
		}


    // editCell: function called when the user edited given cell
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

    // editValue: function called when user edited a value cell.
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
          dobj.attr(name, newVal, callback);
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

    // editName: function called when the user edit a name cell
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
            dobj.attr(name, val, callback);
            break;
        case 'css':
				// this is not supported;
          break;
				case 'events':
					dobj.unbind(oldName);
					dobj.bind(name, val, callback);
					break;
			}
		}
    
    // addSearchBox: adds a search input field to the editor
		function addSearchBox(editor) {
			var input = $("<input id=editorSearch class=native type=search>");
			editor.jqHeader.append(input);
			input.keyup(function (e) {
				//Slick.GlobalEditorLock.cancelCurrentEdit();
				// clear on esc
				if (e.which == 27)
					this.value = "";
				editor.searchString = this.value;
				editor.updateFilter();
			});
			editor.initFilter();
		}

    // updateFilter: adjusts the displayed data to the search string
		Editor.prototype.updateFilter = function () {
      var searchString = this.searchString;
			this.dataView.setFilterArgs({
				searchString: searchString
			});
			this.dataView.refresh();
			this.grid.updateRowCount();
			this.grid.render();
		};

    // initFilter: updates the grid with the data and applies the filter
		Editor.prototype.initFilter = function () {
      var searchString = this.searchString;
			this.dataView.beginUpdate();
			this.dataView.setItems(this.data);
			this.dataView.setFilterArgs({
				searchString: searchString
			});
			this.dataView.setFilter(filter);
			this.dataView.endUpdate();
			this.dataView.refresh();
		};

    // resetFilter: resets the search string.
    Editor.prototype.resetFilter = function () {
      this.searchString = "";
      $('#editorSearch').val("");
      this.updateFilter();
    };

    // filter: function used to filter an item from the grid
    // true: show row, false: hide row
		function filter(item, args) {
			if (args.searchString !== "" && item["name"].indexOf(args.searchString) === -1) {
				return false;
      }
			return true;
		}
    
    // createHeader:
		createHeader = function (editor) {
			var jqEl = editor.jqEl;
			var header = $("<div class='header'>" +
                     "<ul></ul>" +
                     "</div>");
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

    // createPropertiesHandler: creates a function that upon execution
    // shows the current object its properties in the table.
		Editor.prototype.createPropertiesHandler = function (editor) {
			return function () {
        var properties = SynerJ(editor.jqEl)._prop();
        var props = {};
        for (var name in properties) {
          var value = properties[name];
          props[name] = value.toString();
        }
        editor.type = 'properties';
        editor.fillTable(props);
        editor.resetFilter();
        setActiveStyle(this);
      };
		};

    // createCssHandler: creates a function that upon execution
    // shows the current object its css properties in the table.
		Editor.prototype.createCssHandler = function (editor) {
			return function () {
				//var style = window.getComputedStyle(editor.jqEl[0]);
				var style = SynerJ(editor.jqEl)._getStyle();
				editor.type = 'css';
				editor.fillTable(style);
        editor.resetFilter();
        setActiveStyle(this);
			};
		};
  
    // createEventsHandler: creates a function that upon execution
    // shows the current object its event handlers in the table.
		Editor.prototype.createEventsHandler = function (editor) {
			return function () {
        var obj = SynerJ(editor.jqEl);
        var events = SynerJ._getHandlers(obj.id());
				var data = {};
				for (var name in events) {
					var handler = events[name].toString();
          data[name] = handler;
				}
				editor.type = 'events';
				editor.fillTable(data);
        setActiveStyle(this);
			};
		};
    
    // createAttrHandler: creates a function that upon execution
    // shows the current object its attributes in the table.
		Editor.prototype.createAttrHandler = function (editor) {
			return function () {
				var obj = SynerJ(editor.jqEl);
        var data = {};
        var attributes = obj._attr();
        for (var i=0; i<attributes.length; i++) {
          var name = attributes[i].name;
          if (name.indexOf('data') !== 0) {
            var value = attributes[i].value;
            data[name] = value;
          }
        }
				var children = obj.children();
        if (children.length === 0) {
          var text = obj.text();
          data['text'] = text;
        }
        editor.type = 'attr';
				editor.fillTable(data);
        setActiveStyle(this);
			};
		};
			
    // fillTable: helper that fills the grid with given items
    // items object must be a mapping of name to value.
		Editor.prototype.fillTable = function (items) {
      // reset table (otherwise it sometimes bugs)
      this.dataView.beginUpdate();
      this.dataView.setItems([]);
      this.dataView.endUpdate();
      this.dataView.refresh();
      this.grid.updateRowCount();
      this.grid.render();

      // fill the table
			var data = [];
			for (var name in items)
				data.push({ id: name, name: name, value: items[name] , actions: "X"});
			this.data = data;
			//this.grid.setData(data);
			this.dataView.beginUpdate();
			this.dataView.setItems(data);
			this.dataView.endUpdate();
			this.dataView.refresh();
      this.grid.updateRowCount();
      this.grid.invalidateRows();
			this.grid.render();
      this.initFilter();
      this.resetFilter();
		};

    // sets given li of the Editor header list to active
    function setActiveStyle(li) {
      $('#Editor ul li a').removeClass('active');
      $(li).addClass('active');
    }

		return Editor;
	})();

	return Editor;
});

