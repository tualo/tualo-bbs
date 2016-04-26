(function() {
  var Command, Controller, Status, fs, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Command = require('tualo-commander').Command;

  path = require('path');

  fs = require('fs');

  Controller = require('../Service/Controller');

  module.exports = Status = (function(superClass) {
    extend(Status, superClass);

    function Status() {
      return Status.__super__.constructor.apply(this, arguments);
    }

    Status.commandName = 'status';

    Status.commandArgs = ['ip'];

    Status.commandShortDescription = 'query the machine status';

    Status.options = [];

    Status.help = function() {
      return "";
    };

    Status.prototype.action = function(options, args) {
      var ctrl;
      if (args.ip) {
        ctrl = new Controller;
        ctrl.setIP(args.ip);
        return ctrl.open();
      }
    };

    return Status;

  })(Command);

}).call(this);
