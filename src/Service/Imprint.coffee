{EventEmitter} = require 'events'
Message = require '../FP/Message'
MessageWrapper = require '../FP/MessageWrapper'
MSG2HSNEXTIMPRINT = require '../FP/MSG2HSNEXTIMPRINT'
MSG2CUPREPARESIZE = require '../FP/MSG2CUPREPARESIZE'

MSG2DCACK = require '../FP/MSG2DCACK'
net = require 'net'
os = require 'os'

module.exports =
class Imprint extends EventEmitter
  constructor: () ->
    @timeout = 3*60000
    @port = 14445
    @server = null
    @client = null

  getIP: () ->
    res = "127.0.0.1"
    ifaces = os.networkInterfaces()
    Object.keys(ifaces).forEach (ifname)->
      alias = 0
      ifaces[ifname].forEach (iface) ->
        if ('IPv4' != iface.family or iface.internal != false)
          return
        if (alias >= 1)
          console.log(ifname + ':' + alias, iface.address)
        else
          console.log(ifname, iface.address)
        res=iface.address
      alias+=1
    res
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
        family: 'IPv4'
        host: '0.0.0.0'
        allowHalfOpen: true
        pauseOnConnect: false
      @server = net.createServer options, (client) => @onClientConnect(client)
      @server.on 'error', (err) => @onServerError(err)
      @server.on 'close', () => @onServerClose()
      @server.listen @port,'192.168.192.243', () => @onServerBound()

  onServerError: (err) ->
    console.error err

  onServerBound: () ->
    @address = @server.address()
    console.log @address
    @resetTimeoutTimer()
    console.log 'imprint','server created'
    @emit "open"

  onClientConnect: (client) ->
    console.log 'imprint','client connect'
    if @client==null
      @client = client
      @client.on 'data', (data) => @onClientData(data)
      @client.on 'end', (data) => @onClientData(data)
      @client.on 'error', (err) => @onClientError(err)
      @client.on 'close', () => @onClientClose()
    else
      console.error 'onClientConnect','there is a client allready'

  onClientData: (data) ->
    if data
      console.log 'imprint client data',data.toString('hex')
      message = MessageWrapper.getMessageObject data
      console.log 'imprint message', message

      if message.type_of_message == 4338
        console.log '1'
        @emit 'imprint', message
        ack = new MSG2DCACK
        ack.setApplictiondata()
        @client.write ack.toFullByteArray()
      else if message.type_of_message == 4098
        ack = new MSG2DCACK
        ack.setServiceID Message.SERVICE_NEXT_IMPRINT
        ack.setApplictiondata()
        sendbuffer = ack.toFullByteArray()
        @client.write sendbuffer
      else if message.type_of_message == Message.SERVICE_NEXT_IMPRINT
        console.log '2'
        ack = new MSG2DCACK
        ack.setServiceID Message.SERVICE_NEXT_IMPRINT
        ack.setApplictiondata()
        @client.write ack.toFullByteArray()

      else if message.type_of_message == Message.TYPE_OPEN_SERVICE
        console.log '3'
        ack = new MSG2DCACK
        ack.setServiceID Message.SERVICE_NEXT_IMPRINT
        ack.setApplictiondata()

        sendbuffer = ack.toFullByteArray()
        #sizemessage = new MSG2CUPREPARESIZE
        #sizemessage.setSize sendbuffer.length
        #@client.write sizemessage.getBuffer()
        @client.write sendbuffer
        #@client.write ack.app_data

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
