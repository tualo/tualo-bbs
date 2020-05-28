(function() {
  var MSG2HSNEXTIMPRINT, Message;

  Message = require('./Message');

  module.exports = MSG2HSNEXTIMPRINT = class MSG2HSNEXTIMPRINT extends Message {
    constructor() {
      super();
      this.type = 'MSG2HSNEXTIMPRINT';
      this.bbs_version = process.env.BBS_VERSION || 2;
      this.bbs_version = parseInt(this.bbs_version);
      this.job_id = 0;
      this.customer_id = 0;
      this.machine_no = 0;
      this.imprint_no = 0;
      this.creationDate = new Date();
      this.printedDate = new Date();
      this.endorsement_id = 0;
      this.town_circle_id = 0;
      this.mail_length = 0;
      this.mail_height = 0;
      this.mail_thickness = 0;
      this.mail_weight = 0;
      this.setMessageInterface(Message.INTERFACE_DI);
      this.setMessageType(Message.TYPE_BBS_NEXT_IMPRINT);
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

    setMachineNo(val) {
      return this.machine_no = val;
    }

    setImprintNo(val) {
      return this.imprint_no = val;
    }

    setCreationDate(val) {
      return this.creationDate = val;
    }

    setPrintedDate(val) {
      return this.printedDate = val;
    }

    setEndorsementId(val) {
      return this.endorsement_id = val;
    }

    setTownCircleID(val) {
      return this.town_circle_id = val;
    }

    setMailLength(val) {
      return this.mail_length = val;
    }

    setMailHeight(val) {
      return this.mail_height = val;
    }

    setMailThickness(val) {
      return this.mail_thickness = val;
    }

    setMailWeight(val) {
      return this.mail_weight = val;
    }

    readApplictiondata(data) {
      var position;
      if (data.length < 10) {
        return;
      }
      position = -4;
      this.job_id = data.readUInt32BE(position += 4);
      this.customer_id = data.readUInt32BE(position += 4);
      this.machine_no = data.readUInt32BE(position += 4);
      this.high_imprint_no = data.readUInt32BE(position += 4);
      this.low_imprint_no = data.readUInt32BE(position += 4);
      this.imprint_no = (this.high_imprint_no >> 32) + this.low_imprint_no;
      this.creationDate = data.slice(position, position + 8).readDate();
      position += 8;
      this.printedDate = data.slice(position, position + 8).readDate();
      position += 8;
      this.endorsement_id = data.readUInt32BE(position += 4);
      if (this.bbs_version === 2) {
        this.town_circle_id = data.readUInt32BE(position += 4);
      }
      this.mail_length = data.readInt32BE(position += 4);
      this.mail_height = data.readInt32BE(position += 4);
      this.mail_thickness = data.readInt32BE(position += 4);
      this.mail_weight = data.readInt32BE(position += 4);
      return this.app_data = data;
    }

    setApplictiondata() {
      var data, position;
      data = new Buffer(60);
      position = 0;
      data.writeUInt32BE(this.job_id, position);
      position += 4;
      data.writeUInt32BE(this.customer_id, position);
      position += 4;
      data.writeUInt32BE(this.machine_no, position);
      position += 4;
      data.writeUInt32BE(0, position); // @high_imprint_no
      position += 4;
      data.writeUInt32BE(this.imprint_no, position); // @low_imprint_no
      position += 4;
      this.creationDate = new Buffer(8);
      position += 8;
      this.printedDate = new Buffer(8);
      position += 8;
      data.writeUInt32BE(this.endorsement_id, position);
      position += 4;
      if (this.bbs_version === 2) {
        data.writeUInt32BE(this.town_circle_id, position);
        position += 4;
      }
      data.writeUInt32BE(this.mail_length, position);
      position += 4;
      data.writeUInt32BE(this.mail_height, position);
      position += 4;
      data.writeUInt32BE(this.mail_thickness, position);
      position += 4;
      data.writeUInt32BE(this.mail_weight, position);
      position += 4;
      return this.app_data = data;
    }

  };

}).call(this);
