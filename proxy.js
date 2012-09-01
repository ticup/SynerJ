var Proxy = require('node-proxy');

function foo (x) {
  this.x = x;
}

function proxyFoo (x) {
  var obj = new foo(x);

  var proxy = Proxy.create({
      get: function (rcvr, nam) {
        console.log('going through proxy: ' + obj + '.' + nam);
          return obj[nam];
  }}, Object.getPrototypeOf(obj));

  return proxy;
}

proxyFoo.instanceOf = function (obj) {
  return obj instanceof foo;
}

var bar = new proxyFoo(2);

console.log(proxyFoo.instanceOf(bar));
console.log(bar.x);
