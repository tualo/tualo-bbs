(function() {
  var Command, ExtractLog, app, bbs, fs, http, mysql, path, sss, stats;

  ({Command} = require('tualo-commander'));

  path = require('path');

  fs = require('fs');

  app = require('express')();

  http = require('http').Server(app);

  bbs = require('../main');

  mysql = require('mysql');

  sss = require('simple-stats-server');

  stats = sss();

  module.exports = ExtractLog = (function() {
    class ExtractLog extends Command {
      static help() {
        return ``;
      }

      sql(message) {
        var cp, id, me, sql;
        me = this;
        sql = `insert into bbs_data
(
  id,
  kundennummer,
  kostenstelle,
  height,
  length,
  thickness,
  weight,
  inserttime,
  job_id,
  machine_no,
  login,
  waregroup,
  addressfield
) values (
  {id},
  '{kundennummer}',
  '{kostenstelle}',
  {height},
  {length},
  {thickness},
  {weight},
  now(),
  {job_id},
  {machine_no},
  '{login}',
  '{waregroup}',
  '{addressfield}'
)
on duplicate key update
  kundennummer=values(kundennummer),
  kostenstelle=values(kostenstelle)`;
        //  height=values(height),
        //  length=values(length),
        //  thickness=values(thickness),
        //  weight=values(weight),
        //  inserttime=values(inserttime),
        //  job_id=values(job_id),
        //  machine_no=values(machine_no),
        //  login=values(login),
        //  waregroup=values(waregroup),
        //  addressfield=values(addressfield)
        me.jobj.customer_number = me.jobj.customer_number.replace(/[^0-9\|]/g, '');
        cp = me.jobj.customer_number.split('|');
        id = message.machine_no * 100000000 + message.imprint_no;
        sql = sql.replace('{id}', id);
        console.log("update sv_daten set kunde='" + me.jobj.customer_number + "' where id='" + id + "';");
        sql = sql.replace('{kundennummer}', cp[0]);
        sql = sql.replace('{kostenstelle}', cp[1].replace(',', ''));
        sql = sql.replace('{height}', message.mail_height);
        sql = sql.replace('{length}', message.mail_length);
        sql = sql.replace('{thickness}', message.mail_thickness);
        sql = sql.replace('{weight}', message.mail_weight);
        sql = sql.replace('{job_id}', message.job_id);
        sql = sql.replace('{machine_no}', message.machine_no);
        sql = sql.replace('{waregroup}', me.waregroup);
        sql = sql.replace('{addressfield}', me.addressfield);
        sql = sql.replace('{login}', 'sorter');
        return console.log(sql + ";");
      }

      action(options, args) {
        var bdata, data, fn, imprint, job, lines, obj;
        if (args.log) {
          bdata = fs.readFileSync(args.log);
          data = bdata.toString();
          lines = data.split("\n");
          imprint = false;
          job = false;
          this.customerNumber = '0|0';
          this.jobj = {
            customer_number: '0|0'
          };
          obj = {
            job_id: "",
            machine_no: 0,
            imprint_no: 0,
            mail_length: 0,
            mail_height: 0,
            mail_thickness: 0,
            mail_weight: 0
          };
          fn = function(l) {
            var key, ref, val;
            //if imprint==true
            //  console.log 'inside imprint', l
            //else
            //  console.log 'outside imprint', l
            if (imprint === true) {
//console.log('check','obj')
//for key,val in obj
              for (key in obj) {
                val = obj[key];
                //console.log('check',key,val,l.split(key+':'))
                if (l.indexOf(key + ':') >= 0) {
                  obj[key] = parseInt((l.split(key + ':'))[1]);
                }
              }
            }
            //console.log('check',obj)
            if (job === true) {
              ref = this.jobj;
              //console.log('check','obj')
              //for key,val in obj
              for (key in ref) {
                val = ref[key];
                //console.log('check',key,val,l.split(key+':'))
                if (l.indexOf(key + ':') >= 0) {
                  this.jobj[key] = (l.split(key + ':'))[1];
                }
              }
            }
            if (l.indexOf('start message MSG2CUSTARTPRINTJOB {') >= 0) {
              job = true;
            } else if (l.indexOf(' }') >= 0 && job === true && imprint !== true) {
              job = false;
            }
            if (l.indexOf('imprint message MSG2HSNEXTIMPRINT {') >= 0) {
              return imprint = true;
            } else if (l.indexOf(' }') >= 0 && imprint === true && job !== true) {
              //console.log 'go out'
              imprint = false;
              return this.sql(obj);
            }
          };
          lines.forEach(fn.bind(this));
          return process.exit();
        }
      }

    };

    ExtractLog.commandName = 'extractlog';

    ExtractLog.commandArgs = ['log'];

    ExtractLog.commandShortDescription = 'extract data from the log file';

    ExtractLog.options = [];

    return ExtractLog;

  }).call(this);

}).call(this);
