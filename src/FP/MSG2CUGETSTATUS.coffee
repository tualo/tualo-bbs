Message = require './Message'

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
    position = -1
    @b_unkown = data.readUInt8 position+=1
    @serviceID = data.readUInt16BE position+=2

  setApplictiondata: () ->
    @app_data = new Buffer 3
    position = -1
    @app_data.writeUInt8 @b_unkown,position+=1
    @app_data.writeUInt16BE @statusID,position+=2
