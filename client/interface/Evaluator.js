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
        'ace/ace',
        'SynerJ',
        'ace/mode/javascript',
        'order!hotkeys',
        'order!jqueryui/dialog',
        'sox'], function($, ace, SynerJ, aceJS) {
  
  var Evaluator = (function () {
    
    // constructor
    function Evaluator() {
      this.jqContainer = $("<div id=Evaluator></div>");
      insertInfo(this);
      this.textarea = $('<div id=EvaluatorArea>');
      this.output = $('<div id=EvaluatorOutput>');
      this.jqContainer.append(this.textarea);
      this.jqContainer.append(this.output);
      $('#SynerJ').append(this.jqContainer);
      
      insertButton(this, SynerJ);

      this.editor = ace.edit('EvaluatorArea');
      this.editor.session.setMode("ace/mode/javascript");
      
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
        width: 800,
        height: 600,
        resizeStop: function (event, ui) {
          var width = d.dialog('option', 'width');
          var height = d.dialog('option', 'height');

          evaluator.textarea.css('width', width - 25);
          evaluator.textarea.css('height', height - 180);
          evaluator.editor.resize();

          evaluator.output.css('width', width - 30);
          evaluator.output.css('margin-top', height - 165);
        }
      });
    };

    // sets up a listener for ctrl+e to evaluate the code
    Evaluator.prototype.setupListener = function () {
      var evaluator = this;
      $(function () {
        $('#EvaluatorArea').bind('keydown', 'ctrl+e', function () {
          evaluator.evalText();
        });
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
    
    // evaluates the selected code
    Evaluator.prototype.evalText = function evalSelected() {
      var evaluator = this;
      var text = this.getSelectedText();
      console.log(text);
      text = text || evaluator.editor.getSession().getValue();
      console.log(text);
      SynerJ.exec(text, function (res) {
        evaluator.log(res);
        evaluator.newInstruction();
      });
    };
    
    // get the selected text
    Evaluator.prototype.getSelectedText = function getSelectedText() {
      return this.editor.getCopyText();
    };

    // insertInfo
    function insertInfo(evaluator) {
      var info = $('<p> You can evaluate the selected (or all if none is selected) code by pressing ctrl+e </p>');
      evaluator.jqContainer.append(info);
    }

    // insertButton
    function insertButton(evaluator, SynerJ) {
      var button = $('<button> Evaluate </button>');
      evaluator.jqContainer.append(button);
      button.bind('click', function evaluate(e) {
        evaluator.evalText();
      });
    }
  return Evaluator;
  })();

  return Evaluator;
});
