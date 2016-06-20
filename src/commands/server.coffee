{Command} = require 'tualo-commander'
path = require 'path'
fs = require 'fs'

app = require('express')()
http = require('http').Server(app)
io = require('socket.io')(http)
bbs = require('../main')

module.exports =
class Server extends Command
  @commandName: 'server'
  @commandArgs: ['port','machine_ip']
  @commandShortDescription: 'running the bbs machine controll service'
  @options: []

  @help: () ->
    """

    """
  resetTimeoutTimer: () ->
    @stopTimeoutTimer()
    @timeout_timer = setTimeout @close.bind(@), @timeout

  stopTimeoutTimer: () ->
    if @timeout_timer
      clearTimeout @timeout_timer
    @timeout_timer = setTimeout @close.bind(@), @timeout

  action: (options,args) ->
    if args.port

      #imprint = new bbs.Imprint()

      io.on 'connection', (socket) ->
        imprint = new bbs.Imprint args.machine_ip

        imprint.open()

        #imprint.on 'closed',()->
        #  setTimeout imprint.open, 3000
        imprint.on 'imprint', (message) ->
          socket.emit 'imprint', message

        socket.on 'status', () ->
          ctrl = new bbs.Controller()
          ctrl.setIP(args.machine_ip)
          ctrl.on 'closed',(msg) ->
            socket.emit('closed',msg)
          ctrl.on 'ready',() ->
            seq = ctrl.getStatusLight()
            seq.on 'end',(message) ->
              console.log 'sending',message
              socket.emit('status',message)
              ctrl.close()
            seq.run()
          ctrl.open()


        socket.on 'stop', () ->
          ctrl = new bbs.Controller()
          ctrl.setIP(args.machine_ip)
          ctrl.on 'closed',(msg) ->
            socket.emit('closed',msg)
          ctrl.on 'ready', () ->
            seq = ctrl.getStopPrintjob()
            fn = () ->
              ctrl.client.closeEventName='expected'
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

        socket.on 'start', (message) ->
          console.log message
          _start = () ->
            ctrl = new bbs.Controller()
            ctrl.setIP(args.machine_ip)
            ctrl.on 'closed',(msg) ->
              socket.emit('closed',msg)
            ctrl.on 'ready', () ->
              seq = ctrl.getStartPrintjob()
              seq.init()
              seq.setJobId(message.job_id)
              seq.setWeightMode(message.weight_mode)
              seq.setCustomerNumber(message.customerNumber)
              fs.exists '/opt/grab/customer.txt',(exists)->
                if exists
                  fs.writeFile '/opt/grab/customer.txt', message.customerNumber, (err) ->
                    if err
                      console.log err

              seq.setPrintOffset(message.label_offset)
              seq.setDateAhead(message.date_offset)
              seq.setPrintEndorsement(message.print_endorsement)
              endorsement1 = ''
              if message.endorsement1
                endorsement1 = message.endorsement1
              endorsement2 = ''
              if message.endorsement2
                endorsement2 = message.endorsement2
              adv = '02042a3d422a7b9884329e0df9000000006a0000000000000000000000b93c00000000000000002102220100000000000000000000000000002c00000039004d00ffffffffffffffff0b0057657262756e672d3034001200f3fb07f3f12a03f6f3fbfff3fbfff3fb16f502072a3d422a7b9884c6a899bb00000000120000000000000000000000'
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
                ctrl.close()

              seq.run()
            ctrl.open()

          console.log '---->'
          ctrl = new bbs.Controller()
          ctrl.setIP(args.machine_ip)
          ctrl.on 'closed',(msg) ->
            socket.emit('closed',msg)

          ctrl.on 'ready',() ->
            seq = ctrl.getStatusLight()
            seq.on 'end',(message) ->
              socket.emit('status',message)
              ctrl.close()

              console.log '---->', message

              if message.print_job_active==1
                ctrl = new bbs.Controller()
                ctrl.setIP(args.machine_ip)
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

      http.listen '0.0.0.0',args.port, () ->
        console.log('listening on *:'+ args.port)
