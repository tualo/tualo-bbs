(function() {
  var MSG2CUGETSTATUS, Message,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Message = require('./Message');

  module.exports = MSG2CUGETSTATUS = (function(superClass) {
    extend(MSG2CUGETSTATUS, superClass);

    function MSG2CUGETSTATUS() {
      this.b_unkown = 1;
      this.statusID = 0x191b;
      this.setMessageInterface(Message.INTERFACE_DO);
      this.setMessageType(Message.TYPE_BBS_GET_STATUS);
    }

    MSG2CUGETSTATUS.prototype.setStatusID = function(id) {
      return this.statusID = id;
    };

    MSG2CUGETSTATUS.prototype.readApplictiondata = function(data) {
      var position;
      position = -1;
      this.b_unkown = data.readUInt8(position += 1);
      return this.serviceID = data.readUInt16BE(position += 2);
    };

    MSG2CUGETSTATUS.prototype.setApplictiondata = function() {
      var position;
      this.app_data = new Buffer(3);
      position = -1;
      this.app_data.writeUInt8(this.b_unkown, position += 1);
      return this.app_data.writeUInt16BE(this.statusID, position += 2);
    };

    return MSG2CUGETSTATUS;

  })(Message);

}).call(this);
