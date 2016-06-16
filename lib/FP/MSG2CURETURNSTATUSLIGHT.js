(function() {
  var MSG2CURETURNSTATUSLIGHT, Message,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Message = require('./Message');

  module.exports = MSG2CURETURNSTATUSLIGHT = (function(superClass) {
    extend(MSG2CURETURNSTATUSLIGHT, superClass);

    function MSG2CURETURNSTATUSLIGHT() {
      this.available_scale = 0;
      this.system_uid = 0;
      this.print_job_active = 0;
      this.print_job_id = 0;
      this.setMessageInterface(Message.INTERFACE_DI);
      this.setMessageType(Message.TYPE_BBS_RETURN_STATUS_LIGHT);
    }

    MSG2CURETURNSTATUSLIGHT.prototype.setAvailableScale = function(val) {
      return this.available_scale = val;
    };

    MSG2CURETURNSTATUSLIGHT.prototype.setSystemUID = function(val) {
      return this.system_uid = val;
    };

    MSG2CURETURNSTATUSLIGHT.prototype.setPrintJobActive = function(val) {
      return this.print_job_active = val;
    };

    MSG2CURETURNSTATUSLIGHT.prototype.setPrintJobID = function(val) {
      return this.print_job_id = val;
    };

    MSG2CURETURNSTATUSLIGHT.prototype.setApplictiondata = function() {
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
    };

    MSG2CURETURNSTATUSLIGHT.prototype.readApplictiondata = function(data) {
      var position;
      position = -1;
      this.setAvailableScale(data.readUInt8(0));
      this.setSystemUID(data.readUInt32BE(1));
      this.setPrintJobActive(data.readUInt8(5));
      return this.setPrintJobID(data.readUInt32BE(6));
    };

    return MSG2CURETURNSTATUSLIGHT;

  })(Message);

}).call(this);
