Message = require './Message'

module.exports =
class MSG2CUSTARTPRINTJOB extends Message

  constructor: () ->
    @job_id = 0
    @customer_id = 0
    @print_date = 0
    @date_ahead = 0
    @weightmode = 0
    @print_offset = 0
    @imageid = 1
    @print_endorsement = 0
    @endorsement_id = 0

    @endorsement_text = ""

    @endorsement2_text = ""
    @advert = new Buffer

    @town_circle_id = 0
    @town_circle = ""

    @customer_number = ""

    @imprint_channel_ip = ""
    @imprint_channel_port = 0

    @setMessageInterface Message.INTERFACE_DI
    @setMessageType Message.TYPE_BBS_START_PRINTJOB

  setJobId: (val) ->
    @job_id = val
  setCustomerId: (val) ->
    @customer_id = val
  setPrintDate: (val) ->
    @print_date = val
  setDateAhead: (val) ->
    @date_ahead = val
  setWeightMode: (val) ->
    @weightmode = val
  setPrintOffset: (val) ->
    @print_offset = val
  setImageId: (val) ->
    @imageid = val
  setPrintEndorsement: (val) ->
    @print_endorsement = val
  setEndorsementID: (val) ->
    @endorsement_id = val
  setEndorsementText1: (val) ->
    @endorsement_text = val
  setEndorsementText2: (val) ->
    @endorsement2_text = val
  setAdvert: (val) ->
    @advert = val
  setTownCircleID: (val) ->
    @town_circle_id = val
  setTownCircle: (val) ->
    @town_circle = val
  setCustomerNumber: (val) ->
    @customer_number = val
  setImprintChannelIP: (val) ->
    @imprint_channel_ip = val
  setImprintChannelPort: (val) ->
    @imprint_channel_port = val

  readApplictiondata: (data) ->
    data.position = 0
    @size = data.readShort()

  setApplictiondata: (data) ->
    @app_data.position = 0
    @app_data.writeUInt @job_id
    @app_data.writeUInt @customer_id # fp customer id
    @app_data.writeByte @print_date # 0 no date, 1 print date
    @app_data.writeUInt @date_ahead
    @app_data.writeByte @weightmode # 0 static, 1 first, 2 every, 3 none
    @app_data.writeUInt @print_offset # offset in mm
    @app_data.writeUInt @imageid # offset in mm

    @app_data.writeByte @print_endorsement
    @app_data.writeUInt @endorsement_id
    @app_data.writeUInt @endorsement_text.length
    @app_data.writeMultiByte @endorsement_text, "iso-8859-1"
    @app_data.writeUInt @endorsement2_text.length
    @app_data.writeMultiByte @endorsement2_text, "iso-8859-1"

    @app_data.writeUInt @advert_size
    if @advert_size>0
      console.warn('advert_size > 0', 'advert not implemented yet')

    @app_data.writeUInt @town_circle_id
    @app_data.writeUInt @town_circle.length
    @app_data.writeMultiByte @town_circle, "iso-8859-1"

    @app_data.writeUInt @customer_number.length
    @app_data.writeMultiByte @customer_number, "iso-8859-1"

    @app_data.writeUInt @imprint_channel_ip.length
    @app_data.writeMultiByte @imprint_channel_ip, "iso-8859-1"

    @app_data.writeUInt @imprint_channel_port
