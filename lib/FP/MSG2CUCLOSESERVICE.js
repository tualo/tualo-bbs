(function() {
  var MSG2CUCLOSESERVICE, Message;

  Message = require('./Message');

  module.exports = MSG2CUCLOSESERVICE = class MSG2CUCLOSESERVICE extends Message {
    constructor() {
      super();
      this.serviceID = 0;
      this.errorCode = 0;
      this.info = "";
      this.setMessageInterface(Message.INTERFACE_SO);
      this.setMessageType(Message.TYPE_CLOSE_SERVICE);
    }

    setApplictiondata() {
      return this.app_data = new Buffer(0);
    }

  };

}).call(this);
