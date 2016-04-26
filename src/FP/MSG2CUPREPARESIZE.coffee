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
    @size = data.readShort()

  setApplictiondata: (data) ->
    @app_data.position = 0
    @app_data.writeShort @size

#public override function toByteArray():ByteArray {
#			setApplictiondata();
#			var return_array:ByteArray = new ByteArray();
#			bytes_of_application_data = app_data.length;
#			return_array.writeShort(interface_of_message);
#			return_array.writeShort(type_of_message);
#			return_array.writeUnsignedInt(0x00010000);
#			return_array.writeBytes(app_data);
#			return return_array;
#		}
