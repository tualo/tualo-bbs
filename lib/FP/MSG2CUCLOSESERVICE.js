(function() {
  var MSG2CUCLOSESERVICE, Message,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Message = require('./Message');

  module.exports = MSG2CUCLOSESERVICE = (function(superClass) {
    extend(MSG2CUCLOSESERVICE, superClass);

    function MSG2CUCLOSESERVICE() {
      this.serviceID = 0;
      this.errorCode = 0;
      this.info = "";
      this.setMessageInterface(Message.INTERFACE_SO);
      this.setMessageType(Message.TYPE_CLOSE_SERVICE);
    }

    MSG2CUCLOSESERVICE.prototype.setApplictiondata = function() {
      return this.app_data = new MessageBuffer;
    };

    return MSG2CUCLOSESERVICE;

  })(Message);

}).call(this);
