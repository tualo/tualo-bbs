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
      @ctrl.setIP args.ip
      @ctrl.on 'ready', ()=>@onReady()
      @ctrl.open()

  onReady: () ->

    seq = @ctrl.getStatusLight()
    seq.on 'end', (message) => @onSequenceEnd(message)
    seq.run()

  onSequenceEnd: (message) ->
    console.log(message)
