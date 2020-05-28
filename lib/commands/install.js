(function() {
  var Command, Install, fs, path, spawn;

  ({Command} = require('tualo-commander'));

  path = require('path');

  fs = require('fs');

  spawn = require('child_process').spawn;

  module.exports = Install = (function() {
    class Install extends Command {
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
          servicefiledata = servicefiledata.replace('{cmd}', path.resolve(__dirname, '..', '..', 'bin', 'bbs-server') + ' 30001 ' + args.machine_ip + ' ' + args.hostsystem + ' ' + args.hostdb);
          console.log(servicefiledata);
          fs.writeFileSync('/etc/systemd/system/bbs.service', servicefiledata);
          console.log('Now run:');
          console.log('systemctl daemon-reload');
          return console.log('systemctl enable bbs');
        }
      }

    };

    Install.commandName = 'install';

    Install.commandArgs = ['machine_ip', 'hostsystem', 'hostdb'];

    Install.commandShortDescription = 'install the systemd service';

    Install.options = [];

    return Install;

  }).call(this);

  //ls = spawn('systemctl', ['daemon-reload'])
//ls = spawn('systemctl', ['enable','bbs'])

}).call(this);
