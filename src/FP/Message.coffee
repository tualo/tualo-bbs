{EventEmitter} = require 'events'
MessageBuffer = require './MessageBuffer'


module.exports =
class Message extends EventEmitter
  @INTERFACE_SO=0 # status
  @INTERFACE_CI=8 # control
  @INTERFACE_DI=9 # input
  @INTERFACE_UN=5 # unkown
  @INTERFACE_DO=1 # output
  @SERVICE_BBS_PRINTJOB=0x03e8 #
  @SERVICE_NEXT_IMPRINT=  0x03e9 #
  @SERVICE_TIME_SYNC=0x03ea #
  @SERVICE_STATUS_LIGHT=0x03eb #
  @SERVICE_STATUS=0x0391

  @TYPE_PREPARE_SIZE=0x0004
  @TYPE_LENGTH=0x9001
  @TYPE_ACK=0x0001
  @TYPE_NAK=0x0000
  @TYPE_OPEN_SERVICE=0x1001
  @TYPE_CLOSE_SERVICE=0x1002
  @TYPE_BBS_UNKOWN1=0x03eb
  @TYPE_BBS_START_PRINTJOB=0x10f0
  @TYPE_BBS_STOP_PRINTJOB=0x10f1
  @TYPE_BBS_NEXT_IMPRINT=0x10f2
  @TYPE_BBS_GET_STATUS_LIGHT=0x10f3
  @TYPE_BBS_GET_STATUS=0x1040
  @TYPE_BBS_GET_STATUS_RESPONSE=0x1041
  @TYPE_BBS_RETURN_STATUS_LIGHT=0x10f4
  @TYPE_BBS_TIME_SYNC=0x10f5


  @WEIGHT_MODE_STATIC=0
  @WEIGHT_MODE_FIRST_DYNAMIC=1
  @WEIGHT_MODE_DYNAMIC=2
  @WEIGHT_MODE_WITHOUT=3
  @PRINT_DATE_ON=1
  @PRINT_DATE_OFF=0
  @PRINT_ENDORSEMENT_ON=1
  @PRINT_ENDORSEMENT_OFF=0

  constructor: (options) ->
    @interface_of_message = 0
    @type_of_message = 0
    @bytes_of_application_data = 0
    @app_data = new Buffer 0

  setMessageInterface: (num) ->
    @interface_of_message = num

  setMessageType: (num) ->
    @type_of_message = num

  readApplictiondata: (buffer) ->
    @app_data = buffer
  setApplictiondata: () ->
    @app_data = new Buffer 0

  toFullByteArray: () ->
    @setApplictiondata()
    res = new Buffer 8 + @app_data.length
    res.writeUInt16BE @interface_of_message, 0
    res.writeUInt16BE @type_of_message, 2
    res.writeUInt32BE @app_data.length, 4
    @app_data.copy res, 8
    res
