Message = require './Message'

module.exports =
class MSG2CUGETSTATUSLIGHT extends Message

  constructor: () ->
    @setMessageInterface Message.INTERFACE_DI
    @setMessageType Message.TYPE_BBS_GET_STATUS_LIGHT
