Message = require './Message'

module.exports =
class MSG2CUGETSTATUSRESPONSE extends Message

  constructor: () ->
    super()
    @b_unkown = 1
    @statusID = 0x191b
    @version = new Buffer 0
    @setMessageInterface Message.INTERFACE_DO
    @setMessageType Message.TYPE_BBS_GET_STATUS_RESPONSE

  setStatusID: (id) ->
    @statusID = id

  readApplictiondata: (data) ->
    position = -1
    @b_unkown = data.readUInt8 position+=1
    @serviceID = data.readUInt16BE position+=2
    @version_length = data.readUInt32BE position+=4
    @version = data.slice position

  setApplictiondata: () ->
    @app_data = new Buffer 7 + version.length
    position = -1
    @app_data.writeUInt8 @b_unkown, position+=1
    @app_data.writeUInt16BE @statusID, position+=2
    @app_data.writeUInt32BE version.length, position+=4
    version.copy @app_data, position
