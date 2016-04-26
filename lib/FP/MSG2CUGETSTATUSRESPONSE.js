(function() {
  var MSG2CUGETSTATUSRESPONSE, Message,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Message = require('./Message');

  module.exports = MSG2CUGETSTATUSRESPONSE = (function(superClass) {
    extend(MSG2CUGETSTATUSRESPONSE, superClass);

    function MSG2CUGETSTATUSRESPONSE() {
      this.b_unkown = 1;
      this.statusID = 0x191b;
      this.version = new Buffer;
      this.setMessageInterface(Message.INTERFACE_DO);
      this.setMessageType(Message.TYPE_BBS_GET_STATUS_RESPONSE);
    }

    MSG2CUGETSTATUSRESPONSE.prototype.setStatusID = function(id) {
      return this.statusID = id;
    };

    MSG2CUGETSTATUSRESPONSE.prototype.readApplictiondata = function(data) {
      data.position = 0;
      this.b_unkown = data.readByte();
      this.serviceID = data.readShort();
      this.version_length = data.readUnsignedInt();
      return this.version = data.slice(data.position);
    };

    MSG2CUGETSTATUSRESPONSE.prototype.setApplictiondata = function() {
      this.app_data = new MessageBuffer;
      this.app_data.writeByte(this.b_unkown);
      this.app_data.writeShort(this.statusID);
      this.app_data.writeUnsignedInt(version.length);
      return this.app_data.writeBytes(version);
    };

    return MSG2CUGETSTATUSRESPONSE;

  })(Message);

}).call(this);
