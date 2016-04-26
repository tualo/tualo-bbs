{Message} = require './Message'

module.exports =
class MSG2CUGETSTATUS extends Message

  constructor: () ->
    @b_unkown = 1
    @statusID = 0x191b
    @setMessageInterface Message.INTERFACE_DO
    @setMessageType Message.TYPE_BBS_GET_STATUS

  setStatusID: (id) ->
    @statusID = id

  readApplictiondata: (data) ->
    data.position = 0
    @b_unkown = data.readByte()
    @serviceID = data.readShort()

  setApplictiondata: () ->
    @app_data = new MessageBuffer
    @app_data.writeByte @b_unkown
    @app_data.writeShort @statusID
