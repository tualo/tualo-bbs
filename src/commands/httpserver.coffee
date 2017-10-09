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
class HttpServer extends Command
  @commandName: 'httpserver'
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


  startBBS: () ->
    me = @
    me.jobCount=0
    me.customerNumber = '|'
    me.start_without_printing = false
    me.job_id = 0
    me.addressfield = 'L'
    me.pool = @connection
    args = @args

    me.imprint=null
    if args.machine_ip!='0'
      me.imprint = new bbs.Imprint args.machine_ip
      me.imprint.on 'imprint', me.onImprint.bind(me)
      me.imprint.open()
    else
      console.log 'does not use a machine'

    @openExpressServer()

  onImprint: (imprint) ->
    @lastimprint=imprint
    message=imprint
    @jobCount+=1
    me = @
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
      me.lastSQLError=null
      if err
        console.log 'ERROR on MYSQL Connection'
        console.trace err
        me.lastSQLError = err.message
        errorFN = (errMessage) =>
          console.log 'stopJob','errorFN',errMessage
        closeFN = (message) =>
          me.currentJob ''
          console.log 'stopJob','closeFN', 'on MYSQL Connection'
        doneFN = (message) =>
          me.currentJob ''
          console.log 'stopJob','doneFN', 'on MYSQL Connection'
        me.controller 'getStopPrintjob',closeFN,doneFN,errorFN
      else
        console.log 'write db'
        connection.query sql, (err, rows, fields) ->
          me.lastSQLError=null
          console.log 'write db returned'
          if err
            me.lastSQLError = err.message
            console.trace err
            if err.code!='ER_DUP_KEY'
              errorFN = (errMessage) =>
                console.log 'stopJob','errorFN',errMessage
              closeFN = (message) =>
                me.currentJob ''
                console.log 'stopJob','closeFN', 'db write error'
              doneFN = (message) =>
                me.currentJob ''
                console.log 'stopJob','doneFN', 'db write error'
              me.controller 'getStopPrintjob',closeFN,doneFN,errorFN
          connection.release()

    me.pool.getConnection fn
    console.log 'imprint--------------',imprint

  openExpressServer: () ->
    @getStatusTimed()
    express = require('express')
    bodyParser = require('body-parser')
    app = express()

    app.use bodyParser.json()
    app.use bodyParser.urlencoded {extended: true}
    # respond with "hello world" when a GET request is made to the homepage
    app.get '/', (req, res) =>
      #console.log req
      result = {success: true}

      result.machine_ip = @args.machine_ip
      result.machine_port = @args.machine_port
      result.lastimprint = @lastimprint
      result.jobCount = @jobCount
      result.lastError = @lastError
      result.lastState = @lastState
      result.lastSQLError=@lastSQLError
      result.lastStartJobMessage = @lastStartJobMessage

      res.send(JSON.stringify(result))

    app.get '/status', @expressStatus.bind(@)
    app.all '/startjob', @expressStartJob.bind(@)
    app.get '/stopjob', @expressStopJob.bind(@)
    app.listen @args.port

  expressStatus: (req, res) ->
    me = @
    errorFN = (errMessage) =>
      console.log 'expressStatus','errorFN',errMessage
      me.lastError = errMessage
      res.send(JSON.stringify({success: false,msg: errMessage.code}))
    closeFN = (message) ->
      console.log 'expressStatus','closeFN'
      #res.send(JSON.stringify(message))
    doneFN = (message) ->
      me.lastError=null
      console.log 'expressStatus','doneFN'
      res.send(JSON.stringify({success: true,msg: message}))
    @controller 'getStatusLight',closeFN,doneFN,errorFN

  expressStopJob: (req, res) ->
    me = @
    message = {}
    errorFN = (errMessage) =>
      console.log 'stopJob','errorFN',errMessage
      me.lastError = errMessage
      res.send(JSON.stringify({success: false,msg: errMessage.code}))
      me.getStatus()
    closeFN = (message) =>
      console.log 'stopJob','closeFN'
    doneFN = (message) =>
      @currentJob ''
      @setCustomerFile ''
      me.lastError=null
      console.log 'stopJob','doneFN'
      res.send(JSON.stringify({success: true,msg: message}))
      me.getStatus()
    @controller 'getStopPrintjob',closeFN,doneFN,errorFN

  expressStartJob: (req, res) ->
    me = @
    try
      bodymessage = {}
      try
        bodymessage = JSON.parse(req.body.message)
        console.log '########################'
        console.log '########################'
        console.log bodymessage
        console.log '########################'
        console.log '########################'
      catch e
        console.log e

      message = {
        job_id: 1,
        weight_mode: 3,
        customerNumber: '69000|0',
        kundennummer: '69000',
        kostenstelle: 0,
        waregroup: 'Standardsendungen',
        label_offset: 0,
        date_offset: 0,
        stamp: 1,
        addressfield: 'L',
        print_date: 1,
        print_endorsement: 1,
        endorsement1: 'endors',
        endorsement2: 'endors',
        advert: '02042a3d422a7b9884329e0df9000000006a0000000000000000000000b93c00000000000000002102220100000000000000000000000000002c00000039004d00ffffffffffffffff0b0057657262756e672d3034001200f3fb07f3f12a03f6f3fbfff3fbfff3fb16f502072a3d422a7b9884c6a899bb00000000120000000000000000000000'
      }

      for k,v of message
        if bodymessage.hasOwnProperty(k)
          message[k]=bodymessage[k]
      #message.advert="AgQqPUIqe5iEMp4N+QAAAABqAAAAAAAAAAAAAAC5PAAAAAAAAAAAIQIiAQAAAAAAAAAAAAAAAAAALAAAADkATQD//////////wsAV2VyYnVuZy0wNAASAPP7B/PxKgP28/v/8/v/8/sW9QIHKj1CKnuYhMaombsAAAAAEgAAAAAAAAAAAAAA"
      me.lastStartJobMessage = message
      errorFN = (errMessage) =>
        console.log 'startJob','errorFN',errMessage
        me.lastError = errMessage
        res.send(JSON.stringify({success: false,msg: errMessage.code}))
        me.getStatus()

      closeFN = (doneMessage) =>
        me.currentJob message.job_id
        console.log 'startJob','closeFN'

      doneFN = (doneMessage) =>
        console.log 'startJob','doneFN'
        me.jobCount = 0
        me.lastError=null
        me.currentJob message.job_id
        me.setCustomerFile message.customerNumber
        res.send(JSON.stringify({success: true,msg: message}))
        me.getStatus()

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
        #adv = ''
        #adv = '02042a3d422a7b9884329e0df9000000006a0000000000000000000000b93c00000000000000002102220100000000000000000000000000002c00000039004d00ffffffffffffffff0b0057657262756e672d3034001200f3fb07f3f12a03f6f3fbfff3fbfff3fb16f502072a3d422a7b9884c6a899bb00000000120000000000000000000000'
        #if message.advert
        #  if message.advert.length>30
        #    adv = message.advert
        seq.setEndorsementText1(endorsement1)
        seq.setEndorsementText2(endorsement2)
        #if adv.length>30
        #  seq.setAdvertHex adv

        seq.setImprintChannelPort(me.imprint.getPort())
        seq.setImprintChannelIP(me.imprint.getIP())

      @controller 'getStartPrintjob',closeFN,doneFN,errorFN, runSeq
    catch e
      res.send(JSON.stringify({success: false,msg: e.message}))



  currentJob: (job) ->
    console.log('set job: ',job)
    fs.writeFile @jobfile, job, (err) ->
      if err
        throw err



  setCustomerFile: (kn) ->
    fs.exists '/opt/grab/customer.txt',(exists)->
      if exists
        fs.writeFile '/opt/grab/customer.txt', 'kn', (err) ->
          if err
            console.log err


  onDBError: (err) ->
    console.log '####################'
    console.log 'onDBError'
    console.trace err
    setTimeout process.exit, 5000


  ##########################################


  controller: (sequenceFN,onClosed,onDone,onError,runseq) ->
    me = @
    args = @args
    if me.queryIsRunning
      deferFN = () ->
        me.controller.apply(me,[sequenceFN,onClosed,onDone,onError,runseq])
      setTimeout deferFN,1500
    else
      me.queryIsRunning = true
      ctrl = new bbs.Controller()
      ctrl.setIP(args.machine_ip,args.machine_port)
      ctrl.on 'error',(msg) ->
        me.queryIsRunning = false
        if typeof onError=='function'
          onError msg
      ctrl.on 'closed',(msg) ->
        console.log 'controller',sequenceFN,'ctrl close'
        onClosed msg
      ctrl.on 'ready', () ->
        me.queryIsRunning = false
        seq = ctrl[sequenceFN]()
        if typeof runseq=='function'
          runseq seq
        seq.on 'end',(endMsg) ->
          if typeof onDone=='function'
            onDone endMsg
          ctrl.close()
        seq.run()
      ctrl.open()

  getStatus: () ->
    if @timer
      clearTimeout @timer
    @getStatusTimed()

  getStatusTimed: () ->
    me = @
    errorFN = (errMessage) =>
      console.log 'getStatus (timed)','onError', 'next ping in 30s',errMessage
      me.lastError = errMessage
      me.timer = setTimeout me.getStatusTimed.bind(me), 30000
    closeFN = (message) =>
      console.log 'getStatus (timed)','closeFN'
    doneFN = (message) =>
      console.log 'getStatus (timed)','doneFN', 'next ping in 5s'
      me.lastError=null
      me.lastState = message
      me.timer = setTimeout me.getStatusTimed.bind(me), 5000
    @controller 'getStatusLight',closeFN,doneFN,errorFN,null
