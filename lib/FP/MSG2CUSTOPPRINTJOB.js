(function() {
  var MSG2CUSTOPPRINTJOB, Message,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Message = require('./Message');

  module.exports = MSG2CUSTOPPRINTJOB = (function(superClass) {
    extend(MSG2CUSTOPPRINTJOB, superClass);

    function MSG2CUSTOPPRINTJOB() {
      this.setMessageInterface(Message.INTERFACE_DI);
      this.setMessageType(Message.TYPE_BBS_STOP_PRINT_JOB);
    }

    return MSG2CUSTOPPRINTJOB;

  })(Message);

}).call(this);
