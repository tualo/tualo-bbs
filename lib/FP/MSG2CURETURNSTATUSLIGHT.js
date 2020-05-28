(function() {
  var MSG2CURETURNSTATUSLIGHT, Message;

  Message = require('./Message');

  module.exports = MSG2CURETURNSTATUSLIGHT = class MSG2CURETURNSTATUSLIGHT extends Message {
    constructor() {
      super();
      this.available_scale = 0;
      this.available_scale_text = 'unkown';
      this.system_uid = 0;
      this.print_job_active = 0;
      this.print_job_id = 0;
      this.setMessageInterface(Message.INTERFACE_DI);
      this.setMessageType(Message.TYPE_BBS_RETURN_STATUS_LIGHT);
    }

    setAvailableScale(val) {
      this.available_scale = val;
      if (this.available_scale === 0) {
        this.available_scale_text = '0: No scale';
      }
      if (this.available_scale === 1) {
        this.available_scale_text = '1: Static scale';
      }
      if (this.available_scale === 2) {
        this.available_scale_text = '2: Dynamic scale';
      }
      if (this.available_scale === 3) {
        return this.available_scale_text = '3: Static and dynamic scale';
      }
    }

    setSystemUID(val) {
      return this.system_uid = val;
    }

    setPrintJobActive(val) {
      return this.print_job_active = val;
    }

    setPrintJobID(val) {
      return this.print_job_id = val;
    }

    setApplictiondata() {
      var position;
      position = 0;
      this.app_data = new Buffer(10);
      this.app_data.writeUInt8(this.available_scale, position);
      position += 1;
      this.app_data.writeUInt32BE(this.system_uid, position);
      position += 4;
      this.app_data.writeUInt8(this.print_job_active, position);
      position += 1;
      this.app_data.writeUInt32BE(this.print_job_id, position);
      return position += 4;
    }

    readApplictiondata(data) {
      var position;
      position = -1;
      this.setAvailableScale(data.readUInt8(0));
      this.setSystemUID(data.readUInt32BE(1));
      this.setPrintJobActive(data.readUInt8(5));
      return this.setPrintJobID(data.readUInt32BE(6));
    }

  };

}).call(this);
