{EventEmitter} = require 'events'


Net = require 'net'
StatusLight = require '../Sequence/StatusLight'
Status = require '../Sequence/Status'
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
    #console.log @

  setPort: (val) ->
    @port = val

  setIP: (val,port) ->
    @ip = val
    if port
      @port = port

  resetPingTimer: () ->
    null
    #@stopPingTimer()
    #@ping_timer = setTimeout @ping.bind(@), @ping_timeout
  stopPingTimer: () ->
    null
    #if @ping_timer
    #  clearTimeout @ping_timer
    #@ping_timer = setTimeout @ping.bind(@), @ping_timeout

  ping: () ->
    null
    #if @client?
    #  @getStatusLight()

  resetTimeoutTimer: () ->
    null
    #@resetPingTimer()
    #@stopTimeoutTimer()
    #@timeout_timer = setTimeout @close.bind(@), @timeout

  stopTimeoutTimer: () ->
    null
    #if @timeout_timer
    #  clearTimeout @timeout_timer
    #@timeout_timer = setTimeout @close.bind(@), @timeout

  open: () ->
    me = @
    if @client==null
      console.log 'PORT',@port
      @client = Net.createConnection @port, @ip, () => @onConnect()
      @closeEventName = 'unexpected_closed'
      @client.setTimeout 2000
      @client.on 'timeout', (err) ->
        console.log 'controller socket timeout'
        me.emit 'error', {msg:'socket timeout',code:'socket timeout'}
        me.onEnd()
      @client.on 'error', (err) ->
        console.trace err
        me.emit 'error', err
        me.onEnd()
      @client.on 'close', () ->
        #console.log 'controller close',me.closeEventName
        me.emit 'closed',me.closeEventName
      @client.on 'end', () ->
        console.log 'controller end'
        me.emit 'ended'
      console.log '-----'

  onConnect: () ->
    console.log 'onConnect'
    #@resetTimeoutTimer()
    @client.setNoDelay true
    @client.on 'close', () => @onClose()
    @client.on 'end', () => @onEnd()

    @emit 'ready'

  getStatusLight: () ->
    @seq = new StatusLight @client
    @seq.on 'close', (message) => @onStatusLight(message)
    @seq
  onStatusLight: (message) ->
    #@resetTimeoutTimer()
    @seq.removeAllListeners()
    @emit 'statusLight', message

  getStatus: () ->
    seq = new Status @client
    seq.on 'close', (message) => @onStatus(message)
    seq
  onStatus: (message) ->
    #@resetTimeoutTimer()
    @emit 'status', message

  getStartPrintjob: () ->
    seq = new StartPrintjob @client
    seq.on 'close', (message) => @onStartPrintjob(message)
    seq
  onStartPrintjob: (message) ->
    #@resetTimeoutTimer()
    @emit 'startPrintJob', message

  getStopPrintjob: () ->
    seq = new StopPrintjob @client
    seq.on 'close', (message) => @onStopPrintjob(message)
    seq
  onStopPrintjob: (message) ->
    #@resetTimeoutTimer()
    @emit 'stopPrintJob', message

  onEnd: () ->
    #@emit "end"
    console.log 'onEnd'
    if typeof @client!='undefined' and @client != null
      @lasteventname = @client.closeEventName
      @client.destroy()
      @client=null

  onClose: () ->
    #@stopTimeoutTimer()
    @emit "closed",@lasteventname
    @client=null


  close: () ->
    if typeof @client!='undefined' and @client != null
      @client.end()
