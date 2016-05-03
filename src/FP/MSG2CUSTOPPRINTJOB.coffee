Message = require './Message'

module.exports =
class MSG2CUSTOPPRINTJOB extends Message

  constructor: () ->
    
    @setMessageInterface Message.INTERFACE_DI
    @setMessageType Message.TYPE_BBS_STOP_PRINT_JOB
