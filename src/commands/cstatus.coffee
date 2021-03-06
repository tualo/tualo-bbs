{Command} = require 'tualo-commander'
path = require 'path'
fs = require 'fs'
Controller = require '../Service/Controller'
Net = require 'net'

module.exports =
class CStatus extends Command
  @commandName: 'cstatus'
  @commandArgs: ['ip']
  @commandShortDescription: 'query the machine common status'
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
      @ctrl.open()

  onReady: () ->
    console.log 'onReady'
    seq = @ctrl.getStatus()
    seq.on 'end', (message) => @onSequenceEnd(message)
    seq.run()

  onSequenceEnd: (message) ->
    console.log(message)
