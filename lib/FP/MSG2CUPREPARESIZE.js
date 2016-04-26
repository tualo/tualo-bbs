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
      return this.size = data.readShort();
    };

    MSG2CUPREPARESIZE.prototype.setApplictiondata = function(data) {
      this.app_data.position = 0;
      return this.app_data.writeShort(this.size);
    };

    return MSG2CUPREPARESIZE;

  })(Message);

}).call(this);
