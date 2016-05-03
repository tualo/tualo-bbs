Message = require './Message'

module.exports =
class MSG2DCNAK extends Message
  constructor: () ->
    @serviceID = 0
    @errorCode = 0
    @info = ""
    @setMessageInterface Message.INTERFACE_DI
    @setMessageType Message.TYPE_NAK
  setServiceID: (id) ->
    @serviceID = id
  setErrorCode:  (code) ->
    @errorCode = code
  setInfo:  (txt_info) ->
    @info = txt_info
  setApplictiondata: () ->
    @app_data = new Buffer 6+info.length
    @app_data.writeUInt16BE @serviceID,0
    @app_data.writeUInt16BE errorCode,2
    @app_data.writeUInt16BE info.length,4
    @app_data.write info,8, "ascii"
  readApplictiondata: (data) ->
    data.position = 0
    @serviceID = data.readUInt16BE 0
    @errorCode = data.readUInt16BE 2
    console.warn "Error Service: " + (@serviceID.toString(16))
    console.warn "Error Code: " + (@errorCode.toString(16))
    if (@errorCode==0)
      console.warn "unkown error"
    else if (@errorCode==1)
      console.warn "received valid message but expected different one"
    else if (@errorCode==2)
      console.warn "no valid message"
    else if (@errorCode==3)
      console.warn "service opened but no valid service message"
    else if (@errorCode==4)
      console.warn "service unkown"
    else if (@errorCode==5)
      console.warn "service not opened"
    else
      console.warn "unkown error number"

    infoLength = data.readUInt16BE 4
    @info = data.toString 'ascii', 8, 8+infoLength
    console.warn @info
