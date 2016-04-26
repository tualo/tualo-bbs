{EventEmitter} = require 'events'
Message = require '../FP/Message'
MessageBuffer = require '../FP/MessageBuffer'
MSG2DCACK = require '../FP/MSG2DCACK'
MSG2CUOPENSERVICE = require '../FP/MSG2CUOPENSERVICE'
MSG2CUGETSTATUSLIGHT = require '../FP/MSG2CUGETSTATUSLIGHT'
MSG2CUCLOSESERVICE = require '../FP/MSG2CUCLOSESERVICE'
Net = require 'net'

module.exports =
class Controller extends EventEmitter
  constructor: () ->
    @timeout = 60000
    @ip = "127.0.0.1"
    @port = 4444 # fixed
    @client = null
    @closingService = false

  setPort: (val) ->
    @port = val

  setIP: (val) ->
    @ip = val

  resetTimeoutTimer: () ->
    @stopTimeoutTimer()
    @timeout_timer = setTimeout @close.bind(@), @timeout

  stopTimeoutTimer: () ->
    if @timeout_timer
      clearTimeout @timeout_timer
    @timeout_timer = setTimeout @close.bind(@), @timeout

  open: () ->
    console.log 'open controller',@client
    if @client==null
      console.log 'open controller'
      @client = Net.createConnection @port, @ip, () => @onConnect()


  onConnect: () ->
    @resetTimeoutTimer()
    @emit "open"
    @client.on 'end', () => @onClose()
    @client.on 'data', (data) => @onData(data)
    @sendOpenBBSStatusLight()


  onData: (data) ->
    message = Message.getMessageObject data
    if message.type_of_message == Message.TYPE_ACK
      @handleACK message
    else if message.type_of_message == Message.TYPE_BBS_RETURN_STATUS_LIGHT
      @emit "status light", message
      console.log "emitted status light", message
      @closingService = true
      @sendCloseService()
    else
      console.log 'unkown message'

  handleACK: (message) ->
    if message.serviceID == Message.SERVICE_STATUS_LIGHT
      if @closingService==true
        console.log 'closing service'
      else
        @closingService=false
        @sendBBSStatusLight()
    else
      console.log 'unkown message'

  onClose: () ->
    @stopTimeoutTimer()
    @emit "closed"
    @client=null


  close: () ->
    if @client != null
      @client.close()

  sendCloseService: () ->
    message = new MSG2CUCLOSESERVICE
    @client.write message.app_data

  sendBBSStatusLight: () ->
    message = new MSG2CUGETSTATUSLIGHT
    @client.write message.app_data

  sendOpenBBSStatusLight: () ->
    message = new MSG2CUOPENSERVICE
    message.setServiceID(Message.SERVICE_STATUS_LIGHT)
    @client.write message.app_data
