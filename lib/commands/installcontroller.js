(function() {
  var Command, InstallController, fs, path, spawn;

  ({Command} = require('tualo-commander'));

  path = require('path');

  fs = require('fs');

  spawn = require('child_process').spawn;

  module.exports = InstallController = (function() {
    class InstallController extends Command {
      static help() {
        return ``;
      }

      resetTimeoutTimer() {
        this.stopTimeoutTimer();
        return this.timeout_timer = setTimeout(this.close.bind(this), this.timeout);
      }

      stopTimeoutTimer() {
        if (this.timeout_timer) {
          clearTimeout(this.timeout_timer);
        }
        return this.timeout_timer = setTimeout(this.close.bind(this), this.timeout);
      }

      action(options, args) {
        var servicefiledata;
        if (args.machine_ip) {
          servicefiledata = `[Unit]
Description=FP Machine Controll Service
After=network.target
[Service]
Restart=always
ExecStart={cmd}
User=root
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=bbs
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target`;
          servicefiledata = servicefiledata.replace('{cmd}', path.resolve(__dirname, '..', '..', 'bin', 'bbs-httpserver') + ' ' + args.port + ' ' + args.machine_ip + ' ' + args.machine_port + ' ' + args.hostsystem + ' ' + args.hostdb + ' ' + args.dbuser + ' ' + args.dbpass + ' ' + args.jobfile);
          console.log(servicefiledata);
          fs.writeFileSync('/etc/systemd/system/bbs.service', servicefiledata);
          console.log('Now run:');
          console.log('systemctl daemon-reload');
          return console.log('systemctl enable bbs');
        }
      }

    };

    InstallController.commandName = 'installcontroller';

    InstallController.commandArgs = ['port', 'machine_ip', 'machine_port', 'hostsystem', 'hostdb', 'dbuser', 'dbpass', 'jobfile'];

    InstallController.commandShortDescription = 'install the systemd service';

    InstallController.options = [];

    return InstallController;

  }).call(this);

  //ls = spawn('systemctl', ['daemon-reload'])
//ls = spawn('systemctl', ['enable','bbs'])

}).call(this);
