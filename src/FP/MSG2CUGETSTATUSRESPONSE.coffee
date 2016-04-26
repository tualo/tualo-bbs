Message = require './Message'

module.exports =
class MSG2CUGETSTATUSRESPONSE extends Message

  constructor: () ->
    @b_unkown = 1
    @statusID = 0x191b
    @version = new Buffer
    @setMessageInterface Message.INTERFACE_DO
    @setMessageType Message.TYPE_BBS_GET_STATUS_RESPONSE

  setStatusID: (id) ->
    @statusID = id

  readApplictiondata: (data) ->
    data.position = 0
    @b_unkown = data.readByte()
    @serviceID = data.readShort()
    @version_length = data.readUnsignedInt()
    @version = data.slice data.position

  setApplictiondata: () ->
    @app_data = new MessageBuffer
    @app_data.writeByte @b_unkown
    @app_data.writeShort @statusID
    @app_data.writeUnsignedInt version.length
    @app_data.writeBytes version
