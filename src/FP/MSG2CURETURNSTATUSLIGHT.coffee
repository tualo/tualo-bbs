Message = require './Message'

module.exports =
class MSG2CURETURNSTATUSLIGHT extends Message

  constructor: () ->
    @available_scale = 0
    @system_uid = 0
    @print_job_active = 0
    @print_job_id = 0

    @setMessageInterface Message.INTERFACE_DI
    @setMessageType Message.TYPE_BBS_RETURN_STATUS_LIGHT

  setAvailableScale: (val) ->
    @available_scale = val

  setSystemUID: (val) ->
    @system_uid = val

  setPrintJobActive: (val) ->
    @print_job_active = val

  setPrintJobID: (val) ->
    @print_job_id = val

  readApplictiondata: (data) ->
    position = -1
    @setAvailableScale data.readUInt8 0
    @setSystemUID  data.readUInt32BE 1
    @setPrintJobActive data.readUInt8 5
    @setPrintJobID data.readUInt32BE 6
