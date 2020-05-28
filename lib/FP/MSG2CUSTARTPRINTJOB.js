(function() {
  var MSG2CUSTARTPRINTJOB, Message, fs, path;

  Message = require('./Message');

  fs = require('fs');

  path = require('path');

  module.exports = MSG2CUSTARTPRINTJOB = class MSG2CUSTARTPRINTJOB extends Message {
    constructor() {
      var e;
      super();
      this.bbs_version = process.env.BBS_VERSION || 2;
      this.bbs_version = parseInt(this.bbs_version);
      this.job_id = 1;
      this.customer_id = 1;
      this.print_date = 1;
      this.date_ahead = 0;
      this.weightmode = 3;
      this.print_offset = 0;
      this.imageid = 1;
      this.print_endorsement = 1;
      this.endorsement_id = 0;
      this.endorsement_text = "1223456";
      this.endorsement2_text = "Test";
      this.advert = new Buffer(0);
      this.town_circle_id = 0;
      this.town_circle = "";
      this.customer_number = "1234";
      this.imprint_channel_ip = "";
      this.imprint_channel_port = 0;
      this.setMessageInterface(Message.INTERFACE_DI);
      this.setMessageType(Message.TYPE_BBS_START_PRINTJOB);
      try {
        this.advert = fs.readFileSync(path.resolve(path.join('.', 'dat', 'empty.adv')));
      } catch (error) {
        e = error;
        console.log(e);
      }
    }

    setBBSVersion(val) {
      return this.bbs_version = val;
    }

    setJobId(val) {
      return this.job_id = val;
    }

    setCustomerId(val) {
      return this.customer_id = val;
    }

    setPrintDate(val) {
      return this.print_date = val;
    }

    setDateAhead(val) {
      return this.date_ahead = val;
    }

    setWeightMode(val) {
      return this.weightmode = val;
    }

    setPrintOffset(val) {
      return this.print_offset = val;
    }

    setImageId(val) {
      return this.imageid = val;
    }

    setPrintEndorsement(val) {
      return this.print_endorsement = val;
    }

    setEndorsementID(val) {
      return this.endorsement_id = val;
    }

    setEndorsementText1(val) {
      return this.endorsement_text = val;
    }

    setEndorsementText2(val) {
      return this.endorsement2_text = val;
    }

    setAdvert(val) {
      return this.advert = val;
    }

    setTownCircleID(val) {
      return this.town_circle_id = val;
    }

    setTownCircle(val) {
      return this.town_circle = val;
    }

    setCustomerNumber(val) {
      return this.customer_number = val;
    }

    setImprintChannelIP(val) {
      return this.imprint_channel_ip = val;
    }

    setImprintChannelPort(val) {
      return this.imprint_channel_port = val;
    }

    readApplictiondata(data) {
      var cutof, position;
      position = 0;
      if (data.length < 30) {
        return;
      }
      this.job_id = data.readUInt32BE(position);
      position += 4;
      this.customer_id = data.readUInt32BE(position); // fp customer id
      position += 4;
      this.print_date = data.readUInt8(position); // 0 no date, 1 print date
      position += 1;
      this.date_ahead = data.readUInt16BE(position);
      position += 2;
      this.weightmode = data.readUInt8(position); // 0 static, 1 first, 2 every, 3 none
      position += 1;
      this.print_offset = data.readUInt32BE(position); // offset in mm
      position += 4;
      if (this.bbs_version === 2) {
        this.imageid = data.readUInt32BE(position);
        position += 4;
      }
      this.print_endorsement = data.readUInt8(position);
      position += 1;
      this.endorsement_id = data.readUInt32BE(position);
      position += 4;
      this.endorsement_text_length = data.readUInt32BE(position);
      position += 4;
      this.endorsement_text = data.slice(position, position + this.endorsement_text_length).toString("ascii");
      position += this.endorsement_text_length;
      this.endorsement2_text_length = data.readUInt32BE(position);
      position += 4;
      this.endorsement2_text = data.slice(position, position + this.endorsement2_text_length).toString("ascii");
      position += this.endorsement2_text_length;
      this.advert_length = data.readUInt32BE(position);
      position += 4;
      this.advert = data.slice(position, position + this.advert_length);
      position += this.advert_length;
      if (this.bbs_version === 2) {
        this.town_circle_id = data.readUInt32BE(position);
        position += 4;
        this.town_circle_length = data.readUInt32BE(position);
        position += 4;
        this.town_circle = data.slice(position, position + this.town_circle_length).toString("ascii");
        position += this.town_circle_length;
        this.customer_number_length = data.readUInt32BE(position);
        position += 4;
        this.customer_number = data.slice(position, position + this.customer_number_length).toString("ascii");
        position += this.customer_number_length;
      }
      cutof = position;
      this.imprint_channel_ip_length = data.readUInt32BE(position);
      position += 4;
      this.imprint_channel_ip = data.slice(position, position + this.imprint_channel_ip_length).toString("ascii");
      position += this.imprint_channel_ip_length;
      this.imprint_channel_port = data.readUInt32BE(position);
      return position += 4;
    }

    setApplictiondata(data) {
      var cutof, position;
      position = 0;
      this.app_data = new Buffer(8096);
      this.app_data.writeUInt32BE(this.job_id, position);
      position += 4;
      this.app_data.writeUInt32BE(this.customer_id, position); // fp customer id
      position += 4;
      this.app_data.writeUInt8(this.print_date, position); // 0 no date, 1 print date
      position += 1;
      this.app_data.writeUInt16BE(this.date_ahead, position);
      position += 2;
      this.app_data.writeUInt8(this.weightmode, position); // 0 static, 1 first, 2 every, 3 none
      position += 1;
      this.app_data.writeUInt32BE(this.print_offset, position); // offset in mm
      position += 4;
      if (this.bbs_version === 2) {
        this.app_data.writeUInt32BE(this.imageid, position);
        position += 4;
      }
      this.app_data.writeUInt8(this.print_endorsement, position);
      position += 1;
      this.app_data.writeUInt32BE(this.endorsement_id, position);
      position += 4;
      this.app_data.writeUInt32BE(this.endorsement_text.length, position);
      position += 4;
      this.app_data.write(this.endorsement_text, position, "ascii");
      position += this.endorsement_text.length;
      this.app_data.writeUInt32BE(this.endorsement2_text.length, position);
      position += 4;
      this.app_data.write(this.endorsement2_text, position, "ascii");
      position += this.endorsement2_text.length;
      this.app_data.writeUInt32BE(this.advert.length, position);
      position += 4;
      this.advert.copy(this.app_data, position);
      position += this.advert.length;
      if (this.bbs_version === 2) {
        this.app_data.writeUInt32BE(this.town_circle_id, position);
        position += 4;
        this.app_data.writeUInt32BE(this.town_circle.length, position);
        position += 4;
        this.app_data.write(this.town_circle, position, "ascii");
        position += this.town_circle.length;
      }
      this.app_data.writeUInt32BE(this.customer_number.length, position);
      position += 4;
      this.app_data.write(this.customer_number, position, "ascii");
      position += this.customer_number.length;
      cutof = position;
      this.app_data.writeUInt32BE(this.imprint_channel_ip.length, position);
      position += 4;
      this.app_data.write(this.imprint_channel_ip, position, "ascii");
      position += this.imprint_channel_ip.length;
      this.app_data.writeUInt32BE(this.imprint_channel_port, position);
      position += 4;
      this.app_data = this.app_data.slice(0, position);
      //console.log 'data',JSON.stringify( @app_data, null, 2)
      //@check @app_data
      // process.exit()
      //    console.log 'app_data', @app_data.toString('hex')
      return this.app_data;
    }

    check(buf) {
      var length, position;
      position = 0;
      if (process.env.DEBUG_BBS_MSG === '1') {
        console.log('check id', buf.readUInt32BE(position));
      }
      position += 4;
      if (process.env.DEBUG_BBS_MSG === '1') {
        console.log('check custid', buf.readUInt32BE(position));
      }
      position += 4;
      if (process.env.DEBUG_BBS_MSG === '1') {
        console.log('check printdate', buf.readUInt8(position));
      }
      position += 1;
      if (process.env.DEBUG_BBS_MSG === '1') {
        console.log('check date_ahead', buf.readUInt16BE(position));
      }
      position += 2;
      if (process.env.DEBUG_BBS_MSG === '1') {
        console.log('check weightmode', buf.readUInt8(position));
      }
      position += 1;
      if (process.env.DEBUG_BBS_MSG === '1') {
        console.log('check offset', buf.readUInt32BE(position));
      }
      position += 4;
      if (process.env.DEBUG_BBS_MSG === '1') {
        console.log('check imageid', buf.readUInt32BE(position));
      }
      position += 4;
      if (process.env.DEBUG_BBS_MSG === '1') {
        console.log('check print_endorsement', buf.readUInt8(position));
      }
      position += 1;
      if (process.env.DEBUG_BBS_MSG === '1') {
        console.log('check endorsement_id', buf.readUInt32BE(position));
      }
      position += 4;
      if (process.env.DEBUG_BBS_MSG === '1') {
        console.log('check endorsement length', length = buf.readUInt32BE(position));
      }
      position += 4;
      if (process.env.DEBUG_BBS_MSG === '1') {
        console.log('check endorsement 1:', buf.slice(position, position + length).toString('ascii'));
      }
      position += length;
      if (process.env.DEBUG_BBS_MSG === '1') {
        console.log('check endorsement length', length = buf.readUInt32BE(position));
      }
      position += 4;
      if (process.env.DEBUG_BBS_MSG === '1') {
        console.log('check endorsement 2:', buf.slice(position, position + length).toString('ascii'));
      }
      position += length;
      if (process.env.DEBUG_BBS_MSG === '1') {
        console.log('check advert length', length = buf.readUInt32BE(position));
      }
      position += 4;
      if (process.env.DEBUG_BBS_MSG === '1') {
        console.log(buf.slice(position, position + length).toString('hex'));
      }
      position += length;
      if (process.env.DEBUG_BBS_MSG === '1') {
        console.log('check town_circle_id', buf.readUInt32BE(position));
      }
      position += 4;
      if (process.env.DEBUG_BBS_MSG === '1') {
        console.log('check town_circle length', length = buf.readUInt32BE(position));
      }
      position += 4;
      if (process.env.DEBUG_BBS_MSG === '1') {
        console.log('check town_circle 1:', buf.slice(position, position + length)); //.toString('ascii')
      }
      position += length;
      if (process.env.DEBUG_BBS_MSG === '1') {
        console.log('check customer_number length', length = buf.readUInt32BE(position));
      }
      position += 4;
      if (process.env.DEBUG_BBS_MSG === '1') {
        console.log('check customer_number:', buf.slice(position, position + length).toString('ascii'));
      }
      position += length;
      if (process.env.DEBUG_BBS_MSG === '1') {
        console.log('check ip length', length = buf.readUInt32BE(position));
      }
      position += 4;
      if (process.env.DEBUG_BBS_MSG === '1') {
        console.log('check ip:', buf.slice(position, position + length).toString('ascii'));
      }
      position += length;
      if (process.env.DEBUG_BBS_MSG === '1') {
        console.log('check port length', length = buf.readUInt32BE(position));
      }
      return position += 4;
    }

  };

}).call(this);
