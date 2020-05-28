(function() {
  var MSG2CUGETSTATUSLIGHT, Message;

  Message = require('./Message');

  module.exports = MSG2CUGETSTATUSLIGHT = class MSG2CUGETSTATUSLIGHT extends Message {
    constructor() {
      super();
      this.setMessageInterface(Message.INTERFACE_DI);
      this.setMessageType(Message.TYPE_BBS_GET_STATUS_LIGHT);
    }

  };

}).call(this);
