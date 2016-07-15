{Command} = require 'tualo-commander'
path = require 'path'
fs = require 'fs'
spawn = require('child_process').spawn

module.exports =
class Install extends Command
  @commandName: 'install'
  @commandArgs: ['machine_ip','hostsystem','hostdb']
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
      servicefiledata = servicefiledata.replace '{cmd}', path.resolve(__dirname,'..','..','bin','bbs-server') + ' 30001 '+args.machine_ip + ' '+args.hostsystem+ ' '+args.hostdb

      console.log servicefiledata
      fs.writeFileSync '/etc/systemd/system/bbs.service', servicefiledata

      console.log 'Now run:'
      console.log 'systemctl daemon-reload'
      console.log 'systemctl enable bbs'

      #ls = spawn('systemctl', ['daemon-reload'])
      #ls = spawn('systemctl', ['enable','bbs'])
