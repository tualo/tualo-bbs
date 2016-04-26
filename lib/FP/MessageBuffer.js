(function() {
  var MessageBuffer,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  module.exports = MessageBuffer = (function(superClass) {
    extend(MessageBuffer, superClass);

    function MessageBuffer() {
      return MessageBuffer.__super__.constructor.apply(this, arguments);
    }

    MessageBuffer.prototype.position = 0;

    MessageBuffer.prototype.readDate = function() {
      var d;
      d = new Date;
      d.setSeconds(this.readByte());
      d.setMinutes(this.readByte());
      d.setHours(this.readByte());
      d.setDate(this.readByte());
      this.readByte();
      d.setMonth(this.readByte() - 1);
      d.setFullYear(this.readShort());
      return d;
    };

    MessageBuffer.prototype.writeDate = function(d) {
      this.writeByte(d.getSeconds());
      this.writeByte(d.getMinutes());
      this.writeByte(d.getHours());
      this.writeByte(d.getDate());
      this.writeByte(d.getDay());
      this.writeByte(d.getMonth() + 1);
      return this.writeShort(d.getFullYear());
    };

    MessageBuffer.prototype.readByte = function() {
      var val;
      val = data.readInt(this.position);
      this.position++;
      return val;
    };

    MessageBuffer.prototype.writeByte = function(num) {
      var val;
      val = data.writeInt(num, this.position);
      this.position++;
      return val;
    };

    MessageBuffer.prototype.readShort = function() {
      var val;
      val = data.readUInt16BE(this.position);
      this.position += 2;
      return val;
    };

    MessageBuffer.prototype.writeShort = function(num) {
      var val;
      val = data.writeUInt16BE(num, this.position);
      this.position += 2;
      return val;
    };

    MessageBuffer.prototype.readUInt = function() {
      var val;
      val = data.readUInt32BE(this.position);
      this.position += 4;
      return val;
    };

    MessageBuffer.prototype.writeUInt = function(num) {
      var val;
      val = data.writeUInt32BE(num, this.position);
      this.position += 4;
      return val;
    };

    MessageBuffer.prototype.writeMultiByte = function(txt, type) {
      var val;
      if (type === 'iso-8859-1') {
        type = 'ascii';
      }
      val = data.write(txt, this.position, type);
      this.position += txt.length;
      return val;
    };

    MessageBuffer.prototype.readMultiByte = function(length, type) {
      var val;
      val = data.toString('ascii', this.position, this.position + length);
      this.position += length;
      return val;
    };

    return MessageBuffer;

  })(Buffer);

}).call(this);
