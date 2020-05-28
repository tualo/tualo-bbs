Message = require './Message'

module.exports =
class MSG2CUSTOPPRINTJOB extends Message

  constructor: () ->
    super()

    @setMessageInterface Message.INTERFACE_DI
    @setMessageType Message.TYPE_BBS_STOP_PRINTJOB
