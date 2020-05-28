Message = require './Message'
MessageBuffer = require './MessageBuffer'


module.exports =
class MSG2CUOPENSERVICE extends Message
  constructor: () ->
    super()
    @type = 'MSG2CUOPENSERVICE'
    @serviceID = 0
    @errorCode = 0
    @info = ""
    @setMessageInterface Message.INTERFACE_SO
    @setMessageType Message.TYPE_OPEN_SERVICE
  setServiceID: (id) ->
    @serviceID = id
  readApplictiondata: (data) ->
    @serviceID = data.readUInt16BE 0
  setApplictiondata: () ->
    @app_data = new Buffer 2
    @app_data.writeUInt16BE @serviceID, 0
