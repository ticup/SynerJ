// client/interface/Evaluator.js
//
// Provides an editor to let the user execute random code with access to the SynerJ object and
// thus the environment.
//
// Uses the ACE library for syntax highlighting etc.
//
// Author: Tim Coppieters
// Date: September 2011

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
      insertButton(this, SynerJ);

      this.editor = ace.edit('EvaluatorArea');
      var JavaScriptMode = require('libs/ace/lib/ace/mode/javascript').Mode;
      this.editor.getSession().setMode(new JavaScriptMode());
      
      this.jqContainer.hide();
      this.setupListener();
      this.newInstruction();
    }
    
    // show
    Evaluator.prototype.show = function () {
      var evaluator = this;
      var d = $('#Evaluator');
      d.dialog();
      d.dialog({
        title: 'Evaluator',
        width: 500,
        height: 600,
        resizeStop: function (event, ui) {
          var width = d.dialog('option', 'width');
          var height = d.dialog('option', 'height');

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

    // log
    Evaluator.prototype.log = function (msg) {
      var curr = this.output.html();
      var first = curr.slice(curr.length - 4) == "&gt;";
      this.output.html(curr + (first ? (" " + msg) : ('<br \\>' + msg)));
    };
     
    // setOutput
    Evaluator.prototype.setOutput = function (msg) {
      this.output.html(msg);
    };

    Evaluator.prototype.newInstruction = function () {
      var curr = this.output.html();
      if (curr == "")
        this.output.html(">");
      else
        this.output.html(curr + '<br \\>' + ">");
    };
    
    // evaluates the selected code (dead code)
    function evaluateSelected() {
      var text = $('#EvaluatorArea').val(); 
      if (text === '')
        text = $('#EvaluatorArea').html();
      $.globalEval(text);
    }
    
    // get the selected text (dead code)
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
    function insertButton(evaluator, SynerJ) {
      var button = $('<button> Evaluate </button>');
      evaluator.jqContainer.append(button);
      button.bind('click', function evaluate(e) {
        var text = evaluator.editor.getSession().getValue();
        SynerJ.exec(text, function (res) {
          evaluator.log(res);
          evaluator.newInstruction();
        });
      });
    }
  return Evaluator;
  })();

  return Evaluator;
});
