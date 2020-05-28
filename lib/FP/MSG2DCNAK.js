(function() {
  var MSG2DCNAK, Message;

  Message = require('./Message');

  module.exports = MSG2DCNAK = class MSG2DCNAK extends Message {
    constructor() {
      super();
      this.serviceID = 0;
      this.errorCode = 0;
      this.info = "";
      this.setMessageInterface(Message.INTERFACE_DI);
      this.setMessageType(Message.TYPE_NAK);
    }

    setServiceID(id) {
      return this.serviceID = id;
    }

    setErrorCode(code) {
      return this.errorCode = code;
    }

    setInfo(txt_info) {
      return this.info = txt_info;
    }

    setApplictiondata() {
      this.app_data = new Buffer(6 + info.length);
      this.app_data.writeUInt16BE(this.serviceID, 0);
      this.app_data.writeUInt16BE(errorCode, 2);
      this.app_data.writeUInt16BE(info.length, 4);
      return this.app_data.write(info, 8, "ascii");
    }

    readApplictiondata(data) {
      var infoLength;
      data.position = 0;
      this.serviceID = data.readUInt16BE(0);
      this.errorCode = data.readUInt16BE(2);
      this.addLength = data.readUInt16BE(4);
      if (process.env.DEBUG_BBS_MSG === '1') {
        console.warn("Error Service: ", this.serviceID.toString(16));
        console.warn("Error Code: ", this.errorCode.toString(16));
        console.warn("Error addLength: ", this.addLength);
        console.warn("Error DATA: ", data);
      }
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
      if (process.env.DEBUG_BBS_MSG === '1') {
        return console.warn(this.info);
      }
    }

  };

}).call(this);
