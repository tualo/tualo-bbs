{EventEmitter} = require 'events'

bbs = require('../main')
path = require 'path'
fs = require 'fs'

module.exports =
class WebSocketConnection extends EventEmitter

  constructor: (ws,jobfile,machine_ip) ->
    @ws = ws
    @jobfile = jobfile

    @imprint = new bbs.Imprint machine_ip
    @imprint.open()
    @imprint.on 'imprint', @onImprint.bind(@)

    @ws.on 'close', (message) =>
      if @imprint
        @imprint.close()
    @ws.on 'message', @onWebSocketClientIncomingMessage.bind(@)

  onImprint: (message) ->
    me = @
    ws = @ws
    ws.send me.getWSMessage('imprint',message)

  getWSMessage: (evt,data) ->
    JSON.stringify({event: evt,data: data})

  onWebSocketClientIncomingMessage: (message) ->
    o = JSON.parse(message)
    if (o.event)
      @processIncomingMessage o.event, o.data

  processIncomingMessage: (event,message) ->
    me = @
    if typeof me['process_'+event]=='function'
      me['process_'+event](message)

  process_start: (message) ->
    me = @
    ws = @ws
    if me.imprint is null
      return
    _start = () ->
      console.log 'start message', message
      ws.send me.getWSMessage('start',message)
      me.startJob message

    fnDone = () ->
      #console.log
    doneFN = (doneMessage) =>
      me.currentJob ''
      if message.print_job_active==1
        fnStopJob = (dMessage) =>
          process.nextTick _start
        me.controller 'getStopPrintjob',message,fnStopJob, fnDone
      else
        process.nextTick _start
    me.controller 'getStatusLight',message,doneFN, fnDone

  process_stop: (message) ->
    me = @
    ws = @ws
    closeFN = () ->
      #console.log
    doneFN = (doneMessage) =>
      me.currentJob ''
      ws.send me.getWSMessage('stop',message)
    me.controller 'getStopPrintjob',message,doneFN, closeFN

  process_poi: (message) ->
    console.log('TODO')

  process_status: (message) ->
    me = @
    ws = @ws
    if me.start_without_printing == true
      message =
        available_scale: 0
        system_uid: 999
        print_job_active: 1
        print_job_id: me.job_id
        interface_of_message: 9
        type_of_message: 4340

      ws.send me.getWSMessage('status',message)
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

      ws.send me.getWSMessage('status',message)
      return
    me.getStatus message


  currentJob: (job) ->
    console.log('set job: ',job)
    fs.writeFile @jobfile, job, (err) ->
      if err
        throw err

  controller: (sequenceFN,msg,onClosed,onDone,runseq) ->
    args = @args
    ctrl = new bbs.Controller()
    console.log('controller',msg)
    ctrl.setIP msg.machine.ip,msg.machine.port
    ctrl.on 'closed',(msg) ->
      console.log 'controller',sequenceFN,'ctrl close'
      onClosed msg
    ctrl.on 'ready', () ->
      seq = ctrl[sequenceFN]()
      if typeof runseq=='function'
        runseq seq
      seq.on 'end',(endMsg) ->
        console.log 'controller',sequenceFN,'sequence end'
        if typeof onDone=='function'
          onDone endMsg
        ctrl.close()
      seq.run()
    ctrl.open()

  stopJob: (msg) ->
    me = @
    ws = @ws
    closeFN = (message) =>
      me.currentJob ''
      console.log 'stopJob','closeFN'
      ws.send me.getWSMessage('stop',doneMessage)
      #socket.emit('closed',message)
      #ws.send(me.getWSMessage('close',message))

    doneFN = (message) =>
      me.currentJob ''
      console.log 'stopJob','doneFN'
      ws.send(me.getWSMessage('stop',message))

    @controller 'getStopPrintjob',msg,closeFN,doneFN

  startJob: (message) ->
    me = @
    ws = @ws
    closeFN = (doneMessage) =>
      me.currentJob message.job_id
      console.log 'startJob','closeFN'
      ws.send me.getWSMessage('start',doneMessage)
      #socket.emit 'closed',doneMessage

    doneFN = (doneMessage) =>
      console.log 'startJob','doneFN'
      me.currentJob message.job_id
      ws.send me.getWSMessage('start',doneMessage)

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

    console.log("@controller 'getStartPrintjob'",message)
    @controller 'getStartPrintjob',message,closeFN,doneFN, runSeq


  getStatus: (msg) ->
    me = @
    ws = @ws
    closeFN = (message) =>
      #@currentJob ''
      console.log 'getStatus','closeFN'
      #ws.send(me.getWSMessage('close',message))
    doneFN = (message) =>
      #@currentJob ''
      console.log 'getStatus','doneFN'
      ws.send(me.getWSMessage('status',message))
    @controller 'getStatusLight',msg,closeFN,doneFN
