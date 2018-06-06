{Command} = require 'tualo-commander'
path = require 'path'
fs = require 'fs'
Net = require 'net'
MessageWrapper = require '../FP/MessageWrapper'
Message = require '../FP/Message'
MSG2CUPREPARESIZE =  require '../FP/MSG2CUPREPARESIZE'
MSG2DCACK =  require '../FP/MSG2DCACK'
MSG2CURETURNSTATUSLIGHT = require '../FP/MSG2CURETURNSTATUSLIGHT'
MSG2HSNEXTIMPRINT = require '../FP/MSG2HSNEXTIMPRINT'


module.exports =
class Sampleserver extends Command
  @commandName: 'sampleserver'
  @commandArgs: ['port']
  @commandShortDescription: 'sample port'
  @options: [
  ]

  sendImprints: () ->
    if @nextImprintMessage
      @imprints = Net.createConnection @nextImprintMessage.imprint_channel_port, @nextImprintMessage.imprint_channel_ip, () => @onImprinstConnect()
      @imprints.setTimeout 5000
      @imprints.on 'error', (err) ->
        console.log 'imprints error', err
      @imprints.on 'close', () ->
        console.log 'imprints closed'

  onImprinstConnect: () ->
    msg = new MSG2DCACK()
    msg.setMessageInterface Message.INTERFACE_CI
    msg.setMessageType Message.TYPE_OPEN_SERVICE
    msg.setServiceID Message.SERVICE_NEXT_IMPRINT
    sendbuffer = msg.toFullByteArray()
    @imprints.write sendbuffer
    fn = () ->
      @nextImprints 100
    setTimeout fn.bind(@),1200

  nextImprints: (count) ->
    if @nextImprintMessage
      if count > 0
        msg = new MSG2HSNEXTIMPRINT()

        msg.setMailLength 2206
        msg.setMailHeight 1103
        msg.setMailThickness 12
        msg.setMailWeight 97

        msg.setJobId @nextImprintMessage.job_id
        msg.setCustomerId 1
        msg.setMachineNo 210
        msg.setImprintNo Math.round( ( (new Date()).getTime()-(new Date('2016-01-01')).getTime() )/1000 ) - 14200000
        #Math.round( ( (new Date()).getTime()-(new Date('2016-01-01')).getTime() )/1000 ) - 14200000
        msg.setEndorsementId 1
        msg.setTownCircleID 1

        sendbuffer = msg.toFullByteArray()
        @imprints.write sendbuffer
        fn = () ->
          @nextImprints count - 1
        setTimeout fn.bind(@),500
      else
        msg = new MSG2DCACK()
        msg.setMessageInterface Message.INTERFACE_CI
        msg.setMessageType Message.TYPE_CLOSE_SERVICE
        msg.setServiceID Message.SERVICE_NEXT_IMPRINT
        sendbuffer = msg.toFullByteArray()
        @imprints.write sendbuffer
        fn = () ->
          #@imprints.end()
          #fn = () ->
          #  console.log 'rerun'
          #  @onImprinstConnect()
          #setTimeout fn.bind(@),1500
        setTimeout fn.bind(@),500


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
    @imprintNUM = 100
    @isPrinting = 0
    @timeout = 60000 * 15
    @client = null
    if args.port
      options =
        allowHalfOpen: false
        pauseOnConnect: false
      @server = Net.createServer options, (client) => @onClientConnect(client)
      @server.on 'error', (err) => @onServerError(err)
      @server.on 'close', () => @onServerClose()
      @server.listen args.port,'127.0.0.1', () => @onServerBound()

  onServerError: (err) ->
    console.error err

  onServerClose: () ->
    console.log 'close'

  debugConnections: () ->
    @server.getConnections (err,count) ->
      console.log 'SAMPLE SERVER', 'count connections', err, count

  onServerBound: () ->
    @address = @server.address()
    #console.log('server',@address)
    #setInterval @debugConnections.bind(@),3000

    @resetTimeoutTimer()

  onClientConnect: (client) ->
    @client = client
    @client.on 'data', (data) => @onClientData(data)
    @client.on 'end', (data) => @onClientEnd(data)
    @client.on 'error', (err) => @onClientError(err)
    @client.on 'close', () => @onClientClose()

  onClientEnd: (data) ->
    @onClientData data
    #@client.end()

  onClientData: (data) ->
    if data?
      #console.log '<<<', data
      message = MessageWrapper.getMessageObject data
      if message==-1 or (message.type_of_message==4 and message.interface_of_message==5)
        data = data.slice 10
        if data.length >= 8
          message = MessageWrapper.getMessageObject data
        else
          return

      #console.log '<message<', message

      if message.interface_of_message == 0 and message.serviceID == 1000
        console.log 'open print service'
        response = new MSG2DCACK
        response.interface_of_message = message.interface_of_message
        response.setServiceID message.serviceID
        sendbuffer = response.toFullByteArray()
        #console.log '>>>', sendbuffer

        sendbuffer = response.toFullByteArray()
        sizemessage = new MSG2CUPREPARESIZE
        sizemessage.setSize sendbuffer.length
        @client.write sizemessage.getBuffer()


        @client.write sendbuffer


      else if message.interface_of_message == 0 and message.type_of_message == 4098

        console.log 'close service'
        response = new MSG2DCACK
        response.interface_of_message = message.interface_of_message
        response.setServiceID message.serviceID
        sendbuffer = response.toFullByteArray()
        #console.log '>>>', sendbuffer
        sizemessage = new MSG2CUPREPARESIZE
        sizemessage.setSize sendbuffer.length
        @client.write sizemessage.getBuffer()
        
        @client.write sendbuffer


      else if message.interface_of_message == 0 and message.serviceID == 1003


        # open service
        console.log 'open status service'
        response = new MSG2DCACK
        response.interface_of_message = message.interface_of_message
        response.setServiceID message.serviceID
        sendbuffer = response.toFullByteArray()
        #console.log '>>>', sendbuffer
        sizemessage = new MSG2CUPREPARESIZE
        sizemessage.setSize sendbuffer.length
        @client.write sizemessage.getBuffer()
        
        @client.write sendbuffer


      else if message.interface_of_message == 9 and message.type_of_message == 4336
        console.log 'start print job',message
        response = new MSG2DCACK
        response.interface_of_message =  0 #message.interface_of_message
        response.type_of_message = message.type_of_message
        response.setServiceID 1000

        #console.log '>>> ***', sendbuffer
        sendbuffer = response.toFullByteArray()
        sizemessage = new MSG2CUPREPARESIZE
        sizemessage.setSize sendbuffer.length
        @client.write sizemessage.getBuffer()

        @client.write sendbuffer

        @nextImprintMessage = message
        @isPrinting=1
        @sendImprints()

        # 000810010000000203e9
        # 000910f20000003c0000000100000001000000dc000000000000000326390e0a050607e013390e0a050607e00000000000000000000008b0000004d80000000c00000061
        # 0008100200000000

      else if message.interface_of_message == 9 and message.type_of_message == 4337
        console.log 'stop print job',message
        response = new MSG2DCACK
        response.interface_of_message =  0 #message.interface_of_message
        response.setServiceID 1002
        sendbuffer = response.toFullByteArray()
        @isPrinting=0
        #console.log '>>> ***', sendbuffer
        @client.write sendbuffer

        @nextImprintMessage = null
        #@client.end()
        #@sendImprints()


      else if message.interface_of_message == 9 and message.type_of_message == 4339

        console.log 'MSG2CURETURNSTATUSLIGHT',message
        response = new MSG2CURETURNSTATUSLIGHT
        response.interface_of_message = message.interface_of_message
        response.setSystemUID(999)
        response.setAvailableScale(3)
        response.setPrintJobActive(0)
        response.setPrintJobID(0)

        if @isPrinting==1
          response.setPrintJobID(@nextImprintMessage.job_id)
          response.setPrintJobActive(@isPrinting)

        #response.setServiceID message.serviceID

        console.log 'MSG2CURETURNSTATUSLIGHT response',response
        sendbuffer = response.toFullByteArray()
        #console.log '>*>*>', sendbuffer
        sizemessage = new MSG2CUPREPARESIZE
        sizemessage.setSize sendbuffer.length
        @client.write sizemessage.getBuffer()
        
        @client.write sendbuffer

      else
        console.log 'client data',message

  onClientClose: () ->
    #if @client.destroyed==false
    #  @client.destroy()

  onClientError: (err) ->
    #if @client.destroyed==false
    #  @client.destroy()
    #console.error 'client error', err

  close: () ->
    if @client.destroyed==false
      @client.destroy()

    @server.close()
