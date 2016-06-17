(function() {
  var Command, Install, fs, path, spawn,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Command = require('tualo-commander').Command;

  path = require('path');

  fs = require('fs');

  spawn = require('child_process').spawn;

  module.exports = Install = (function(superClass) {
    extend(Install, superClass);

    function Install() {
      return Install.__super__.constructor.apply(this, arguments);
    }

    Install.commandName = 'install';

    Install.commandArgs = ['machine_ip'];

    Install.commandShortDescription = 'install the systemd service';

    Install.options = [];

    Install.help = function() {
      return "";
    };

    Install.prototype.resetTimeoutTimer = function() {
      this.stopTimeoutTimer();
      return this.timeout_timer = setTimeout(this.close.bind(this), this.timeout);
    };

    Install.prototype.stopTimeoutTimer = function() {
      if (this.timeout_timer) {
        clearTimeout(this.timeout_timer);
      }
      return this.timeout_timer = setTimeout(this.close.bind(this), this.timeout);
    };

    Install.prototype.action = function(options, args) {
      var ls, servicefiledata;
      if (args.machine_ip) {
        servicefiledata = "[Unit]\nDescription=FP Machine Controll Service\nAfter=network.target\n[Service]\nType=forking\nRestart=always\nExecStart=/bin/sh -c \"{cmd}\"\nUser=root\n[Install]\nWantedBy=multi-user.target";
        servicefiledata = servicefiledata.replace('{cmd}', path.resolve(__dirname, '..', '..', 'bin', 'bbs-server') + ' 30001 ' + args.machine_ip);
        fs.writeFileSync('/etc/systemd/system/bbs.service', servicefiledata);
        ls = spawn('systemctl', ['daemon-reload']);
        return ls = spawn('systemctl', ['enable', 'bbs']);
      }
    };

    return Install;

  })(Command);

}).call(this);
