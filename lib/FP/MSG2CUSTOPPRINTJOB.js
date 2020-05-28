(function() {
  var MSG2CUSTOPPRINTJOB, Message;

  Message = require('./Message');

  module.exports = MSG2CUSTOPPRINTJOB = class MSG2CUSTOPPRINTJOB extends Message {
    constructor() {
      super();
      this.setMessageInterface(Message.INTERFACE_DI);
      this.setMessageType(Message.TYPE_BBS_STOP_PRINTJOB);
    }

  };

}).call(this);
