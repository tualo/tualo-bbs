(function() {
  var MSG2CUGETSTATUSLIGHT, Message,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Message = require('./Message');

  module.exports = MSG2CUGETSTATUSLIGHT = (function(superClass) {
    extend(MSG2CUGETSTATUSLIGHT, superClass);

    function MSG2CUGETSTATUSLIGHT() {
      this.setMessageInterface(Message.INTERFACE_DI);
      this.setMessageType(Message.TYPE_BBS_GET_STATUS_LIGHT);
    }

    return MSG2CUGETSTATUSLIGHT;

  })(Message);

}).call(this);
