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
      this.version = new Buffer(0);
      this.setMessageInterface(Message.INTERFACE_DO);
      this.setMessageType(Message.TYPE_BBS_GET_STATUS_RESPONSE);
    }

    MSG2CUGETSTATUSRESPONSE.prototype.setStatusID = function(id) {
      return this.statusID = id;
    };

    MSG2CUGETSTATUSRESPONSE.prototype.readApplictiondata = function(data) {
      var position;
      position = -1;
      this.b_unkown = data.readUInt8(position += 1);
      this.serviceID = data.readUInt16BE(position += 2);
      this.version_length = data.readUInt32BE(position += 4);
      return this.version = data.slice(position);
    };

    MSG2CUGETSTATUSRESPONSE.prototype.setApplictiondata = function() {
      var position;
      this.app_data = new Buffer(7 + version.length);
      position = -1;
      this.app_data.writeUInt8(this.b_unkown, position += 1);
      this.app_data.writeUInt16BE(this.statusID, position += 2);
      this.app_data.writeUInt32BE(version.length, position += 4);
      return version.copy(this.app_data, position);
    };

    return MSG2CUGETSTATUSRESPONSE;

  })(Message);

}).call(this);
