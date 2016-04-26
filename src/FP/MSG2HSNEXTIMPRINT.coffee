{Message} = require './Message'

module.exports =
class MSG2HSNEXTIMPRINT extends Message

  constructor: () ->
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
    @setMessageType Message.TYPE_BBS_STOP_PRINT_JOB

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
    data.position = 0
    @job_id = data.readUInt()
    @customer_id = data.readUInt()
    @machine_no = data.readUInt()
    @high_imprint_no = data.readUInt()
    @low_imprint_no = data.readUInt()
    @imprint_no = (@high_imprint_no >> 32) + @low_imprint_no
    @creationDate = data.readDate()
    @printedDate = data.readDate()
    @endorsement_id = data.readInt()
    @town_circle_id = data.readUInt()
    @mail_length = data.readInt()
    @mail_height = data.readInt()
    @mail_thickness = data.readInt()
    @mail_weight = data.readUInt()
    @app_data = data
