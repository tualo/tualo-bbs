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
    @start_message.setJobId parseInt(val)
  setCustomerId: (val) ->
    @start_message.setCustomerId parseInt(val)
  setPrintDate: (val) ->
    @start_message.setPrintDate parseInt(val)
  setDateAhead: (val) ->
    @start_message.setDateAhead parseInt(val)
  setWeightMode: (val) ->
    @start_message.setWeightMode parseInt(val)
  setPrintOffset: (val) ->
    @start_message.setPrintOffset parseInt(val)
  setImageId: (val) ->
    @start_message.setImageId parseInt(val)
  setPrintEndorsement: (val) ->
    @start_message.setPrintEndorsement parseInt(val)
  setEndorsementID: (val) ->
    @start_message.setEndorsementID parseInt(val)
  setEndorsementText1: (val) ->
    @start_message.setEndorsementText1 val
  setEndorsementText2: (val) ->
    @start_message.setEndorsementText2 val
  setAdvert: (val) ->
    @start_message.setAdvert val
  setAdvertHex: (val) ->
    try
      console.log 'StartPrintjob setAdvertHex', val
      @start_message.setAdvert Buffer.from(val.replace(/\s/g,'+'),'base64')
    catch e
      console.log 'StartPrintjob setAdvertHex error', val
      @start_message.setAdvert new Buffer(val.replace(/\s/g,'+'),'base64')

  setTownCircleID: (val) ->
    @start_message.setTownCircleID parseInt(val)
  setTownCircle: (val) ->
    @start_message.setTownCircle val
  setCustomerNumber: (val) ->
    @start_message.setCustomerNumber val
  setImprintChannelIP: (val) ->
    @start_message.setImprintChannelIP val
  setImprintChannelPort: (val) ->
    @start_message.setImprintChannelPort parseInt(val)

  init: () ->
    if process.env.DEBUG_BBS_STARTJOB=='1'
      console.log 'StartPrintjob', 'init'
    @start_message = new MSG2CUSTARTPRINTJOB
  run: () ->
    if process.env.DEBUG_BBS_STARTJOB=='1'
      console.log 'StartPrintjob', 'run'
    @once 'message', (message) => @onOpenService(message)
    @sendOpenService Message.SERVICE_BBS_PRINTJOB

  onOpenService: (message) ->
    if process.env.DEBUG_BBS_STARTJOB=='1'
      console.log 'StartPrintjob', 'onOpenService',message
    if message.type_of_message == Message.TYPE_ACK and message.serviceID == Message.SERVICE_BBS_PRINTJOB
      if process.env.DEBUG_BBS_STARTJOB=='1'
        console.log 'StartPrintjob', 'expected',message
      @once 'message', (message) => @onStartPrintJob(message)
      @startPrintJob()
    else
      if process.env.DEBUG_BBS_STARTJOB=='1'
        console.log 'StartPrintjob', 'unexpected', message
      @unexpected message

  onCloseService: (message) ->
    if process.env.DEBUG_BBS_STARTJOB=='1'
      console.log 'StartPrintjob', 'onCloseService', message
    if message.type_of_message == Message.TYPE_ACK# and message.serviceID == Message.SERVICE_BBS_PRINTJOB
      if process.env.DEBUG_BBS_STARTJOB=='1'
        console.log 'StartPrintjob', 'expected', message
      @end()
    else
      if process.env.DEBUG_BBS_STARTJOB=='1'
        console.log 'StartPrintjob', 'unexpected', message
      @unexpected message

  onStartPrintJob: (message) ->
    if process.env.DEBUG_BBS_STARTJOB=='1'
      console.log 'StartPrintjob', 'onStartPrintJob', message

    if message.type_of_message == Message.TYPE_BBS_START_PRINTJOB
      if process.env.DEBUG_BBS_STARTJOB=='1'
        console.log 'StartPrintjob', 'TYPE_BBS_START_PRINTJOB', message
        console.log 'TYPE_BBS_START_PRINTJOB'
      @message = message

      @once 'message', (message) => @onCloseService(message)
      @sendCloseService()
      if process.env.DEBUG_BBS_STARTJOB=='1'
        console.log 'ok closing'
    else if message.type_of_message == Message.TYPE_ACK
      if process.env.DEBUG_BBS_STARTJOB=='1'
        console.log 'StartPrintjob', 'TYPE_ACK', message
        console.log 'TYPE_ACK'
      @once 'message', (message) => @onCloseService(message)
      @sendCloseService()
    else
      if process.env.DEBUG_BBS_STARTJOB=='1'
        console.log 'StartPrintjob', 'something went wrong', message.type_of_message
      @unexpected message
    #else
    #  @unexpected message

  startPrintJob: () ->
    if process.env.DEBUG_BBS_STARTJOB=='1'
      console.log "start message>",@start_message
    sendbuffer = @start_message.toFullByteArray()
    sizemessage = new MSG2CUPREPARESIZE
    sizemessage.setSize sendbuffer.length
    if process.env.DEBUG_BBS_STARTJOB=='1'
      console.log "sizemessage> ", sizemessage.getBuffer().toString('hex')
    @client.write sizemessage.getBuffer()

    if process.env.DEBUG_BBS_STARTJOB=='1'
      console.log "sendbuffer> ", sendbuffer.toString('hex')
      console.log "image> ", @start_message.advert.toString('hex')
      console.log "image> ", @start_message.advert.toString('base64')
    @client.write sendbuffer
