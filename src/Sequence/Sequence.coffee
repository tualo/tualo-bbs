{EventEmitter} = require 'events'
Message = require '../FP/Message'
MessageWrapper = require '../FP/MessageWrapper'

MSG2DCACK = require '../FP/MSG2DCACK'
MSG2CUOPENSERVICE = require '../FP/MSG2CUOPENSERVICE'
MSG2CUCLOSESERVICE = require '../FP/MSG2CUCLOSESERVICE'
MSG2CUPREPARESIZE = require '../FP/MSG2CUPREPARESIZE'

module.exports =
class Sequence extends EventEmitter
  constructor: (socket) ->
    @client = socket
    @client.closeEventName = 'expected'
    @client.on 'data', (data) => @onData(data)
    @message = null

  run: () ->

  end: () ->
    @client.removeListener 'data', @onData
    @client.closeEventName = 'expected'
    @emit 'end', @message
    @client.end()

  unexpected: (message) ->
    @client.removeListener 'data', @onData
    @emit 'unexpected', message

  onData: (data) ->
    message = MessageWrapper.getMessageObject data
    if message==-1
      return
    @emit 'message', message

  sendCloseService: () ->

    message = new MSG2CUCLOSESERVICE

    sendbuffer = message.toFullByteArray()
    sizemessage = new MSG2CUPREPARESIZE
    sizemessage.setSize sendbuffer.length
    @client.write sizemessage.getBuffer()
    @client.write sendbuffer
    @client.end()

  sendOpenService: (type) ->

    message = new MSG2CUOPENSERVICE
    message.setServiceID(type)
    sendbuffer = message.toFullByteArray()

    sizemessage = new MSG2CUPREPARESIZE
    sizemessage.setSize sendbuffer.length
    @client.write sizemessage.getBuffer()
    @client.write sendbuffer
