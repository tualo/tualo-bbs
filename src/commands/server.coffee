{Command} = require 'tualo-commander'
path = require 'path'
fs = require 'fs'

app = require('express')()
http = require('http').Server(app)
io = require('socket.io')(http)
bbs = require('../main')
mysql = require 'mysql'
sss = require 'simple-stats-server'
stats = sss()

module.exports =
class Server extends Command
  @commandName: 'server'
  @commandArgs: ['port','machine_ip','machine_port','hostsystem','hostdb']
  @commandShortDescription: 'running the bbs machine controll service'
  @options: []

  @help: () ->
    """

    """

  action: (options,args) ->
    if args.port
      @args = args
      #imprint = new bbs.Imprint()
      me = @
      me.waregroup = 'Standardsendungen'

      opts =
        host     : @args.hostsystem
        user     : 'sorter'
        password : 'sorter'
        database :  @args.hostdb
        connectionLimit: 100
        wait_timeout: 120
        connect_timeout: 10

      # flush table bbs_data

      @connection = mysql.createPool opts
      @connection.on 'error', (err) => @onDBError
      @startMySQL()



  startMySQL: () ->
    @startBBS()

  onDBError: (err) ->
    console.log '####################'
    console.log 'onDBError'
    console.trace err
    setTimeout process.exit, 5000


#  controller: (sequence,) ->
  startBBS: () ->
    me = @
    me.customerNumber = '|'
    me.start_without_printing = false
    me.job_id = 0
    me.addressfield = 'L'
    pool = @connection
    args = @args

    imprint=null
    if args.machine_ip!='0'
      imprint = new bbs.Imprint args.machine_ip
      imprint.open()
    else
      console.log 'does not use a machine'


    io.on 'connection', (socket) ->
      socket.on 'disconnect', () ->
        if imprint!=null
          imprint.removeAllListeners()

      if imprint!=null
        imprint.on 'acting', () ->
          # ok it's time to copy files


        imprint.on 'imprint', (message) ->
          sql = '''
          insert into bbs_data
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
            {kundennummer},
            {kostenstelle},
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
            kostenstelle=values(kostenstelle),
            height=values(height),
            length=values(length),
            thickness=values(thickness),
            weight=values(weight),
            inserttime=values(inserttime),
            job_id=values(job_id),
            machine_no=values(machine_no),
            login=values(login),
            waregroup=values(waregroup),
            addressfield=values(addressfield)
          '''
          cp = me.customerNumber.split '|'

          sql  = sql.replace('{id}',message.machine_no*100000000+message.imprint_no)
          sql  = sql.replace('{kundennummer}', cp[0])
          sql  = sql.replace('{kostenstelle}', cp[1])
          sql  = sql.replace('{height}',message.mail_height)
          sql  = sql.replace('{length}',message.mail_length)
          sql  = sql.replace('{thickness}',message.mail_thickness)
          sql  = sql.replace('{weight}',message.mail_weight)
          sql  = sql.replace('{job_id}',message.job_id)
          sql  = sql.replace('{machine_no}',message.machine_no)
          sql  = sql.replace('{waregroup}',me.waregroup)
          sql  = sql.replace('{addressfield}',me.addressfield)
          sql  = sql.replace('{login}','sorter')



          fn = (err, connection) ->
            if err
              console.log 'ERROR on MYSQL Connection'
              console.log err
              ctrl = new bbs.Controller()
              ctrl.setIP(args.machine_ip,args.machine_port)
              ctrl.on 'closed',(msg) ->
                socket.emit('closed',msg)
              ctrl.on 'ready', () ->
                seq = ctrl.getStopPrintjob()
                #seq.on 'end',() ->
                #  ctrl.client.closeEventName='expected'
                #  socket.emit('stop',{})
                #  ctrl.close()
                seq.run()

                fn = () ->
                  ctrl.client.closeEventName='expected'
                  socket.emit('stop',{})
                  console.log 'CLOSING (stop)!!!!'
                  ctrl.close()
                setTimeout fn, 2000

                fs.exists '/opt/grab/customer.txt',(exists)->
                  if exists
                    fs.writeFile '/opt/grab/customer.txt', '', (err) ->
                      if err
                        console.log err
                seq.run()

              ctrl.open()
            else
              console.log 'write db'
              connection.query sql, (err, rows, fields) ->
                console.log 'write db returned'
                if err
                  console.log err.code

                if err
                  console.log err
                  if err.code!='ER_DUP_KEY'
                    ctrl = new bbs.Controller()
                    ctrl.setIP(args.machine_ip,args.machine_port)
                    ctrl.on 'closed',(msg) ->
                      socket.emit('closed',msg)
                    ctrl.on 'ready', () ->
                      seq = ctrl.getStopPrintjob()
                      #seq.on 'end',() ->
                      #  ctrl.client.closeEventName='expected'
                      #  socket.emit('stop',{})
                      #  ctrl.close()
                      seq.run()

                      fn = () ->
                        ctrl.client.closeEventName='expected'
                        socket.emit('stop',{})
                        console.log 'CLOSING (stop)!!!!'
                        ctrl.close()
                      setTimeout fn, 2000

                      fs.exists '/opt/grab/customer.txt',(exists)->
                        if exists
                          fs.writeFile '/opt/grab/customer.txt', '', (err) ->
                            if err
                              console.log err
                      seq.run()

                    ctrl.open()
                connection.release()


          pool.getConnection fn
          socket.emit 'imprint', message



      socket.on 'service', (message) ->
        if message.type=='status'
          if message.name=='grab'
            me.checkGrabService socket, message
          if message.name=='ocrsd'
            me.checkOCRService socket, message
        if message.type=='stop'
          if message.name=='ocrsd' or message.name=='grab'
            me.statusService socket, message

      socket.on 'status', () ->
        if me.start_without_printing == true
          message =
            available_scale: 0
            system_uid: 999
            print_job_active: 1
            print_job_id: me.job_id
            interface_of_message: 9
            type_of_message: 4340

          socket.emit 'status',message
          return
        if imprint is null
          message =
            no_machine: true
            available_scale: 0
            system_uid: 999
            print_job_active: 0
            print_job_id: me.job_id
            interface_of_message: 9
            type_of_message: 4340

          socket.emit 'status',message
          return
        ctrl = new bbs.Controller()
        ctrl.setIP(args.machine_ip,args.machine_port)
        ctrl.on 'closed',(msg) ->
          socket.emit('closed',msg)
        ctrl.on 'ready',() ->
          seq = ctrl.getStatusLight()
          seq.on 'end',(message) ->
            socket.emit('status',message)
            ctrl.close()
          seq.run()
        ctrl.open()


      socket.on 'stop', () ->
        if me.start_without_printing == true
          me.start_without_printing = false
          socket.emit 'stop', {}
          return
        if imprint is null
          socket.emit 'stop', {}
          return
        ctrl = new bbs.Controller()
        ctrl.setIP(args.machine_ip,args.machine_port)
        ctrl.on 'closed',(msg) ->
          socket.emit('closed',msg)
        ctrl.on 'ready', () ->
          seq = ctrl.getStopPrintjob()
          #seq.on 'end',() ->
          #  ctrl.client.closeEventName='expected'
          #  socket.emit('stop',{})
          #  ctrl.close()
          seq.run()

          fn = () ->
            ctrl.client.closeEventName='expected'
            socket.emit('stop',{})
            console.log 'CLOSING (stop)!!!!'
            ctrl.close()
          setTimeout fn, 2000

          fs.exists '/opt/grab/customer.txt',(exists)->
            if exists
              fs.writeFile '/opt/grab/customer.txt', '', (err) ->
                if err
                  console.log err
          seq.run()

        ctrl.open()

      socket.on 'serverStatus', (message) ->
        stats.check 'memory', (obj) ->
          socket.emit 'serverStatus', obj

      socket.on 'start_without_printing', (message) ->
        me.start_without_printing = true
        me.customerNumber = message.customerNumber
        fs.exists '/opt/grab/customer.txt',(exists)->
          if exists
            fs.writeFile '/opt/grab/customer.txt', message.customerNumber, (err) ->
              if err
                console.log err
        if message.waregroup?
          me.waregroup = message.waregroup
        me.job_id = message.job_id
        socket.emit 'start_without_printing', {}

      socket.on 'start', (message) ->
        if imprint is null
          return
        _start = () ->
          ctrl = new bbs.Controller()
          ctrl.setIP(args.machine_ip,args.machine_port)
          ctrl.on 'closed',(msg) ->
            socket.emit('closed',msg)
          ctrl.on 'ready', () ->
            seq = ctrl.getStartPrintjob()
            seq.init()
            me.job_id = message.job_id
            if typeof message.addressfield=='string'
              me.addressfield = message.addressfield
            seq.setJobId(message.job_id)
            seq.setWeightMode(message.weight_mode)
            me.customerNumber = message.customerNumber
            seq.setCustomerNumber(message.customerNumber)
            fs.exists '/opt/grab/customer.txt',(exists)->
              if exists
                fs.writeFile '/opt/grab/customer.txt', message.customerNumber, (err) ->
                  if err
                    console.log err
            if message.waregroup?
              me.waregroup = message.waregroup
            seq.setPrintOffset(message.label_offset)
            seq.setDateAhead(message.date_offset)
            seq.setPrintDate(message.print_date)
            seq.setPrintEndorsement(message.print_endorsement)
            endorsement1 = ''
            if message.endorsement1
              endorsement1 = message.endorsement1
            endorsement2 = ''
            if message.endorsement2
              endorsement2 = message.endorsement2
            adv = ''
            #adv = '02042a3d422a7b9884329e0df9000000006a0000000000000000000000b93c00000000000000002102220100000000000000000000000000002c00000039004d00ffffffffffffffff0b0057657262756e672d3034001200f3fb07f3f12a03f6f3fbfff3fbfff3fb16f502072a3d422a7b9884c6a899bb00000000120000000000000000000000'
            if message.advert
              if message.advert.length>30
                adv = message.advert
            seq.setEndorsementText1(endorsement1)
            seq.setEndorsementText2(endorsement2)
            if adv.length>30
              seq.setAdvertHex adv

            seq.setImprintChannelPort(imprint.getPort())
            seq.setImprintChannelIP(imprint.getIP())

            seq.on 'end',() ->
              socket.emit('start',{})
              console.log 'CLOSING (stop)!!!!'
              ctrl.close()

            seq.run()
          ctrl.open()

        ctrl = new bbs.Controller()
        ctrl.setIP(args.machine_ip,args.machine_port)
        ctrl.on 'closed',(msg) ->
          socket.emit('closed',msg)

        ctrl.on 'ready',() ->
          seq = ctrl.getStatusLight()
          seq.on 'end',(message) ->
            socket.emit('status',message)
            ctrl.close()
            if message.print_job_active==1
              ctrl = new bbs.Controller()
              ctrl.setIP(args.machine_ip,args.machine_port)
              ctrl.on 'closed',(msg) ->
                socket.emit('closed',msg)
              ctrl.on 'ready', () ->
                seq = ctrl.getStopPrintjob()
                fn = () ->
                  socket.emit('stop',{})
                  ctrl.close()
                setTimeout fn, 2000
                fs.exists '/opt/grab/customer.txt',(exists)->
                  if exists
                    fs.writeFile '/opt/grab/customer.txt', '', (err) ->
                      if err
                        console.log err
                seq.run()
              ctrl.open()
            else
              _start()

          seq.run()
        ctrl.open()

    console.log 'args.port',args.port
    http.listen args.port, () ->

      console.log('listening on *:'+ args.port)



  startStopService: (socket,cmd)->
    spawn = require('child_process').spawn
    proc = spawn('serice', [cmd.name, cmd.type])
    proc.on 'close', (code) ->
      val =
        service: cmd.name
      socket.emit cmd.type, val

  statusService: (socket,cmd)->
    spawn = require('child_process').spawn
    ls = spawn('service', [cmd.name, 'status'])

    ls.stdout.on 'data', (data) ->
      if data.toString().indexOf('(running)')>=0
        val =
          state: 'running'
          service: cmd.name
          type: 'status'
        socket.emit 'service', val
      if data.toString().indexOf('inactive')>=0
        val =
          state: 'inactive'
          service: cmd.name
          type: 'status'
        socket.emit 'service', val

    ls.stderr.on 'data', (data) ->
      val =
        state: 'error'
        service: cmd.name
        type: 'status'
      socket.emit 'service', val
