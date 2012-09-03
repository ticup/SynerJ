// client/interface/customEditor.js
//
// Custom editor for the SlickGrid library used by client/interface/Editor.js
// This makes sure the appropriate actions happen when the user wants to edit a cell
// according to which type of property it tries to edit.
//
// Uses the ACE library to edit functions.
//
// Author: Tim Coppieters
// Date: September 2011

define(['require', 'jquery', 'SynerJ', 'ace/lib/ace/ace', 'ace/lib/ace/mode/javascript'],
  function (require, $, SynerJ, ace, aceJS) {
  
  // custom editor for SlickGrid that uses other editing
  // types depending on the type of the value it is editing.
  function customEditor(args) {
    var $input, $wrapper, $main;
    var type;
    var defaultValue;
    var self = this;
    var editor;

    this.init = function() {
      var $container;
      var column = args.column.id;
      defaultValue = args.item[column];
     
      // function as input => ACE editor
      if (defaultValue && defaultValue.indexOf('function') === 0) {
        $container = $("body");
        $wrapper = $("<DIV id=ACEditorWrapper />")
            .appendTo($container);

        $("<DIV style='text-align:right'><BUTTON>Save</BUTTON><BUTTON>Cancel</BUTTON></DIV>")
            .appendTo($wrapper);
        $wrapper.find("button:first").bind("click", this.save);
        $wrapper.find("button:last").bind("click", this.cancel);
        $input = $("<DIV id=ACEditor />")
            .appendTo($wrapper);
        self.position(args.position);

        editor = ace.edit('ACEditor');
        var JavaScriptMode = aceJS.Mode;
        editor.getSession().setMode(new JavaScriptMode());

        type = 'function';
        $main = $wrapper;


        // attribute as input => input
      } else {
        $input = $("<INPUT type=text class='native editor-text' />")
          .appendTo(args.container)
          .bind("keydown.nav", function(e) {
              if (e.keyCode === $.ui.keyCode.LEFT || e.keyCode === $.ui.keyCode.RIGHT) {
                  e.stopImmediatePropagation();
              }
          })
          .focus()
          .select();
          
         type = 'attribute';
         $main = $input;
      }
     };

    // handle special keyboard strokes
    this.handleKeyDown = function(e) {
      if (e.which == $.ui.keyCode.ENTER && e.ctrlKey) {
          self.save();
      }
      else if (e.which == $.ui.keyCode.ESCAPE) {
          e.preventDefault();
          self.cancel();
      }
      else if (e.which == $.ui.keyCode.TAB && e.shiftKey) {
          //e.preventDefault();
         // grid.navigatePrev();
      }
      else if (e.which == $.ui.keyCode.TAB) {
         //e.preventDefault();
         
         //grid.navigateNext();
      }
    };

    this.save = function() {
      args.commitChanges();
    };

    this.cancel = function() {
      $input.val(defaultValue);
      args.cancelChanges();
    };

    this.hide = function() {
      $main.hide();
    };

    this.show = function() {
      $main.show();
    };

    this.position = function(position) {
      if(type === 'function')
        $wrapper
            .css("top", position.top - 5)
            .css("left", position.left - 5);
    };

    this.destroy = function() {
      SynerJ.freeObject();
      $main.remove();
    };

    this.focus = function() {
      $main.focus();
    };

    this.loadValue = function(item) {
      var val = item[args.column.field];
      if (type === 'function') {
        val = val.toString();
        editor.getSession().setValue(val);
      } else {
        $input.val(defaultValue = val);
        $input.select();
      }
    };

    this.serializeValue = function() {
      if (type === 'function')
        return editor.getSession().getValue();
      return $input.val();
    };

    this.applyValue = function(item,state) {
      item[args.column.field] = state;
    };

    this.isValueChanged = function() {
      var val = getVal();
      return (!(val == "" && defaultValue == null)) && (val != defaultValue);
    };

    this.validate = function() {
      var val = getVal();
      if (args.column.validator) {
        var validationResults = args.column.validator(val);
        if (!validationResults.valid)
          return validationResults;
      }
      return {
        valid: true,
        msg: null
      };
    };

    function getVal() {
      if (type === 'function')
        return editor.getSession().getValue();
      return $input.val();
    }

    this.init();
  }
 
return customEditor;
});
