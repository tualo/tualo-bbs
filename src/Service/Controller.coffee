{EventEmitter} = require 'events'


Net = require 'net'
StatusLight = require '../Sequence/StatusLight'
StartPrintjob = require '../Sequence/StartPrintjob'
StopPrintjob = require '../Sequence/StopPrintjob'

module.exports =
class Controller extends EventEmitter
  constructor: () ->
    @timeout = 60000
    @ping_timeout = 45000
    @ip = "127.0.0.1"
    @port = 4444 # fixed
    @client = null
    @closingService = false

  setPort: (val) ->
    @port = val

  setIP: (val) ->
    @ip = val

  resetPingTimer: () ->
    @stopPingTimer()
    @ping_timer = setTimeout @ping.bind(@), @ping_timeout
  stopPingTimer: () ->
    if @ping_timer
      clearTimeout @ping_timer
    @ping_timer = setTimeout @ping.bind(@), @ping_timeout

  ping: () ->
    @getStatusLight()

  resetTimeoutTimer: () ->
    @resetPingTimer()
    @stopTimeoutTimer()
    @timeout_timer = setTimeout @close.bind(@), @timeout

  stopTimeoutTimer: () ->
    if @timeout_timer
      clearTimeout @timeout_timer
    @timeout_timer = setTimeout @close.bind(@), @timeout

  open: () ->
    me = @
    if @client==null
      @client = Net.createConnection @port, @ip, () => @onConnect()
      @client.setTimeout 20000
      @client.on 'error', (err) ->
        me.emit 'err', err
        me.close()
      @client.on 'close', () ->
        console.log 'cl'

  onConnect: () ->

    @resetTimeoutTimer()
    @client.setNoDelay true
    @client.on 'close', () => @onClose()
    @client.on 'end', () => @onEnd()

    @emit 'ready'

  getStatusLight: () ->
    seq = new StatusLight @client
    seq.on 'close', (message) => @onStatusLight(message)
    seq
  onStatusLight: (message) ->
    @resetTimeoutTimer()
    @emit 'statusLight', message

  getStartPrintjob: () ->
    seq = new StartPrintjob @client
    seq.on 'close', (message) => @onStartPrintjob(message)
    seq
  onStartPrintjob: (message) ->
    @resetTimeoutTimer()
    @emit 'startPrintJob', message

  getStopPrintjob: () ->
    seq = new StopPrintjob @client
    seq.on 'close', (message) => @onStopPrintjob(message)
    seq
  onStopPrintjob: (message) ->
    @resetTimeoutTimer()
    @emit 'stopPrintJob', message

  onEnd: () ->
    #@emit "end"
    @client=null

  onClose: () ->
    @stopTimeoutTimer()
    @emit "closed"
    @client=null


  close: () ->
    if typeof @client!='undefined' and @client != null
      @client.end()
