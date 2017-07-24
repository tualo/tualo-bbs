{Command} = require 'tualo-commander'
path = require 'path'
fs = require 'fs'

app = require('express')()
WebSocket = require('ws')
http = require('http').Server(app)
io = require('socket.io')(http)
bbs = require('../main')
mysql = require 'mysql'
sss = require 'simple-stats-server'
stats = sss()

module.exports =
class Server extends Command
  @commandName: 'server'
  @commandArgs: ['port','machine_ip','machine_port','hostsystem','hostdb','dbuser','dbpass','jobfile']
  @commandShortDescription: 'running the bbs machine controll service'
  @options: []

  @help: () ->
    """

    """

  action: (options,args) ->
    if args.port
      @args = args
      #imprint = new bbs.Imprint()
      me = @
      me.waregroup = 'Standardsendungen'

      me.jobfile = args.jobfile||'/opt/grab/job.txt'
      console.log @args
      opts =
        host     : @args.hostsystem
        user     : @args.dbuser
        password : @args.dbpass
        database :  @args.hostdb
        connectionLimit: 100
        wait_timeout: 120
        connect_timeout: 10

      # flush table bbs_data

      @connection = mysql.createPool opts
      @connection.on 'error', (err) => @onDBError
      @startMySQL()



  startMySQL: () ->
    @startBBS()

  onDBError: (err) ->
    console.log '####################'
    console.log 'onDBError'
    console.trace err
    setTimeout process.exit, 5000

  currentJob: (job) ->
    console.log('set job: ',job)
    fs.writeFile @jobfile, job, (err) ->
      if err
        throw err

  controller: (sequenceFN,onClosed,onDone,runseq) ->
    args = @args
    ctrl = new bbs.Controller()
    ctrl.setIP(args.machine_ip,args.machine_port)
    ctrl.on 'closed',(msg) ->
      console.log 'controller',sequenceFN,'ctrl close'
      onClosed msg

    ctrl.on 'ready', () ->
      console.log 'controller',sequenceFN,'ready'
      seq = ctrl[sequenceFN]()
      if typeof runseq=='function'
        runseq seq

      seq.on 'end',(endMsg) ->
        console.log 'controller',sequenceFN,'sequence end'
#        ctrl.client.closeEventName='expected'
        if typeof onDone=='function'
          onDone endMsg
        ctrl.close()
      seq.run()
    ctrl.open()

  stopJob: (socket) ->

    closeFN = (message) =>
      @currentJob ''
      console.log 'stopJob','closeFN'
      socket.emit('closed',message)

    doneFN = (message) =>
      @currentJob ''
      console.log 'stopJob','doneFN'
      socket.emit('stop',message)

    @controller 'getStopPrintjob',closeFN,doneFN

  startJob: (socket,message) ->
    me = @
    closeFN = (doneMessage) =>
      me.currentJob message.job_id
      console.log 'startJob','closeFN'
      socket.emit 'closed',doneMessage

    doneFN = (doneMessage) =>
      console.log 'startJob','doneFN'
      me.currentJob message.job_id
      socket.emit 'start',doneMessage

    runSeq = (seq) ->
      seq.init()
      me.job_id = message.job_id
      if typeof message.addressfield=='string'
        me.addressfield = message.addressfield
      seq.setJobId(message.job_id)
      seq.setWeightMode(message.weight_mode)
      me.customerNumber = message.customerNumber
      seq.setCustomerNumber(message.customerNumber)
      if message.waregroup?
        me.waregroup = message.waregroup
      seq.setPrintOffset(message.label_offset)
      seq.setDateAhead(message.date_offset)
      seq.setPrintDate(message.print_date)
      seq.setPrintEndorsement(message.print_endorsement)
      endorsement1 = ''
      if message.endorsement1
        endorsement1 = message.endorsement1
      endorsement2 = ''
      if message.endorsement2
        endorsement2 = message.endorsement2
      adv = ''
      #adv = '02042a3d422a7b9884329e0df9000000006a0000000000000000000000b93c00000000000000002102220100000000000000000000000000002c00000039004d00ffffffffffffffff0b0057657262756e672d3034001200f3fb07f3f12a03f6f3fbfff3fbfff3fb16f502072a3d422a7b9884c6a899bb00000000120000000000000000000000'
      if message.advert
        if message.advert.length>30
          adv = message.advert
      seq.setEndorsementText1(endorsement1)
      seq.setEndorsementText2(endorsement2)
      if adv.length>30
        seq.setAdvertHex adv

      seq.setImprintChannelPort(me.imprint.getPort())
      seq.setImprintChannelIP(me.imprint.getIP())

    @controller 'getStartPrintjob',closeFN,doneFN, runSeq


  getStatus: (socket) ->
    closeFN = (message) =>
      #@currentJob ''
      console.log 'getStatus','closeFN'
      socket.emit('close',message)
    doneFN = (message) =>
      #@currentJob ''
      console.log 'getStatus','doneFN',message
      socket.emit('status',message)
    @controller 'getStatusLight',closeFN,doneFN

  startBBS: () ->
    me = @
    me.customerNumber = '|'
    me.start_without_printing = false
    me.job_id = 0
    me.addressfield = 'L'
    pool = @connection
    args = @args

    me.imprint=null
    if args.machine_ip!='0'
      me.imprint = new bbs.Imprint args.machine_ip
      me.imprint.open()
    else
      console.log 'does not use a machine'


    io.on 'connection', (socket) ->
      socket.on 'disconnect', () ->
        if me.imprint!=null
          me.imprint.removeAllListeners()

      if me.imprint!=null
        me.imprint.on 'acting', () ->
          # ok it's time to copy files


        me.imprint.on 'imprint', (message) ->
          sql = '''
          insert into bbs_data
          (
            id,
            kundennummer,
            kostenstelle,
            height,
            length,
            thickness,
            weight,
            inserttime,
            job_id,
            machine_no,
            login,
            waregroup,
            addressfield
          ) values (
            {id},
            {kundennummer},
            {kostenstelle},
            {height},
            {length},
            {thickness},
            {weight},
            now(),
            {job_id},
            {machine_no},
            '{login}',
            '{waregroup}',
            '{addressfield}'
          )
          on duplicate key update

            kundennummer=values(kundennummer),
            kostenstelle=values(kostenstelle),
            height=values(height),
            length=values(length),
            thickness=values(thickness),
            weight=values(weight),
            inserttime=values(inserttime),
            job_id=values(job_id),
            machine_no=values(machine_no),
            login=values(login),
            waregroup=values(waregroup),
            addressfield=values(addressfield)
          '''
          cp = me.customerNumber.split '|'

          sql  = sql.replace('{id}',message.machine_no*100000000+message.imprint_no)
          sql  = sql.replace('{kundennummer}', cp[0])
          sql  = sql.replace('{kostenstelle}', cp[1])
          sql  = sql.replace('{height}',message.mail_height)
          sql  = sql.replace('{length}',message.mail_length)
          sql  = sql.replace('{thickness}',message.mail_thickness)
          sql  = sql.replace('{weight}',message.mail_weight)
          sql  = sql.replace('{job_id}',message.job_id)
          sql  = sql.replace('{machine_no}',message.machine_no)
          sql  = sql.replace('{waregroup}',me.waregroup)
          sql  = sql.replace('{addressfield}',me.addressfield)
          sql  = sql.replace('{login}','sorter')



          fn = (err, connection) ->
            if err
              console.log 'ERROR on MYSQL Connection'
              console.log err
              me.stopJob socket


            else
              console.log 'write db'
              connection.query sql, (err, rows, fields) ->
                console.log 'write db returned'
                if err
                  console.log err.code

                if err
                  console.log err
                  if err.code!='ER_DUP_KEY'
                    me.stopJob socket
                connection.release()


          pool.getConnection fn
          socket.emit 'imprint', message



      socket.on 'service', (message) ->
        if message.type=='status'
          if message.name=='grab'
            me.checkGrabService socket, message
          if message.name=='ocrsd'
            me.checkOCRService socket, message
        if message.type=='stop'
          if message.name=='ocrsd' or message.name=='grab'
            me.statusService socket, message

      socket.on 'status', () ->
        if me.start_without_printing == true
          message =
            available_scale: 0
            system_uid: 999
            print_job_active: 1
            print_job_id: me.job_id
            interface_of_message: 9
            type_of_message: 4340

          socket.emit 'status',message
          return
        if me.imprint is null
          message =
            no_machine: true
            available_scale: 0
            system_uid: 999
            print_job_active: 0
            print_job_id: me.job_id
            interface_of_message: 9
            type_of_message: 4340

          socket.emit 'status',message
          return
        me.getStatus socket



      socket.on 'stop', () ->
        if me.start_without_printing == true
          me.start_without_printing = false
          socket.emit 'stop', {}
          return
        if me.imprint is null
          socket.emit 'stop', {}
          return
        me.stopJob socket
        #ctrl.open()

      socket.on 'serverStatus', (message) ->
        stats.check 'memory', (obj) ->
          socket.emit 'serverStatus', obj

      socket.on 'start_without_printing', (message) ->
        me.start_without_printing = true
        me.customerNumber = message.customerNumber
        me.currentJob message.jobid
        if message.waregroup?
          me.waregroup = message.waregroup
        me.job_id = message.job_id
        socket.emit 'start_without_printing', {}

      socket.on 'start', (message) ->
        if me.imprint is null
          return
        _start = () ->
          console.log 'start message', message
          me.startJob socket,message


        fnDone = () ->
          #console.log
        doneFN = (doneMessage) =>
          me.currentJob ''
          if message.print_job_active==1
            fnStopJob = (dMessage) =>
              process.nextTick _start
            me.controller 'getStopPrintjob',fnStopJob, fnDone
          else
            process.nextTick _start
        me.controller 'getStatusLight',doneFN, fnDone





    console.log 'args.port',args.port
    http.listen args.port, () ->

      console.log('listening on *:'+ args.port)



  startStopService: (socket,cmd)->
    spawn = require('child_process').spawn
    proc = spawn('serice', [cmd.name, cmd.type])
    proc.on 'close', (code) ->
      val =
        service: cmd.name
      socket.emit cmd.type, val

  statusService: (socket,cmd)->
    spawn = require('child_process').spawn
    ls = spawn('service', [cmd.name, 'status'])

    ls.stdout.on 'data', (data) ->
      if data.toString().indexOf('(running)')>=0
        val =
          state: 'running'
          service: cmd.name
          type: 'status'
        socket.emit 'service', val
      if data.toString().indexOf('inactive')>=0
        val =
          state: 'inactive'
          service: cmd.name
          type: 'status'
        socket.emit 'service', val

    ls.stderr.on 'data', (data) ->
      val =
        state: 'error'
        service: cmd.name
        type: 'status'
      socket.emit 'service', val
