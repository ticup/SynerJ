define([], function () {

  var touchTimer;
  
  document.body.addEventListener('touchstart', function (e) {
    touchTimer = Date.now();
  });

  document.body.addEventListener('touchend', function (e) {
    var time = Date.now();
    if (time - touchTimer < 500) {
      var touch = e.touches[0];
      var me = document.createEvent("MouseEvents");
      me.initMouseEvent('dblclick', true, true, true, window,
        1,
        touch.screenX, touch.screenY, touch.clientX, touch.clientY,
        false, false, false, false,
        0,
        null
      );
      touch.target.dispatchEvent(me);
    } 
  });

});
