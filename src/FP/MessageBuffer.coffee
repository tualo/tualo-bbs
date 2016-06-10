
Buffer.prototype.position = 0

Buffer.prototype.readDate = () ->
  d = new Date
  d.setSeconds @readInt8(0) #0
  d.setMinutes @readInt8(1) # 1
  d.setHours @readInt8(2) # 2
  d.setDate @readInt8(3) # 3
  #@readByte() # 4
  d.setMonth @readInt8(5)-1 # 5
  d.setFullYear @readUInt16BE(6) # 6
  d

Buffer.prototype.writeDate = (d) ->
  @writeInt8 d.getSeconds(),0
  @writeInt8 d.getMinutes(),1
  @writeInt8 d.getHours(),2
  @writeInt8 d.getDate(),3
  @writeInt8 d.getDay(),4
  @writeInt8 d.getMonth()+1,5
  @writeUInt16BE d.getFullYear(),6

Buffer.prototype.writeMultiByte = (txt,type) ->
  if type=='iso-8859-1'
    type = 'ascii'
  val = @write txt, @position, type
  @position+=txt.length
  val
Buffer.prototype.readMultiByte = (length,type) ->
  val = @toString 'ascii', @position, @position+length
  @position+=length
  val
