Message = require './Message'

module.exports =
class MSG2HSNEXTIMPRINT extends Message

  constructor: () ->
    @type = 'MSG2HSNEXTIMPRINT'
    @bbs_version = process.env.BBS_VERSION || 2
    @job_id = 0
    @customer_id = 0
    @machine_no = 0
    @imprint_no = 0
    @creationDate = new Date
    @printedDate = new Date
    @endorsement_id = 0
    @town_circle_id = 0
    @mail_length = 0
    @mail_height = 0
    @mail_thickness = 0
    @mail_weight = 0

    @setMessageInterface Message.INTERFACE_DI
    @setMessageType Message.TYPE_BBS_NEXT_IMPRINT

  setBBSVersion: (val) ->
    @bbs_version = val

  setJobId: (val) ->
    @job_id = val
  setCustomerId: (val) ->
    @customer_id = val
  setMachineNo: (val) ->
    @machine_no = val
  setImprintNo: (val) ->
    @imprint_no = val
  setCreationDate: (val) ->
    @creationDate = val
  setPrintedDate: (val) ->
    @printedDate = val
  setEndorsementId: (val) ->
    @endorsement_id = val
  setTownCircleID: (val) ->
    @town_circle_id = val
  setMailLength: (val) ->
    @mail_length = val
  setMailHeight: (val) ->
    @mail_height = val
  setMailThickness: (val) ->
    @mail_thickness = val
  setMailWeight: (val) ->
    @mail_weight = val

  readApplictiondata: (data) ->
    if data.length < 10
      return
    position = -4
    @job_id = data.readUInt32BE position+=4
    @customer_id = data.readUInt32BE position+=4
    @machine_no = data.readUInt32BE position+=4
    @high_imprint_no = data.readUInt32BE position+=4
    @low_imprint_no = data.readUInt32BE position+=4
    @imprint_no = (@high_imprint_no >> 32) + @low_imprint_no

    @creationDate = data.slice(position,position+8).readDate()
    position+=8
    @printedDate = data.slice(position,position+8).readDate()
    position+=8

    @endorsement_id = data.readUInt32BE position+=4
    if @bbs_version==2
      @town_circle_id = data.readUInt32BE position+=4
    @mail_length = data.readInt32BE position+=4
    @mail_height = data.readInt32BE position+=4
    @mail_thickness = data.readInt32BE position+=4
    @mail_weight = data.readInt32BE position+=4
    @app_data = data


  setApplictiondata: () ->
    data = new Buffer 60

    position = 0
    data.writeUInt32BE @job_id, position
    position+=4
    data.writeUInt32BE @customer_id, position
    position+=4
    data.writeUInt32BE @machine_no, position
    position+=4
    data.writeUInt32BE 0, position # @high_imprint_no
    position+=4
    data.writeUInt32BE @imprint_no, position # @low_imprint_no
    position+=4

    @creationDate = new Buffer(8)
    position+=8
    @printedDate = new Buffer(8)
    position+=8

    data.writeUInt32BE @endorsement_id, position
    position+=4
    if @bbs_version==2
      data.writeUInt32BE @town_circle_id, position
      position+=4

    data.writeUInt32BE @mail_length, position
    position+=4
    data.writeUInt32BE @mail_height, position
    position+=4
    data.writeUInt32BE @mail_thickness, position
    position+=4
    data.writeUInt32BE @mail_weight, position
    position+=4
    @app_data = data
