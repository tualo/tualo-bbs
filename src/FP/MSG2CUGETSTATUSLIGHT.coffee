Message = require './Message'

module.exports =
class MSG2CUGETSTATUSLIGHT extends Message

  constructor: () ->
    super()
    
    @setMessageInterface Message.INTERFACE_DI
    @setMessageType Message.TYPE_BBS_GET_STATUS_LIGHT
