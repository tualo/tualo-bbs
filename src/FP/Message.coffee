{EventEmitter} = require 'events'
{MessageBuffer} = require './MessageBuffer'



module.exports =
class Message extends EventEmitter
  @INTERFACE_SO=0 # status
  @INTERFACE_CI=8 # control
  @INTERFACE_DI=9 # input
  @INTERFACE_UN=5 # unkown
  @INTERFACE_DO=1 # output
  @SERVICE_BBS_PRINTJOB=1000 #
  @SERVICE_NEXT_IMPRINT=0x03e9 #
  @SERVICE_TIME_SYNC=1002 #
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
  @TYPE_BBS_STOP_PRINT_JOB=0x10f1
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
    @app_data = new MessageBuffer

  setMessageInterface: (num) ->
    @interface_of_message = num

  setMessageType: (num) ->
    @type_of_message = num

  readApplictiondata: (buffer) ->
    @app_data = buffer

  getMessageObject: (data) ->
    message_type = 0
    message_interface = 0
    message_size = 0
    msg = null
    temp_data = new MessageBuffer
    if data.length >= 8

      data.position = 0
      message_interface = data.readShort()
      data.position++
      message_type = data.readShort()
      data.position++
      message_size = data.readUInt()
      data.position+=2

      if message_type == Message.TYPE_ACK
        if message_interface==0
          msg = new MSG2DCACK
        else
          msg = new MSG2CUPREPARESIZE

      if message_type == Message.TYPE_NAK
        msg = new MSG2DCNAK

      if message_type == Message.TYPE_OPEN_SERVICE
        msg = new MSG2CUOPENSERVICE

      if message_type == Message.TYPE_CLOSE_SERVICE
        msg = new MSG2CUCLOSESERVICE

      if message_type == Message.TYPE_BBS_RETURN_STATUS_LIGHT
        msg = new MSG2CURETURNSTATUSLIGHT

      if message_type == Message.TYPE_BBS_GET_STATUS_LIGHT
        msg = new MSG2CUGETSTATUSLIGHT

      if message_type == Message.TYPE_BBS_START_PRINTJOB
        msg = new MSG2CUSTARTPRINTJOB

      if message_type == Message.TYPE_BBS_STOP_PRINT_JOB
        msg = new MSG2CUSTOPPRINTJOB

      if message_type == Message.TYPE_PREPARE_SIZE
        msg = new MSG2CUPREPARESIZE

      if message_type == Message.TYPE_BBS_GET_STATUS
        msg = new MSG2CUGETSTATUS

      if message_type == Message.TYPE_BBS_GET_STATUS_RESPONSE
        msg = new MSG2CUGETSTATUSRESPONSE

      if message_type == Message.TYPE_BBS_NEXT_IMPRINT
        msg = new MSG2HSNEXTIMPRINT

      if message_type == Message.TYPE_BBS_NEXT_IMPRINT
        msg = new MSG2HSNEXTIMPRINT

      if msg == null
        msg = new MSG2DCNAK()
        console.error('unknown message type '+message_type.toString(16))

      msg.setMessageType message_type
      msg.setMessageInterface message_interface
      temp_data = data.slice data.position
      msg.readApplictiondata temp_data

    else
      throw new Error "Incorrect Message length"
    msg
