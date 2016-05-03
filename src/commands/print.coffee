{Command} = require 'tualo-commander'
path = require 'path'
fs = require 'fs'
Imprint = require '../Service/Imprint'
Controller = require '../Service/Controller'
Net = require 'net'

module.exports =
class Print extends Command
  @commandName: 'print'
  @commandArgs: ['ip']
  @commandShortDescription: 'starts a print job on the machine'
  @options: [
  ]


  @help: () ->
    """

    """

  action: (options,args) ->
    @args=args
    if @args.ip
      @imprint  = new Imprint
      @imprint.on 'open', () => @onImprintOpen()
      @imprint.open()


  onImprintOpen: () ->
    @ctrl = new Controller
    @ctrl.setIP @args.ip
    @ctrl.on 'ready', ()=>@onReady()
    @ctrl.open()

  onReady: () ->
    seq = @ctrl.getStartPrintjob()
    seq.init()
    #seq.setJobId 1
    console.log @imprint
    seq.setImprintChannelPort 4445
    seq.setImprintChannelIP @imprint.getIP()

    seq.on 'end', (message) => @onSequenceEnd(message)
    seq.run()

  onSequenceEnd: (message) ->
    console.log(message)
