define([], function () {
  var isIpad = navigator.userAgent.match(/iPad/i) != null;
  var ua = navigator.userAgent;
  var isIpadt = /iPad/i.test(ua) || /iPhone OS 3_1_2/i.test(ua) || /iPhone OS 3_2_2/i.test(ua);
  
  return {
   isIpad: isIpad
  };
});
