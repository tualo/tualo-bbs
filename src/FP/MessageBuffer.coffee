
module.exports =
class MessageBuffer extends Buffer
  position: 0
  readDate: () ->
    d = new Date
    d.setSeconds @readByte() #0
    d.setMinutes @readByte() # 1
    d.setHours @readByte() # 2
    d.setDate @readByte() # 3
    @readByte() # 4
    d.setMonth @readByte()-1 # 5
    d.setFullYear @readShort() # 6
    d
  writeDate: (d) ->
    @writeByte d.getSeconds()
    @writeByte d.getMinutes()
    @writeByte d.getHours()
    @writeByte d.getDate()
    @writeByte d.getDay()
    @writeByte d.getMonth()+1
    @writeShort d.getFullYear()
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
    if type=='iso-8859-1'
      type = 'ascii'
    val = data.write txt, @position, type
    @position+=txt.length
    val
  readMultiByte: (length,type) ->
    val = data.toString 'ascii', @position, @position+length
    @position+=length
    val
