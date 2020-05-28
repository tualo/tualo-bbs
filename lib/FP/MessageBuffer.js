(function() {
  Buffer.prototype.position = 0;

  Buffer.prototype.readDate = function() {
    var d;
    d = new Date();
    d.setSeconds(this.readInt8(0)); //0
    d.setMinutes(this.readInt8(1)); // 1
    d.setHours(this.readInt8(2)); // 2
    d.setDate(this.readInt8(3)); // 3
    //@readByte() # 4
    d.setMonth(this.readInt8(5) - 1); // 5
    d.setFullYear(this.readUInt16BE(6)); // 6
    return d;
  };

  Buffer.prototype.writeDate = function(d) {
    this.writeInt8(d.getSeconds(), 0);
    this.writeInt8(d.getMinutes(), 1);
    this.writeInt8(d.getHours(), 2);
    this.writeInt8(d.getDate(), 3);
    this.writeInt8(d.getDay(), 4);
    this.writeInt8(d.getMonth() + 1, 5);
    return this.writeUInt16BE(d.getFullYear(), 6);
  };

  Buffer.prototype.writeMultiByte = function(txt, type) {
    var val;
    if (type === 'iso-8859-1') {
      type = 'ascii';
    }
    val = this.write(txt, this.position, type);
    this.position += txt.length;
    return val;
  };

  Buffer.prototype.readMultiByte = function(length, type) {
    var val;
    val = this.toString('ascii', this.position, this.position + length);
    this.position += length;
    return val;
  };

}).call(this);
