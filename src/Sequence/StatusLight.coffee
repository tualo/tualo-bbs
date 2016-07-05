{EventEmitter} = require 'events'
Message = require '../FP/Message'
MessageWrapper = require '../FP/MessageWrapper'

MSG2DCACK = require '../FP/MSG2DCACK'
MSG2CUOPENSERVICE = require '../FP/MSG2CUOPENSERVICE'
MSG2CUGETSTATUSLIGHT = require '../FP/MSG2CUGETSTATUSLIGHT'
MSG2CUCLOSESERVICE = require '../FP/MSG2CUCLOSESERVICE'
MSG2CUPREPARESIZE = require '../FP/MSG2CUPREPARESIZE'

Sequence = require './Sequence'

module.exports =
class StatusLight extends Sequence

  run: () ->
    @once 'message', (message) => @onOpenService(message)
    @sendOpenService Message.SERVICE_STATUS_LIGHT

  onOpenService: (message) ->
    console.log message
    if message.type_of_message == Message.TYPE_ACK and message.serviceID == Message.SERVICE_STATUS_LIGHT
      @once 'message', (message) => @onGetStatusLight(message)
      console.log('sendBBSStatusLight')
      @sendBBSStatusLight()
    #else
    #  @unexpected message

  onCloseService: (message) ->
    console.log('onCloseService',message,Message.SERVICE_STATUS_LIGHT)
    #if message.type_of_message == Message.TYPE_ACK# and message.serviceID == Message.SERVICE_STATUS_LIGHT
    @end()
    #else
    #  @unexpected message

  onGetStatusLight: (message) ->
    console.log('onGetStatusLight',message,Message.TYPE_BBS_RETURN_STATUS_LIGHT)
    if message.type_of_message == Message.TYPE_BBS_RETURN_STATUS_LIGHT
      @message = message
      @once 'message', (message) => @onCloseService(message)
      @sendCloseService()
    else
  #    @unexpected message

  sendBBSStatusLight: () ->
    message = new MSG2CUGETSTATUSLIGHT

    sendbuffer = message.toFullByteArray()
    sizemessage = new MSG2CUPREPARESIZE
    sizemessage.setSize sendbuffer.length
    @client.write sizemessage.getBuffer()
    @client.write sendbuffer
