define(['require', 'jquery', 'SynerJ', 'libs/ace/lib/ace/ace', 'libs/ace/lib/ace/mode/javascript'], function (require, $, SynerJ, ace) {
  
  // custom editor for SlickGrid that uses other editing
  // types depending on the type of the value it is editing.
  function customEditor(args) {
    var $input, $wrapper, $main;
    var type;
    var defaultValue;
    var scope = this;
    var editor;

    this.init = function() {
      var $container;
      var column = args.column.id;
      defaultValue = args.item[column];
     
      // function as input or if html attr is edited => textarea
      if (defaultValue && defaultValue.indexOf('function') === 0 || column.toLowerCase().indexOf('html') === 0) {
        $container = $("body");
        $wrapper = $("<DIV id=ACEditorWrapper />")
            .appendTo($container);

        $("<DIV style='text-align:right'><BUTTON>Save</BUTTON><BUTTON>Cancel</BUTTON></DIV>")
            .appendTo($wrapper);
        $wrapper.find("button:first").bind("click", this.save);
        $wrapper.find("button:last").bind("click", this.cancel);
        $input = $("<DIV id=ACEditor />")
            .appendTo($wrapper);
        //$input = $("<TEXTAREA hidefocus rows=5 class=native style='backround:white;width:250px;height:80px;border:0;outline:0'>")
        //    .appendTo($wrapper);
        //$input.bind('keydown', checkTab);
        
        //$input.bind("keydown", this.handleKeyDown);
        scope.position(args.position);
        //$input.focus().select();
	      
        editor = ace.edit('ACEditor');
        var JavaScriptMode = require('libs/ace/lib/ace/mode/javascript').Mode;
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

    this.handleKeyDown = function(e) {
      if (e.which == $.ui.keyCode.ENTER && e.ctrlKey) {
          scope.save();
      }
      else if (e.which == $.ui.keyCode.ESCAPE) {
          e.preventDefault();
          scope.cancel();
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
            .css("left", position.left - 5)
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
  
  


 



// Set desired tab- defaults to four space softtab



var tab = "    ";

function checkTab(evt) {

    var t = evt.target;
    var ss = t.selectionStart;
    var se = t.selectionEnd;

    // Tab key - insert tab expansion
    if (evt.keyCode == 9) {
        evt.preventDefault();

        // Special case of multi line selection
       if (ss != se && t.value.slice(ss,se).indexOf("n") != -1) {

        // In case selection was not of entire lines (e.g. selection begins in the middle of a line)



            // we ought to tab at the beginning as well as at the start of every following line.



            var pre = t.value.slice(0,ss);



            var sel = t.value.slice(ss,se).replace(/n/g,"n"+tab);



            var post = t.value.slice(se,t.value.length);



            t.value = pre.concat(tab).concat(sel).concat(post);



                    



            t.selectionStart = ss + tab.length;



            t.selectionEnd = se + tab.length;



        }



                



        // "Normal" case (no selection or selection on one line only)



        else {



            t.value = t.value.slice(0,ss).concat(tab).concat(t.value.slice(ss,t.value.length));



            if (ss == se) {



                t.selectionStart = t.selectionEnd = ss + tab.length;



            }



            else {



                t.selectionStart = ss + tab.length;



                t.selectionEnd = se + tab.length;



            }



        }



    }



            



    // Backspace key - delete preceding tab expansion, if exists



   else if (evt.keyCode==8 && t.value.slice(ss - 4,ss) == tab) {



        evt.preventDefault();



                



        t.value = t.value.slice(0,ss - 4).concat(t.value.slice(ss,t.value.length));



        t.selectionStart = t.selectionEnd = ss - tab.length;



    }



            



    // Delete key - delete following tab expansion, if exists



    else if (evt.keyCode==46 && t.value.slice(se,se + 4) == tab) {



        evt.preventDefault();



              



        t.value = t.value.slice(0,ss).concat(t.value.slice(ss + 4,t.value.length));



        t.selectionStart = t.selectionEnd = ss;



    }



    // Left/right arrow keys - move across the tab in one go



    else if (evt.keyCode == 37 && t.value.slice(ss - 4,ss) == tab) {



        evt.preventDefault();



        t.selectionStart = t.selectionEnd = ss - 4;



    }



    else if (evt.keyCode == 39 && t.value.slice(ss,ss + 4) == tab) {



        evt.preventDefault();



        t.selectionStart = t.selectionEnd = ss + 4;



    }



}



 








 
return customEditor;
});
