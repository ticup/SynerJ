define(['order!jquery',
        'order!jqueryui/dialog',
        'order!jqueryui/sortable',
				'order!jqueryui/effects/highlight',
        'order!eventdrag',
	 			'order!/public/libs/SlickGrid/slick.core.js',
        'order!/public/libs/SlickGrid/plugins/slick.cellselectionmodel.js',
				'order!/public/libs/SlickGrid/plugins/slick.cellrangeselector.js',
				'order!/public/libs/SlickGrid/plugins/slick.cellrangedecorator.js',
				'order!/public/libs/SlickGrid/slick.grid.js',
				'order!/public/libs/SlickGrid/slick.editors.js',
				'order!public/libs/SlickGrid/slick.dataview.js'],
  function ($) {
		//require('libs/SlickGrid/slick.core');
    //require('libs/SlickGrid/plugins/slick.cellselectionmodel');
    //require('libs/SlickGrid/plugins/slick.cellrangeselector');
    //require('libs/SlickGrid/plugins/slick.cellrangedecorator');
    //require('libs/SlickGrid/slick.grid');
    //require('libs/SlickGrid/slick.editors');
    //require('libs/SlickGrid/slick.editors');
    // load css
		var link = $("<link rel='stylesheet' type='text/css'>");
		var link1 = $("<link rel='stylesheet' type='text/css'>");
		var link2 = $("<link rel='stylesheet' type='text/css'>");
		var link3 = $("<link rel='stylesheet' type='text/css'>");
		//link.attr('href', 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/base/jquery-ui.css'); 
		link.attr('href', 'public/libs/jquery-ui-require/themes/base/jquery-ui.css'); 
		link1.attr('href', 'public/libs/SlickGrid/css/slick.grid.css');
		link2.attr('href', 'public/libs/SlickGrid/css/slick-default-theme.css');
		link3.attr('href', 'public/libs/SlickGrid/css/slick-examples.css');
		$('head').append(link3);
		$('head').append(link2);
		$('head').append(link1);
		$('head').append(link);
		return $;
});
	
		 
