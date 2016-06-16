{EventEmitter} = require 'events'
Message = require '../FP/Message'
MessageWrapper = require '../FP/MessageWrapper'

MSG2DCACK = require '../FP/MSG2DCACK'
MSG2CUOPENSERVICE = require '../FP/MSG2CUOPENSERVICE'
MSG2CUSTARTPRINTJOB = require '../FP/MSG2CUSTARTPRINTJOB'
MSG2CUCLOSESERVICE = require '../FP/MSG2CUCLOSESERVICE'
MSG2CUPREPARESIZE = require '../FP/MSG2CUPREPARESIZE'

Sequence = require './Sequence'

module.exports =
class StartPrintjob extends Sequence

  setJobId: (val) ->
    @start_message.setJobId val
  setCustomerId: (val) ->
    @start_message.setCustomerId val
  setPrintDate: (val) ->
    @start_message.setPrintDate val
  setDateAhead: (val) ->
    @start_message.setDateAhead val
  setWeightMode: (val) ->
    @start_message.setWeightMode val
  setPrintOffset: (val) ->
    @start_message.setPrintOffset val
  setImageId: (val) ->
    @start_message.setImageId val
  setPrintEndorsement: (val) ->
    @start_message.setPrintEndorsement val
  setEndorsementID: (val) ->
    @start_message.setEndorsementID val
  setEndorsementText1: (val) ->
    @start_message.setEndorsementText1 val
  setEndorsementText2: (val) ->
    @start_message.setEndorsementText2 val
  setAdvert: (val) ->
    @start_message.setAdvert val
  setAdvertHex: (val) ->
    try
      @start_message.setAdvert Buffer.from(val,'base64')
    catch e
      @start_message.setAdvert new Buffer(val,'base64')

  setTownCircleID: (val) ->
    @start_message.setTownCircleID val
  setTownCircle: (val) ->
    @start_message.setTownCircle val
  setCustomerNumber: (val) ->
    @start_message.setCustomerNumber val
  setImprintChannelIP: (val) ->
    @start_message.setImprintChannelIP val
  setImprintChannelPort: (val) ->
    @start_message.setImprintChannelPort parseInt(val)

  init: () ->
    @start_message = new MSG2CUSTARTPRINTJOB
  run: () ->
    @once 'message', (message) => @onOpenService(message)
    @sendOpenService Message.SERVICE_BBS_PRINTJOB

  onOpenService: (message) ->
    console.log 'on onOpenService'
    if message.type_of_message == Message.TYPE_ACK and message.serviceID == Message.SERVICE_BBS_PRINTJOB
      @once 'message', (message) => @onStartPrintJob(message)
      @startPrintJob()
    else
      @unexpected message

  onCloseService: (message) ->
    console.log 'on onCloseService'
    if message.type_of_message == Message.TYPE_ACK# and message.serviceID == Message.SERVICE_BBS_PRINTJOB
      @end()
    else
      @unexpected message

  onStartPrintJob: (message) ->
    console.log 'on onStartPrintJob',message

    if message.type_of_message == Message.TYPE_BBS_START_PRINTJOB
      console.log 'TYPE_BBS_START_PRINTJOB'
      @message = message

      @once 'message', (message) => @onCloseService(message)
      @sendCloseService()
      console.log 'ok closing'
    else if message.type_of_message == Message.TYPE_ACK
      console.log 'TYPE_ACK'
      @sendCloseService()
    #else
    #  @unexpected message

  startPrintJob: () ->

    sendbuffer = @start_message.toFullByteArray()
    sizemessage = new MSG2CUPREPARESIZE
    sizemessage.setSize sendbuffer.length
    console.log "> ", sizemessage.getBuffer()
    @client.write sizemessage.getBuffer()

    console.log "> ", sendbuffer
    @client.write sendbuffer
