(function() {
  var Command, InstallController, fs, path, spawn,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Command = require('tualo-commander').Command;

  path = require('path');

  fs = require('fs');

  spawn = require('child_process').spawn;

  module.exports = InstallController = (function(superClass) {
    extend(InstallController, superClass);

    function InstallController() {
      return InstallController.__super__.constructor.apply(this, arguments);
    }

    InstallController.commandName = 'installcontroller';

    InstallController.commandArgs = ['port', 'machine_ip', 'machine_port', 'hostsystem', 'hostdb', 'dbuser', 'dbpass', 'jobfile'];

    InstallController.commandShortDescription = 'install the systemd service';

    InstallController.options = [];

    InstallController.help = function() {
      return "";
    };

    InstallController.prototype.resetTimeoutTimer = function() {
      this.stopTimeoutTimer();
      return this.timeout_timer = setTimeout(this.close.bind(this), this.timeout);
    };

    InstallController.prototype.stopTimeoutTimer = function() {
      if (this.timeout_timer) {
        clearTimeout(this.timeout_timer);
      }
      return this.timeout_timer = setTimeout(this.close.bind(this), this.timeout);
    };

    InstallController.prototype.action = function(options, args) {
      var servicefiledata;
      if (args.machine_ip) {
        servicefiledata = "[Unit]\nDescription=FP Machine Controll Service\nAfter=network.target\n[Service]\nRestart=always\nExecStart={cmd}\nUser=root\nStandardOutput=syslog\nStandardError=syslog\nSyslogIdentifier=bbs\nEnvironment=NODE_ENV=production\n\n[Install]\nWantedBy=multi-user.target";
        servicefiledata = servicefiledata.replace('{cmd}', path.resolve(__dirname, '..', '..', 'bin', 'bbs-server') + ' ' + args.port + ' ' + args.machine_ip + ' ' + args.machine_port + ' ' + args.hostsystem + ' ' + args.hostdb + ' ' + args.dbuser + ' ' + args.dbpass + ' ' + args.jobfile);
        console.log(servicefiledata);
        fs.writeFileSync('/etc/systemd/system/bbs.service', servicefiledata);
        console.log('Now run:');
        console.log('systemctl daemon-reload');
        return console.log('systemctl enable bbs');
      }
    };

    return InstallController;

  })(Command);

}).call(this);
