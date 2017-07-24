(function() {
  var MSG2CUSTARTPRINTJOB, Message, fs, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Message = require('./Message');

  fs = require('fs');

  path = require('path');

  module.exports = MSG2CUSTARTPRINTJOB = (function(superClass) {
    extend(MSG2CUSTARTPRINTJOB, superClass);

    function MSG2CUSTARTPRINTJOB() {
      var e, error;
      this.job_id = 1;
      this.customer_id = 1;
      this.print_date = 1;
      this.date_ahead = 0;
      this.weightmode = 2;
      this.print_offset = 78;
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
        this.advert = fs.readFileSync(path.resolve(path.join('..', 'dat', 'empty.adv')));
      } catch (error) {
        e = error;
        console.log(e);
      }
    }

    MSG2CUSTARTPRINTJOB.prototype.setJobId = function(val) {
      return this.job_id = val;
    };

    MSG2CUSTARTPRINTJOB.prototype.setCustomerId = function(val) {
      return this.customer_id = val;
    };

    MSG2CUSTARTPRINTJOB.prototype.setPrintDate = function(val) {
      return this.print_date = val;
    };

    MSG2CUSTARTPRINTJOB.prototype.setDateAhead = function(val) {
      return this.date_ahead = val;
    };

    MSG2CUSTARTPRINTJOB.prototype.setWeightMode = function(val) {
      return this.weightmode = val;
    };

    MSG2CUSTARTPRINTJOB.prototype.setPrintOffset = function(val) {
      return this.print_offset = val;
    };

    MSG2CUSTARTPRINTJOB.prototype.setImageId = function(val) {
      return this.imageid = val;
    };

    MSG2CUSTARTPRINTJOB.prototype.setPrintEndorsement = function(val) {
      return this.print_endorsement = val;
    };

    MSG2CUSTARTPRINTJOB.prototype.setEndorsementID = function(val) {
      return this.endorsement_id = val;
    };

    MSG2CUSTARTPRINTJOB.prototype.setEndorsementText1 = function(val) {
      return this.endorsement_text = val;
    };

    MSG2CUSTARTPRINTJOB.prototype.setEndorsementText2 = function(val) {
      return this.endorsement2_text = val;
    };

    MSG2CUSTARTPRINTJOB.prototype.setAdvert = function(val) {
      return this.advert = val;
    };

    MSG2CUSTARTPRINTJOB.prototype.setTownCircleID = function(val) {
      return this.town_circle_id = val;
    };

    MSG2CUSTARTPRINTJOB.prototype.setTownCircle = function(val) {
      return this.town_circle = val;
    };

    MSG2CUSTARTPRINTJOB.prototype.setCustomerNumber = function(val) {
      return this.customer_number = val;
    };

    MSG2CUSTARTPRINTJOB.prototype.setImprintChannelIP = function(val) {
      return this.imprint_channel_ip = val;
    };

    MSG2CUSTARTPRINTJOB.prototype.setImprintChannelPort = function(val) {
      return this.imprint_channel_port = val;
    };

    MSG2CUSTARTPRINTJOB.prototype.readApplictiondata = function(data) {
      var cutof, position;
      position = 0;
      if (data.length < 30) {
        return;
      }
      this.job_id = data.readUInt32BE(position);
      position += 4;
      this.customer_id = data.readUInt32BE(position);
      position += 4;
      this.print_date = data.readUInt8(position);
      position += 1;
      this.date_ahead = data.readUInt16BE(position);
      position += 2;
      this.weightmode = data.readUInt8(position);
      position += 1;
      this.print_offset = data.readUInt32BE(position);
      position += 4;
      this.imageid = data.readUInt32BE(position);
      position += 4;
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
      cutof = position;
      this.imprint_channel_ip_length = data.readUInt32BE(position);
      position += 4;
      this.imprint_channel_ip = data.slice(position, position + this.imprint_channel_ip_length).toString("ascii");
      position += this.imprint_channel_ip_length;
      this.imprint_channel_port = data.readUInt32BE(position);
      return position += 4;
    };

    MSG2CUSTARTPRINTJOB.prototype.setApplictiondata = function(data) {
      var cutof, position;
      position = 0;
      this.app_data = new Buffer(8096);
      this.app_data.writeUInt32BE(this.job_id, position);
      position += 4;
      this.app_data.writeUInt32BE(this.customer_id, position);
      position += 4;
      this.app_data.writeUInt8(this.print_date, position);
      position += 1;
      this.app_data.writeUInt16BE(this.date_ahead, position);
      position += 2;
      this.app_data.writeUInt8(this.weightmode, position);
      position += 1;
      this.app_data.writeUInt32BE(this.print_offset, position);
      position += 4;
      this.app_data.writeUInt32BE(this.imageid, position);
      position += 4;
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
      this.app_data.writeUInt32BE(this.town_circle_id, position);
      position += 4;
      this.app_data.writeUInt32BE(this.town_circle.length, position);
      position += 4;
      this.app_data.write(this.town_circle, position, "ascii");
      position += this.town_circle.length;
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
      return this.app_data;
    };

    MSG2CUSTARTPRINTJOB.prototype.check = function(buf) {
      var length, position;
      position = 0;
      console.log('check id', buf.readUInt32BE(position));
      position += 4;
      console.log('check custid', buf.readUInt32BE(position));
      position += 4;
      console.log('check printdate', buf.readUInt8(position));
      position += 1;
      console.log('check date_ahead', buf.readUInt16BE(position));
      position += 2;
      console.log('check weightmode', buf.readUInt8(position));
      position += 1;
      console.log('check offset', buf.readUInt32BE(position));
      position += 4;
      console.log('check imageid', buf.readUInt32BE(position));
      position += 4;
      console.log('check print_endorsement', buf.readUInt8(position));
      position += 1;
      console.log('check endorsement_id', buf.readUInt32BE(position));
      position += 4;
      console.log('check endorsement length', length = buf.readUInt32BE(position));
      position += 4;
      console.log('check endorsement 1:', buf.slice(position, position + length).toString('ascii'));
      position += length;
      console.log('check endorsement length', length = buf.readUInt32BE(position));
      position += 4;
      console.log('check endorsement 2:', buf.slice(position, position + length).toString('ascii'));
      position += length;
      console.log('check advert length', length = buf.readUInt32BE(position));
      position += 4;
      console.log(buf.slice(position, position + length).toString('hex'));
      position += length;
      console.log('check town_circle_id', buf.readUInt32BE(position));
      position += 4;
      console.log('check town_circle length', length = buf.readUInt32BE(position));
      position += 4;
      console.log('check town_circle 1:', buf.slice(position, position + length));
      position += length;
      console.log('check customer_number length', length = buf.readUInt32BE(position));
      position += 4;
      console.log('check customer_number:', buf.slice(position, position + length).toString('ascii'));
      position += length;
      console.log('check ip length', length = buf.readUInt32BE(position));
      position += 4;
      console.log('check ip:', buf.slice(position, position + length).toString('ascii'));
      position += length;
      console.log('check port length', length = buf.readUInt32BE(position));
      return position += 4;
    };

    return MSG2CUSTARTPRINTJOB;

  })(Message);

}).call(this);
