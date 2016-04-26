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
      this.app_data = new MessageBuffer;
      this.app_data.writeShort(this.serviceID);
      this.app_data.writeShort(errorCode);
      this.app_data.writeShort(info.length);
      return this.app_data.writeMultiByte(info, "iso-8859-1");
    };

    MSG2DCNAK.prototype.readApplictiondata = function(data) {
      var infoLength;
      data.position = 0;
      this.serviceID = data.readShort();
      this.errorCode = data.readShort();
      console.warn("Error Service: " + (this.serviceID.toString(16)));
      console.warn("Error Code: " + (this.errorCode.toString(16)));
      if (errorCode === 0) {
        console.warn("unkown error");
      } else if (errorCode === 1) {
        console.warn("received valid message but expected different one");
      } else if (errorCode === 2) {
        console.warn("no valid message");
      } else if (errorCode === 3) {
        console.warn("service opened but no valid service message");
      } else if (errorCode === 4) {
        console.warn("service unkown");
      } else if (errorCode === 5) {
        console.warn("service not opened");
      } else {
        console.warn("unkown error number");
      }
      infoLength = data.readShort();
      this.info = data.readMultiByte(infoLength, "iso-8859-1");
      return console.warn(this.info);
    };

    return MSG2DCNAK;

  })(Message);

}).call(this);
