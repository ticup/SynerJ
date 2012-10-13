define([], function () {
  //
  // CSSOM helpers
  //
  
  // renameRule
  function renameRule(document, oname, nname) {
    var newName = nname.toLowerCase();
    var oldName = oname.toLowerCase();
    var sheet = document.styleSheets[1];
    var rules = sheet.cssRules;
		for (var i = 0; i<rules.length; i++) {
      if (rules[i].selectorText.toLowerCase() == oldName) {
        var style = rules[i].style;
        var rule = nname;
        if (style.cssText)
          rule += " { " + style.cssText + " } ";
        else
          rule += " { } ";
        sheet.deleteRule ? sheet.deleteRule(i) : sheet.removeRule(i);
        sheet.insertRule ? sheet.insertRule(rule, rules.length) : sheet.addRule(rule, rules.length);
      }
    }
  }
    
  // serializeSelector: certain browsers only accept score-separated
  // selectors, others camelCase.
  function serializeSelector(selector, window) {
    /* server-side code */
    if (!window.navigator)
      return selector;
    /* firefox */
    if (navigator.userAgent.match(/mozilla/gi)) {
      var els = selector.split('-');
      for (var i=1; i<els.length; i++) {
        var str = els[i];
        els[i] = str.charAt(0).toUpperCase() + str.slice(1);
      }
      return els.join('');
    }
    /* others */
    return selector;
  }

	// getStyle: Gets the style object with given name
  function getStyle(name, document) {
		// convention is that the id's sheet is at 1
		var sheet = document.styleSheets[1];
		var rules = sheet.cssRules;
		var rule = name + "{}";
    var style = findStyle(document, name);
		// if the style already exists, just return it
		if (style)
			return style;
		// otherwise add a rule which includes the style.
    addRule(sheet, rule);
    return findStyle(document, name);
	}

  // findStyle
  function findStyle(document, name) {
    var rule = findRule(document, name);
    if (rule)
      return rule.style;
    return undefined;
  }

  // findRule
  function findRule(document, name) {
    // some browsers don't support upperCase in selectorTexts.
    var sheet = document.styleSheets[1];
    var rules = sheet.cssRules;
    var lowrName = name.toLowerCase();
    for (var i = 0; i<rules.length; i++) {
      if (rules[i].selectorText.toLowerCase() == lowrName)
        return rules[i];
    }
    return undefined;
  }

  // addRules
  function addRules(obj, document) {
    var id = obj._id();
    var sheet = document.styleSheets[1];
    var style = findStyle(document, "#" + id);
    var rule = "#" + id +"{}";
    if (!style) {
      addRule(sheet, rule);
    }
    style = findStyle(document, "." + id);
    rule = "." + id +"{}";
    if (!style) {
      addRule(sheet, rule);
    }
  }

  // addRule
  function addRule(sheet, rule) {
    var rules = sheet.cssRules;
    if (sheet.insertRule)
      sheet.insertRule(rule, rules.length);
    else if (sheet.addRule)
      sheet.addRule(rule, rules.length);
    else
      throw new Error("Browser doesn't support adding rules");
  }

  return {
    getStyle:           getStyle,
    renameRule:         renameRule,
    serializeSelector:  serializeSelector,
    addRules:           addRules
  };
});