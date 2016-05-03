(function() {
  var MSG2DCNAK, Message,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Message = require('./Message');

  module.exports = MSG2DCNAK = (function(superClass) {
    extend(MSG2DCNAK, superClass);

    function MSG2DCNAK() {
      this.serviceID = 0;
      this.errorCode = 0;
      this.info = "";
      this.setMessageInterface(Message.INTERFACE_DI);
      this.setMessageType(Message.TYPE_NAK);
    }

    MSG2DCNAK.prototype.setServiceID = function(id) {
      return this.serviceID = id;
    };

    MSG2DCNAK.prototype.setErrorCode = function(code) {
      return this.errorCode = code;
    };

    MSG2DCNAK.prototype.setInfo = function(txt_info) {
      return this.info = txt_info;
    };

    MSG2DCNAK.prototype.setApplictiondata = function() {
      this.app_data = new Buffer(6 + info.length);
      this.app_data.writeUInt16BE(this.serviceID, 0);
      this.app_data.writeUInt16BE(errorCode, 2);
      this.app_data.writeUInt16BE(info.length, 4);
      return this.app_data.write(info, 8, "ascii");
    };

    MSG2DCNAK.prototype.readApplictiondata = function(data) {
      var infoLength;
      data.position = 0;
      this.serviceID = data.readUInt16BE(0);
      this.errorCode = data.readUInt16BE(2);
      console.warn("Error Service: " + (this.serviceID.toString(16)));
      console.warn("Error Code: " + (this.errorCode.toString(16)));
      if (this.errorCode === 0) {
        console.warn("unkown error");
      } else if (this.errorCode === 1) {
        console.warn("received valid message but expected different one");
      } else if (this.errorCode === 2) {
        console.warn("no valid message");
      } else if (this.errorCode === 3) {
        console.warn("service opened but no valid service message");
      } else if (this.errorCode === 4) {
        console.warn("service unkown");
      } else if (this.errorCode === 5) {
        console.warn("service not opened");
      } else {
        console.warn("unkown error number");
      }
      infoLength = data.readUInt16BE(4);
      this.info = data.toString('ascii', 8, 8 + infoLength);
      return console.warn(this.info);
    };

    return MSG2DCNAK;

  })(Message);

}).call(this);
