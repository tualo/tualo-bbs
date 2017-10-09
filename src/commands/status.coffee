{Command} = require 'tualo-commander'
path = require 'path'
fs = require 'fs'
Controller = require '../Service/Controller'
Net = require 'net'

module.exports =
class Status extends Command
  @commandName: 'status'
  @commandArgs: ['ip']
  @commandShortDescription: 'query the machine status'
  @options: [
  ]


  @help: () ->
    """

    """

  action: (options,args) ->

    if args.ip
      @ctrl = new Controller
      @ctrl.setPort 4444
      @ctrl.setIP args.ip
      @ctrl.on 'ready', ()=>@onReady()
      @ctrl.on 'closed', ()=>@onCtrlClosed()
      @ctrl.open()

  onCtrlClosed: () ->
    console.log 'onCtrlClosed','removeAllListeners'
    @ctrl.removeAllListeners()

  onReady: () ->
    console.log 'onReady'
    seq = @ctrl.getStatusLight()
    seq.on 'end', (message) => @onSequenceEnd(message)
    seq.run()

  onSequenceEnd: (message) ->
    console.log(message)
