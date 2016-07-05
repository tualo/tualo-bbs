Message = require './Message'
fs = require 'fs'
path = require 'path'

module.exports =
class MSG2CUSTARTPRINTJOB extends Message

  constructor: () ->
    @job_id = 1
    @customer_id = 1
    @print_date = 1
    @date_ahead = 0
    @weightmode = 2
    @print_offset = 78
    @imageid = 1
    @print_endorsement = 1
    @endorsement_id = 0

    @endorsement_text = "1223456"

    @endorsement2_text = "Test"
    @advert = new Buffer 0

    @town_circle_id = 0
    @town_circle = ""

    @customer_number = "1234"

    @imprint_channel_ip = ""
    @imprint_channel_port = 0

    @setMessageInterface Message.INTERFACE_DI
    @setMessageType Message.TYPE_BBS_START_PRINTJOB

    try
      @advert = fs.readFileSync path.resolve(path.join( 'dat','empty.adv'))
    catch e
      console.log e


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
    position = 0
    if data.length < 30
      return
    @job_id = data.readUInt32BE position
    position+=4
    @customer_id = data.readUInt32BE position # fp customer id
    position+=4
    @print_date = data.readUInt8 position # 0 no date, 1 print date
    position+=1
    @date_ahead = data.readUInt16BE position
    position+=2
    @weightmode = data.readUInt8 position # 0 static, 1 first, 2 every, 3 none
    position+=1
    @print_offset = data.readUInt32BE position # offset in mm
    position+=4
    @imageid = data.readUInt32BE position
    position+=4
    @print_endorsement = data.readUInt8 position
    position+=1
    @endorsement_id = data.readUInt32BE position
    position+=4
    @endorsement_text_length = data.readUInt32BE position
    position+=4
    @endorsement_text = data.slice(position,position+@endorsement_text_length).toString( "ascii")
    position+=@endorsement_text_length
    @endorsement2_text_length = data.readUInt32BE position
    position+=4

    @endorsement2_text = data.slice(position,position+@endorsement2_text_length).toString( "ascii" )
    position+=@endorsement2_text_length

    @advert_length = data.readUInt32BE position
    position+=4
    @advert = data.slice position, position+ @advert_length
    position+=@advert_length

    @town_circle_id = data.readUInt32BE  position
    position+=4
    @town_circle_length = data.readUInt32BE position
    position+=4
    @town_circle = data.slice(position,position + @town_circle_length).toString("ascii")

    position+=@town_circle_length
    @customer_number_length = data.readUInt32BE  position
    position+=4
    @customer_number = data.slice(position, position+@customer_number_length).toString("ascii")
    position+=@customer_number_length

    cutof = position
    @imprint_channel_ip_length = data.readUInt32BE position
    position+=4

    @imprint_channel_ip = data.slice(position, position+@imprint_channel_ip_length).toString("ascii")
    position+=@imprint_channel_ip_length
    @imprint_channel_port = data.readUInt32BE position
    position+=4


  setApplictiondata: (data) ->
    position = 0
    @app_data = new Buffer 8096
    @app_data.writeUInt32BE @job_id, position
    position+=4

    @app_data.writeUInt32BE @customer_id, position # fp customer id
    position+=4
    @app_data.writeUInt8 @print_date, position # 0 no date, 1 print date
    position+=1
    @app_data.writeUInt16BE @date_ahead, position
    position+=2
    @app_data.writeUInt8 @weightmode, position # 0 static, 1 first, 2 every, 3 none
    position+=1
    @app_data.writeUInt32BE @print_offset, position # offset in mm
    position+=4
    @app_data.writeUInt32BE @imageid, position
    position+=4
    @app_data.writeUInt8 @print_endorsement, position
    position+=1
    @app_data.writeUInt32BE @endorsement_id, position
    position+=4
    @app_data.writeUInt32BE @endorsement_text.length, position
    position+=4
    @app_data.write @endorsement_text,position, "ascii"
    position+=@endorsement_text.length
    @app_data.writeUInt32BE @endorsement2_text.length, position
    position+=4

    @app_data.write @endorsement2_text,position, "ascii"
    position+=@endorsement2_text.length

    @app_data.writeUInt32BE @advert.length, position
    position+=4
    @advert.copy @app_data, position
    position+=@advert.length

    @app_data.writeUInt32BE @town_circle_id, position
    position+=4
    @app_data.writeUInt32BE @town_circle.length, position
    position+=4
    @app_data.write @town_circle,position, "ascii"
    position+=@town_circle.length
    @app_data.writeUInt32BE @customer_number.length, position
    position+=4
    @app_data.write @customer_number,position, "ascii"
    position+=@customer_number.length

    cutof = position
    @app_data.writeUInt32BE @imprint_channel_ip.length, position
    position+=4

    @app_data.write @imprint_channel_ip,position, "ascii"
    position+=@imprint_channel_ip.length

    @app_data.writeUInt32BE @imprint_channel_port, position
    position+=4

    @app_data = @app_data.slice 0, position
    #console.log 'data',JSON.stringify( @app_data, null, 2)
    #@check @app_data
    # process.exit()
    #    console.log 'app_data', @app_data.toString('hex')
    @app_data
  check: (buf) ->
    position = 0
    console.log 'check id', buf.readUInt32BE position
    position+=4
    console.log 'check custid', buf.readUInt32BE position
    position+=4
    console.log 'check printdate', buf.readUInt8 position
    position+=1
    console.log 'check date_ahead', buf.readUInt16BE position
    position+=2
    console.log 'check weightmode', buf.readUInt8 position
    position+=1
    console.log 'check offset', buf.readUInt32BE position
    position+=4
    console.log 'check imageid', buf.readUInt32BE position
    position+=4
    console.log 'check print_endorsement', buf.readUInt8 position
    position+=1
    console.log 'check endorsement_id', buf.readUInt32BE position
    position+=4
    console.log 'check endorsement length', length = buf.readUInt32BE position
    position+=4
    console.log 'check endorsement 1:', buf.slice(position,position+length).toString('ascii')
    position+=length
    console.log 'check endorsement length', length = buf.readUInt32BE position
    position+=4
    console.log 'check endorsement 2:', buf.slice(position,position+length).toString('ascii')
    position+=length
    console.log 'check advert length', length = buf.readUInt32BE position
    position+=4
    console.log buf.slice(position,position+length).toString('hex')
    position+=length

    console.log 'check town_circle_id', buf.readUInt32BE position
    position+=4
    console.log 'check town_circle length', length = buf.readUInt32BE position
    position+=4
    console.log 'check town_circle 1:', buf.slice(position,position+length)#.toString('ascii')
    position+=length

    console.log 'check customer_number length', length = buf.readUInt32BE position
    position+=4
    console.log 'check customer_number:', buf.slice(position,position+length).toString('ascii')
    position+=length

    console.log 'check ip length', length = buf.readUInt32BE position
    position+=4
    console.log 'check ip:', buf.slice(position,position+length).toString('ascii')
    position+=length

    console.log 'check port length', length = buf.readUInt32BE position
    position+=4
