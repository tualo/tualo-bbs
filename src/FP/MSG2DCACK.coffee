Message = require './Message'

module.exports =
class MSG2DCACK extends Message
  constructor: () ->
    @serviceID = 0
    @setMessageInterface Message.INTERFACE_DI
    @setMessageType Message.TYPE_ACK
  setServiceID: (id) ->
    @serviceID = id
  setApplictiondata: () ->
    @app_data = new MessageBuffer
    @app_data.writeShort @serviceID
  readApplictiondata: (data) ->
    data.position = 0
    @serviceID = data.readShort()
