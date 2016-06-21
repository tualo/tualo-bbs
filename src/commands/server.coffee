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
              adv = ''
              #adv = '02042a3d422a7b9884329e0df9000000006a0000000000000000000000b93c00000000000000002102220100000000000000000000000000002c00000039004d00ffffffffffffffff0b0057657262756e672d3034001200f3fb07f3f12a03f6f3fbfff3fbfff3fb16f502072a3d422a7b9884c6a899bb00000000120000000000000000000000'
              #if message.advert
              #  if message.advert.length>30
              #    adv = message.advert
              #adv = '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'
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

      http.listen args.port,'0.0.0.0', () ->
        console.log('listening on *:'+ args.port)
