
module.exports =
class MessageBuffer extends Buffer
  position: 0
  readByte: () ->
    val = data.readInt @position
    @position++
    val
  writeByte: (num) ->
    val = data.writeInt num, @position
    @position++
    val

  readShort: () ->
    val = data.readUInt16BE @position
    @position+=2
    val
  writeShort: (num) ->
    val = data.writeUInt16BE num,@position
    @position+=2
    val

  readUInt: () ->
    val = data.readUInt32BE @position
    @position+=4
    val
  writeUInt: (num) ->
    val = data.writeUInt32BE num, @position
    @position+=4
    val
  writeMultiByte: (txt,type) ->
    val = data.writeMultiByte txt,type
    @position+=txt.length
    val
  readMultiByte: (length,type) ->
    val = data.readMultiByte txt,type
    @position+=length
    length
