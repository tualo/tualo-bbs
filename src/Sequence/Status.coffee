{EventEmitter} = require 'events'
Message = require '../FP/Message'
MessageWrapper = require '../FP/MessageWrapper'

MSG2DCACK = require '../FP/MSG2DCACK'
MSG2CUOPENSERVICE = require '../FP/MSG2CUOPENSERVICE'
MSG2CUGETSTATUS = require '../FP/MSG2CUGETSTATUS'
MSG2CUCLOSESERVICE = require '../FP/MSG2CUCLOSESERVICE'
MSG2CUPREPARESIZE = require '../FP/MSG2CUPREPARESIZE'

Sequence = require './Sequence'

module.exports =
class Status extends Sequence

  run: () ->
    @once 'message', (message) => @onOpenService(message)
    @sendOpenService Message.SERVICE_STATUS

  onOpenService: (message) ->
    if process.env.DEBUG_BBS_STATU=='1'
      console.log message
    if message.type_of_message == Message.TYPE_ACK and message.serviceID == Message.SERVICE_STATUS
      @once 'message', (message) => @onGetStatus(message)
      if process.env.DEBUG_BBS_STATU=='1'
        console.log('sendBBSStatusLight')
      @sendBBSStatus()
    #else
    #  @unexpected message

  onCloseService: (message) ->
    if process.env.DEBUG_BBS_STATU=='1'
      console.log('onCloseService',message,Message.SERVICE_STATUS)
    #if message.type_of_message == Message.TYPE_ACK# and message.serviceID == Message.SERVICE_STATUS_LIGHT
    @end()
    #else
    #  @unexpected message

  onGetStatus: (message) ->
    if process.env.DEBUG_BBS_STATU=='1'
      console.log('onGetStatus',message,Message.TYPE_BBS_GET_STATUS_RESPONSE)
    if message.type_of_message == Message.TYPE_BBS_GET_STATUS_RESPONSE
      @message = message
      @once 'message', (message) => @onCloseService(message)
      @sendCloseService()
    else
  #    @unexpected message

  sendBBSStatus: () ->
    message = new MSG2CUGETSTATUS

    sendbuffer = message.toFullByteArray()
    sizemessage = new MSG2CUPREPARESIZE
    sizemessage.setSize sendbuffer.length
    @client.write sizemessage.getBuffer()
    @client.write sendbuffer
