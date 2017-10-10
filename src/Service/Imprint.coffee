{EventEmitter} = require 'events'
Message = require '../FP/Message'
MessageWrapper = require '../FP/MessageWrapper'
MSG2HSNEXTIMPRINT = require '../FP/MSG2HSNEXTIMPRINT'
MSG2CUPREPARESIZE = require '../FP/MSG2CUPREPARESIZE'

MSG2DCACK = require '../FP/MSG2DCACK'
net = require 'net'
os = require 'os'
freeport = require 'freeport'

module.exports =
class Imprint extends EventEmitter
  constructor: (machine_ip) ->
    @machine_ip = machine_ip
    @timeout = 60*60*60000
    @port = 14445
    @server = null
    @client = null

  getPort: () ->
    @address.port
  getIP: () ->
    res = "127.0.0.1"
    ifaces = os.networkInterfaces()
    m_ip = @machine_ip.split '.'
    Object.keys(ifaces).forEach (ifname)->
      alias = 0
      ifaces[ifname].forEach (iface) ->
        if ('IPv4' != iface.family or iface.internal != false)
          return
        if (alias >= 1)
          if process.env.DEBUG_BBS_IMPRINT=='1'
            console.log(ifname + ':' + alias, iface.address)
        else
          if process.env.DEBUG_BBS_IMPRINT=='1'
            console.log(ifname, iface.address)
        p = iface.address.split '.'
        if m_ip[0]==p[0] and m_ip[1]==p[1] and m_ip[2]==p[2]
          res=iface.address
      alias+=1
    res

  #setPort: (val) ->
  #  @port = val

  resetTimeoutTimer: () ->
    @stopTimeoutTimer()
    #@timeout_timer = setTimeout @close.bind(@), @timeout

  stopTimeoutTimer: () ->
    if @timeout_timer
      clearTimeout @timeout_timer
    #@timeout_timer = setTimeout @close.bind(@), @timeout

  open: () ->
    if @server == null
      #freeport (err,port) =>
      #@port = port

      # half on is it correct there?
      options =
        family: 'IPv4'
        host: '0.0.0.0'
        allowHalfOpen: false
        pauseOnConnect: false
      @server = net.createServer options, (client) => @onClientConnect(client)
      @server.on 'error', (err) => @onServerError(err)
      @server.on 'close', () => @onServerClose()
      @server.listen 0, @getIP(), () => @onServerBound()

  onServerError: (err) ->
    console.error err

  debugConnections: () ->
    @server.getConnections (err,count) ->
      console.log 'IMPRINT SERVER', 'count connections', err, count

  onServerBound: () ->
    @address = @server.address()

    @port = @address.port
    @ip = @address.address

    if process.env.DEBUG_BBS_IMPRINT=='1'
      setInterval @debugConnections.bind(@),3000

    if process.env.DEBUG_BBS_IMPRINT=='1'
      console.log @address
    @resetTimeoutTimer()
    if process.env.DEBUG_BBS_IMPRINT=='1'
      console.log 'imprint','server created'
    @emit "open"

  onClientConnect: (client) ->
    #console.log 'imprint','client connect'
    #if @client==null
    @client = client
    @client.on 'data', (data) => @onClientData(data)
    @client.on 'end', (data) => @onClientEnd(data)
    @client.on 'error', (err) => @onClientError(err)
    @client.on 'close', () => @onClientClose()
    #else
    #  console.error 'onClientConnect','there is a client allready'

  onClientEnd: (data) ->
    if process.env.DEBUG_BBS_IMPRINT=='1'
      console.log 'imprint client end'
    @onClientData data

  onClientData: (data) ->
    if data
      @resetTimeoutTimer()
      if process.env.DEBUG_BBS_IMPRINT=='1'
        console.log 'imprint client data < ',data.toString('hex')
      message = MessageWrapper.getMessageObject data
      if process.env.DEBUG_BBS_IMPRINT=='1'
        console.log 'imprint message', message
      if message.type_of_message ==  Message.TYPE_BBS_NEXT_IMPRINT
        @emit 'imprint', message
        ack = new MSG2DCACK
        ack.setApplictiondata()
        sendbuffer = ack.toFullByteArray()
        @client.write sendbuffer
        if process.env.DEBUG_BBS_IMPRINT=='1'
          console.log '>>>SEND ACK',sendbuffer
      else if message.type_of_message == Message.SERVICE_NEXT_IMPRINT
        if process.env.DEBUG_BBS_IMPRINT=='1'
          console.log 'imprint','SERVICE_NEXT_IMPRINT'
        @emit 'acting'
        ack = new MSG2DCACK
        ack.setServiceID Message.SERVICE_NEXT_IMPRINT
        ack.setApplictiondata()
        @client.write ack.toFullByteArray()

      else if message.type_of_message == Message.TYPE_OPEN_SERVICE
        if process.env.DEBUG_BBS_IMPRINT=='1'
          console.log 'imprint','TYPE_OPEN_SERVICE'
        @emit 'acting'
        ack = new MSG2DCACK
        ack.setServiceID Message.SERVICE_NEXT_IMPRINT
        ack.setApplictiondata()
        sendbuffer = ack.toFullByteArray()
        #sizemessage = new MSG2CUPREPARESIZE
        #sizemessage.setSize sendbuffer.length
        #@client.write sizemessage.getBuffer()
        @client.write sendbuffer
        #@client.write ack.app_data

      else if message.type_of_message == 4098
        @emit 'acting'
        ack = new MSG2DCACK
        ack.setServiceID Message.SERVICE_NEXT_IMPRINT
        ack.setApplictiondata()

        sendbuffer = ack.toFullByteArray()
        #sizemessage = new MSG2CUPREPARESIZE
        #sizemessage.setSize sendbuffer.length
        #@client.write sizemessage.getBuffer()
        @client.write sendbuffer
        #@client.end()
        #@client.write ack.app_data

      else
        if process.env.DEBUG_BBS_IMPRINT=='1'
          console.log 'message', 'not expected imprint messages'

  onClientClose: () ->
    #@client = null
    if @client.destroyed==false
      @client.destroy()
    if process.env.DEBUG_BBS_IMPRINT=='1'
      console.error 'onClientClose()'

  onClientError: (err) ->
    if @client.destroyed==false
      @client.destroy()
    if process.env.DEBUG_BBS_IMPRINT=='1'
      console.error 'client error', err


  closeClient: () ->
    if @client?#!=null
      if @client.destroyed==false
        @client.end()
    if @client?  and @client.destroyed==false
      if process.env.DEBUG_BBS_IMPRINT=='1'
        console.log 'closeClient','open'
    else
      if process.env.DEBUG_BBS_IMPRINT=='1'
        console.log 'closeClient','not open'

  close: () ->
    if @client?#!=null
      @client.end()

    if process.env.DEBUG_BBS_IMPRINT=='1'
      console.error 'server ------>   close()'
    @server.close()

  onServerClose: () ->
    if process.env.DEBUG_BBS_IMPRINT=='1'
      console.error 'onServerClose'
    @stopTimeoutTimer()
    @emit "closed"
