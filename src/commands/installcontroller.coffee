{Command} = require 'tualo-commander'
path = require 'path'
fs = require 'fs'
spawn = require('child_process').spawn

module.exports =
class InstallController extends Command
  @commandName: 'installcontroller'
  @commandArgs: ['port','machine_ip','machine_port','hostsystem','hostdb','dbuser','dbpass','jobfile']
  @commandShortDescription: 'install the systemd service'
  @options: [ ]

  @help: () ->
    """

    """
  resetTimeoutTimer: () ->
    @stopTimeoutTimer()
    @timeout_timer = setTimeout @close.bind(@), @timeout

  stopTimeoutTimer: () ->
    if @timeout_timer
      clearTimeout @timeout_timer
    @timeout_timer = setTimeout @close.bind(@), @timeout

  action: (options,args) ->
    if args.machine_ip
      servicefiledata="""
      [Unit]
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
      WantedBy=multi-user.target
      """
      servicefiledata = servicefiledata.replace '{cmd}', path.resolve(__dirname,'..','..','bin','bbs-httpserver') + ' '+args.port + ' '+args.machine_ip + ' '+args.machine_port + ' '+args.hostsystem+ ' '+args.hostdb+ ' '+args.dbuser+ ' '+args.dbpass+ ' '+args.jobfile

      console.log servicefiledata
      fs.writeFileSync '/etc/systemd/system/bbs.service', servicefiledata

      console.log 'Now run:'
      console.log 'systemctl daemon-reload'
      console.log 'systemctl enable bbs'

      #ls = spawn('systemctl', ['daemon-reload'])
      #ls = spawn('systemctl', ['enable','bbs'])
