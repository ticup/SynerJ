define(['order!jquery',
        'libs/ace/lib/ace/ace',
        'SynerJ',
        'libs/ace/lib/ace/mode/javascript',
        'order!hotkeys',
        'order!jqueryui/dialog',
        'sox'], function($, ace, SynerJ) {
  
  var Evaluator = (function () {
    
    // constructor
    function Evaluator() {
      this.jqContainer = $("<div id=Evaluator></div>"); 
      this.textarea = $('<div id=EvaluatorArea>');
      this.output = $('<div id=EvaluatorOutput>');
      this.jqContainer.append(this.textarea);
      this.jqContainer.append(this.output);
      $('#SynerJ').append(this.jqContainer);
      
      //insertInfo(this);
      insertButton(this);

      this.editor = ace.edit('EvaluatorArea');
      var JavaScriptMode = require('libs/ace/lib/ace/mode/javascript').Mode;
      this.editor.getSession().setMode(new JavaScriptMode());
      
      this.jqContainer.hide();
      //this.setupListener();
    }
    
    // show
    Evaluator.prototype.show = function () {
      var evaluator = this;
      var d = $('#Evaluator');
      d.dialog();
      d.dialog({title: 'Evaluator',
                width: 500,
                height: 600,
                resizeStop: function (event, ui) {
                  var width = d.dialog('option', 'width');
                  var height = d.dialog('option', 'height');
                  console.log('setting width: ' + width);
                  console.log('setting height: ' + height);

                  evaluator.textarea.css('width', width - 25);
                  evaluator.textarea.css('height', height - 150);
                  evaluator.editor.resize();

                  evaluator.output.css('width', width - 25);
                  evaluator.output.css('margin-top', height - 125);

                }
                });
    };
    
    // sets up a listener for ctrl+e to evaluate the code
    Evaluator.prototype.setupListener = function () {
      $(function () {
        $('#EvaluatorArea').bind('keydown', 'ctrl+e', evaluateSelected);
      });
    };
    
    // evaluates the selected code
    function evaluateSelected() {
      var text = $('#EvaluatorArea').val(); 
      if (text === '')
        text = $('#EvaluatorArea').html();
      $.globalEval(text);
    }
    
    // get the selected text
    function getSelected() {
      var t = '';
      if(window.getSelection){
        t = window.getSelection();
      }else if(document.getSelection){
        t = document.getSelection();
      }else if(document.selection){
        t = document.selection.createRange().text;
      }
      return t;
    }

    // insertInfo
    function insertInfo(evaluator) {
      var info = $('<p> You can evaluate your code by pressing ctrl+e </p>');
      evaluator.jqContainer.append(info);
    };

    // insertButton
    function insertButton(evaluator) {
      var button = $('<button> Evaluate </button>');
      evaluator.jqContainer.append(button);
      button.bind('click', function evaluate(e) {
        var text = evaluator.editor.getSession().getValue();
        var result = eval(text);
        evaluator.output.html(result);
      });
    }
  return Evaluator;
  })();

  return Evaluator;
 });

    

