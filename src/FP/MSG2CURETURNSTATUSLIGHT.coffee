Message = require './Message'

module.exports =
class MSG2CURETURNSTATUSLIGHT extends Message

  constructor: () ->
    @available_scale = 0
    @available_scale_text = 'unkown'
    @system_uid = 0
    @print_job_active = 0
    @print_job_id = 0

    @setMessageInterface Message.INTERFACE_DI
    @setMessageType Message.TYPE_BBS_RETURN_STATUS_LIGHT

  setAvailableScale: (val) ->
    
    @available_scale = val
    if @available_scale == 0
      @available_scale_text = '0: No scale'
    if @available_scale == 1
      @available_scale_text = '1: Static scale'
    if @available_scale == 2
      @available_scale_text = '2: Dynamic scale'
    if @available_scale == 3
      @available_scale_text = '3: Static and dynamic scale'


  setSystemUID: (val) ->
    @system_uid = val

  setPrintJobActive: (val) ->
    @print_job_active = val

  setPrintJobID: (val) ->
    @print_job_id = val

  setApplictiondata: () ->
    position = 0
    @app_data = new Buffer 10

    @app_data.writeUInt8 @available_scale, position
    position+=1
    @app_data.writeUInt32BE @system_uid, position
    position+=4
    @app_data.writeUInt8 @print_job_active, position
    position+=1
    @app_data.writeUInt32BE @print_job_id, position
    position+=4

  readApplictiondata: (data) ->
    position = -1
    @setAvailableScale data.readUInt8 0
    @setSystemUID  data.readUInt32BE 1
    @setPrintJobActive data.readUInt8 5
    @setPrintJobID data.readUInt32BE 6
