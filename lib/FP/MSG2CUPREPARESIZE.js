(function() {
  var MSG2CUPREPARESIZE, Message,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Message = require('./Message');

  module.exports = MSG2CUPREPARESIZE = (function(superClass) {
    extend(MSG2CUPREPARESIZE, superClass);

    function MSG2CUPREPARESIZE() {
      this.size = 0;
      this.setMessageInterface(Message.INTERFACE_UN);
      this.setMessageType(Message.TYPE_PREPARE_SIZE);
    }

    MSG2CUPREPARESIZE.prototype.setSize = function(val) {
      return this.size = val;
    };

    MSG2CUPREPARESIZE.prototype.readApplictiondata = function(data) {
      data.position = 0;
      return this.size = data.readUInt16BE();
    };

    MSG2CUPREPARESIZE.prototype.setApplictiondata = function(data) {
      var position;
      position = 0;
      this.app_data = new Buffer(2);
      return this.app_data.writeUInt16BE(this.size, position);
    };

    MSG2CUPREPARESIZE.prototype.getBuffer = function() {
      var buf;
      this.setApplictiondata();
      buf = new Buffer(10);
      buf.writeUInt16BE(this.interface_of_message, 0);
      buf.writeUInt16BE(this.type_of_message, 2);
      buf.writeUInt32BE(0x00010000, 4);
      this.app_data.copy(buf, 8);
      return buf;
    };

    return MSG2CUPREPARESIZE;

  })(Message);

}).call(this);
