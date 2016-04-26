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
      data.position = 0;
      this.b_unkown = data.readByte();
      return this.serviceID = data.readShort();
    };

    MSG2CUGETSTATUS.prototype.setApplictiondata = function() {
      this.app_data = new MessageBuffer;
      this.app_data.writeByte(this.b_unkown);
      return this.app_data.writeShort(this.statusID);
    };

    return MSG2CUGETSTATUS;

  })(Message);

}).call(this);
