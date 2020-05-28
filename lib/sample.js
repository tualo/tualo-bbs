(function() {
  var Controller, ctrl;

  Controller = require('./Service/Controller');

  ctrl = new Controller();

  ctrl.setIP('192.168.192.53');

  console.log('ctrl');

  ctrl.open();

}).call(this);
