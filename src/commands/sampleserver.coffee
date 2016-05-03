{Command} = require 'tualo-commander'
path = require 'path'
fs = require 'fs'
Net = require 'net'
MessageWrapper = require '../FP/MessageWrapper'
Message = require '../FP/Message'
MSG2CUPREPARESIZE =  require '../FP/MSG2CUPREPARESIZE'
MSG2DCACK =  require '../FP/MSG2DCACK'

module.exports =
class Sampleserver extends Command
  @commandName: 'sampleserver'
  @commandArgs: ['port']
  @commandShortDescription: 'sample port'
  @options: [
  ]


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
    @timeout = 60000 * 5
    @client = null
    if args.port
      options =
        allowHalfOpen: false
        pauseOnConnect: false
      @server = Net.createServer options, (client) => @onClientConnect(client)
      @server.on 'error', (err) => @onServerError(err)
      @server.on 'close', () => @onServerClose()
      @server.listen args.port, () => @onServerBound()

  onServerError: (err) ->
    console.error err

  onServerClose: () ->
    console.log 'close'

  onServerBound: () ->
    @address = @server.address()
    @resetTimeoutTimer()

  onClientConnect: (client) ->
    @client = client
    @client.on 'data', (data) => @onClientData(data)
    @client.on 'end', (data) => @onClientData(data)
    @client.on 'error', (err) => @onClientError(err)
    @client.on 'close', () => @onClientClose()

  onClientData: (data) ->
    if data?
      message = MessageWrapper.getMessageObject data
      if message==-1 or (message.type_of_message==4 and message.interface_of_message==5)
        return
      if message.interface_of_message == 0 and message.serviceID == 1003
        # open service
        console.log 'open service'
        response = new MSG2DCACK
        response.setServiceID message.serviceID
        sendbuffer = response.toFullByteArray()
        sizemessage = new MSG2CUPREPARESIZE
        sizemessage.setMessageInterface 5
        sizemessage.setMessageType Message.TYPE_ACK
        sizemessage.setSize sendbuffer.length

        console.log sizemessage.getBuffer()
        @client.write sizemessage.getBuffer()
        console.log sendbuffer
        @client.write sendbuffer
      else
        console.log 'client data',message

  onClientClose: () ->
    @client = null

  onClientError: (err) ->
    console.error 'client error', err

  close: () ->
    if @client!=null
      @client.close()
    @server.close()
