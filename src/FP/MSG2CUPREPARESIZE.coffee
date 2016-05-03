Message = require './Message'

module.exports =
class MSG2CUPREPARESIZE extends Message

  constructor: () ->
    @size = 0

    @setMessageInterface Message.INTERFACE_UN
    @setMessageType Message.TYPE_PREPARE_SIZE

  setSize: (val) ->
    @size = val

  readApplictiondata: (data) ->
    data.position = 0
    @size = data.readUInt16BE()

  setApplictiondata: (data) ->
    position = 0
    @app_data = new Buffer 2
    @app_data.writeUInt16BE @size,position

  getBuffer: () ->
    @setApplictiondata()
    buf = new Buffer 10
    buf.writeUInt16BE @interface_of_message, 0
    buf.writeUInt16BE @type_of_message, 2
    buf.writeUInt32BE 0x00010000, 4
    @app_data.copy buf, 8
    buf
