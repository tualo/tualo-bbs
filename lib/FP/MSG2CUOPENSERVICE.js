(function() {
  var MSG2CUOPENSERVICE, Message, MessageBuffer,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Message = require('./Message');

  MessageBuffer = require('./MessageBuffer');

  module.exports = MSG2CUOPENSERVICE = (function(superClass) {
    extend(MSG2CUOPENSERVICE, superClass);

    function MSG2CUOPENSERVICE() {
      this.type = 'MSG2CUOPENSERVICE';
      this.serviceID = 0;
      this.errorCode = 0;
      this.info = "";
      this.setMessageInterface(Message.INTERFACE_SO);
      this.setMessageType(Message.TYPE_OPEN_SERVICE);
    }

    MSG2CUOPENSERVICE.prototype.setServiceID = function(id) {
      return this.serviceID = id;
    };

    MSG2CUOPENSERVICE.prototype.readApplictiondata = function(data) {
      return this.serviceID = data.readUInt16BE(0);
    };

    MSG2CUOPENSERVICE.prototype.setApplictiondata = function() {
      this.app_data = new Buffer(2);
      return this.app_data.writeUInt16BE(this.serviceID, 0);
    };

    return MSG2CUOPENSERVICE;

  })(Message);

}).call(this);
