{EventEmitter} = require 'events'
Message = require '../FP/Message'
MessageWrapper = require '../FP/MessageWrapper'

MSG2DCACK = require '../FP/MSG2DCACK'
MSG2CUOPENSERVICE = require '../FP/MSG2CUOPENSERVICE'
MSG2CUSTOPPRINTJOB = require '../FP/MSG2CUSTOPPRINTJOB'
MSG2CUCLOSESERVICE = require '../FP/MSG2CUCLOSESERVICE'
MSG2CUPREPARESIZE = require '../FP/MSG2CUPREPARESIZE'

Sequence = require './Sequence'

module.exports =
class StopPrintjob extends Sequence

  run: () ->
    @stop_message = new MSG2CUSTOPPRINTJOB
    @once 'message', (message) => @onOpenService(message)
    @sendOpenService Message.SERVICE_BBS_PRINTJOB

  onOpenService: (message) ->
    if message.type_of_message == Message.TYPE_ACK and message.serviceID == Message.SERVICE_BBS_PRINTJOB
      @once 'message', (message) => @onStopPrintJob(message)
      @stopPrintJob()
    else
      @unexpected message

  onCloseService: (message) ->
    if message.type_of_message == Message.TYPE_ACK and message.serviceID == Message.SERVICE_BBS_PRINTJOB
      @end()
    else
      @unexpected message

  onStopPrintJob: (message) ->
    if message.type_of_message == Message.TYPE_BBS_STOP_PRINTJOB
      @message = message
      @once 'message', (message) => @onCloseService(message)
      @sendCloseService()
    else
      @unexpected message

  stopPrintJob: () ->

    sendbuffer = @stop_message.toFullByteArray()
    sizemessage = new MSG2CUPREPARESIZE
    sizemessage.setSize sendbuffer.length
    @client.write sizemessage.getBuffer()
    @client.write sendbuffer
