Message = require './Message'

module.exports =
class MSG2DCACK extends Message
  constructor: () ->
    super()
    @serviceID = 0
    @setMessageInterface Message.INTERFACE_DI
    @setMessageType Message.TYPE_ACK
  setServiceID: (id) ->
    @serviceID = id
  setApplictiondata: () ->
    @app_data = new Buffer 2
    @app_data.writeUInt16BE @serviceID
  readApplictiondata: (data) ->
    @serviceID = data.readUInt16BE 0
