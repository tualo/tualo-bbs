{Message} = require './Message'

module.exports =
class MSG2CUOPENSERVICE extends Message
  constructor: () ->
    @serviceID = 0
    @errorCode = 0
    @info = ""
    @setMessageInterface Message.INTERFACE_SO
    @setMessageType Message.TYPE_OPEN_SERVICE
  setServiceID: (id) ->
    @serviceID = id
  readApplictiondata: (data) ->
    data.position = 0
    @serviceID = data.readShort()
  setApplictiondata: () ->
    @app_data = new MessageBuffer
    @app_data.writeShort @serviceID
