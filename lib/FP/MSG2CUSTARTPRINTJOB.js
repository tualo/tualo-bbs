(function() {
  var MSG2CUSTARTPRINTJOB, Message,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Message = require('./Message');

  module.exports = MSG2CUSTARTPRINTJOB = (function(superClass) {
    extend(MSG2CUSTARTPRINTJOB, superClass);

    function MSG2CUSTARTPRINTJOB() {
      this.job_id = 0;
      this.customer_id = 0;
      this.print_date = 0;
      this.date_ahead = 0;
      this.weightmode = 0;
      this.print_offset = 0;
      this.imageid = 1;
      this.print_endorsement = 0;
      this.endorsement_id = 0;
      this.endorsement_text = "";
      this.endorsement2_text = "";
      this.advert = new Buffer;
      this.town_circle_id = 0;
      this.town_circle = "";
      this.customer_number = "";
      this.imprint_channel_ip = "";
      this.imprint_channel_port = 0;
      this.setMessageInterface(Message.INTERFACE_DI);
      this.setMessageType(Message.TYPE_BBS_START_PRINTJOB);
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
      data.position = 0;
      return this.size = data.readShort();
    };

    MSG2CUSTARTPRINTJOB.prototype.setApplictiondata = function(data) {
      this.app_data.position = 0;
      this.app_data.writeUInt(this.job_id);
      this.app_data.writeUInt(this.customer_id);
      this.app_data.writeByte(this.print_date);
      this.app_data.writeUInt(this.date_ahead);
      this.app_data.writeByte(this.weightmode);
      this.app_data.writeUInt(this.print_offset);
      this.app_data.writeUInt(this.imageid);
      this.app_data.writeByte(this.print_endorsement);
      this.app_data.writeUInt(this.endorsement_id);
      this.app_data.writeUInt(this.endorsement_text.length);
      this.app_data.writeMultiByte(this.endorsement_text, "iso-8859-1");
      this.app_data.writeUInt(this.endorsement2_text.length);
      this.app_data.writeMultiByte(this.endorsement2_text, "iso-8859-1");
      this.app_data.writeUInt(this.advert_size);
      if (this.advert_size > 0) {
        console.warn('advert_size > 0', 'advert not implemented yet');
      }
      this.app_data.writeUInt(this.town_circle_id);
      this.app_data.writeUInt(this.town_circle.length);
      this.app_data.writeMultiByte(this.town_circle, "iso-8859-1");
      this.app_data.writeUInt(this.customer_number.length);
      this.app_data.writeMultiByte(this.customer_number, "iso-8859-1");
      this.app_data.writeUInt(this.imprint_channel_ip.length);
      this.app_data.writeMultiByte(this.imprint_channel_ip, "iso-8859-1");
      return this.app_data.writeUInt(this.imprint_channel_port);
    };

    return MSG2CUSTARTPRINTJOB;

  })(Message);

}).call(this);
