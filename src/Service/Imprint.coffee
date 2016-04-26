{EventEmitter} = require 'events'
{Message} = require '../FP/Message'
{MessageBuffer} = require '../FP/MessageBuffer'
{MSG2HSNEXTIMPRINT} = require '../FP/MSG2HSNEXTIMPRINT'
{MSG2DCACK} = require '../FP/MSG2DCACK'
{Server} = require 'net'

module.exports =
class Imprint extends EventEmitter
  constructor: () ->
    @timeout = 60000
    @port = 4445
    @server = null
    @client = null

  setPort: (val) ->
    @port = val

  resetTimeoutTimer: () ->
    @stopTimeoutTimer()
    @timeout_timer = setTimeout @close.bind(@), @timeout

  stopTimeoutTimer: () ->
    if @timeout_timer
      clearTimeout @timeout_timer
    @timeout_timer = setTimeout @close.bind(@), @timeout

  open: () ->
    if @server == null
      options =
        allowHalfOpen: false
        pauseOnConnect: false
      @server = net.createServer options, (client) => @onClientConnect(client)
      @server.on 'error', (err) => @onServerError(err)
      @server.on 'close', () => @onServerClose()
      @server.listen @port, () => @onServerBound()

  onServerError: (err) ->
    console.error err

  onServerBound: () ->
    @address = @server.address()
    @resetTimeoutTimer()
    @emit "open"

  onClientConnect: (client) ->
    if @client==null
      @client = client
      @client.on 'data', (data) -> @onClientData(data)
      @client.on 'end', (data) -> @onClientData(data)
      @client.on 'error', (err) -> @onClientError(err)
      @client.on 'close', () -> @onClientClose()
    else
      console.error 'onClientConnect','there is a client allready'

  onClientData: (data) ->

    console.log 'client data',data.toString(16)
    message = Message.getMessageObject data
    console.log 'message', message

    if message.type_of_message == Message.SERVICE_NEXT_IMPRINT
      @emit 'imprint', message
      ack = new MSG2DCACK
      ack.setApplictiondata()
      @client.write ack.app_data

    else if message.type_of_message == Message.SERVICE_NEXT_IMPRINT
      ack = new MSG2DCACK
      ack.setServiceID Message.SERVICE_NEXT_IMPRINT
      ack.setApplictiondata()
      @client.write ack.app_data

    else if message.type_of_message == Message.TYPE_OPEN_SERVICE
      ack = new MSG2DCACK
      ack.setServiceID Message.SERVICE_NEXT_IMPRINT
      ack.setApplictiondata()
      @client.write ack.app_data

    else
      console.log 'message', 'not expected imprint messages'

  onClientClose: () ->
    @client = null

  onClientError: (err) ->
    console.error 'client error', err

  close: () ->
    if @client!=null
      @client.close()

    @server.close()

  onServerClose: () ->
    @stopTimeoutTimer()
    @emit "closed"
