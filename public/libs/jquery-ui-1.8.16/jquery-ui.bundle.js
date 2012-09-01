define(['browser',
        'order!jquery',
				'order!/scripts/libs/jquery/jquery.event.drag-2.0.min.js',
				//'order!/scripts/libs/jquery-ui/jquery-ui.require.js',
				//'order!/scripts/libs/jquery-ui/jquery-ui-require/jqueryui/datepicker.js',
				//'order!/scripts/libs/jquery-ui/jquery-ui-require/jqueryui/sortable.js',
				//'order!/scripts/libs/jquery-ui/jquery-ui-require/jqueryui/dialog.js',
        'order!http://code.jquery.com/ui/1.8.17/jquery-ui.min.js'],
  function (browser, jQuery) {
    if (browser.isIpad) {
      var script = $("<script src='/scripts/libs/jquery-ui-touch-punch/jquery.ui.touch-punch.js'>");
      var script1 = $("<script src='/scripts/libs/dblclck.js>");
      $('head').append(script)
      $('head').append(script1);
    }
    // load css
		var link = $("<link rel='stylesheet' type='text/css'>");
		var link1 = $("<link rel='stylesheet' type='text/css'>");
		var link2 = $("<link rel='stylesheet' type='text/css'>");
		var link3 = $("<link rel='stylesheet' type='text/css'>");
		link.attr('href', 'public/css/libs/jquery-ui.css'); 
		link1.attr('href', 'public/css/libs/slick.grid.css');
		link2.attr('href', 'public/css/libs/slick-default-theme.css');
		link3.attr('href', 'public/css/libs/slick-examples.css');
		$('head').append(link3);
		$('head').append(link2);
		$('head').append(link1);
		$('head').append(link);
		return $;
});
	
		 
