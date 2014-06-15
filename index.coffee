calls = require('too-late')()

genUuid = ->
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace /[xy]/g, (c)->
        r = Math.random() * 16 | 0
        v = if c == 'x' then r else r & 0x3 | 0x8
        v.toString 16

module.exports = (timeout, args...)->
    socket = io args...

    socket.on 'rpc-result', (id, result, err)->
        calls.deliver id, result: result, err: err

    socket.call = (args...)->
        if args.length is 3
            [method, params, callback] = args
            throw new Error "params should be passed in the form of key:value" unless 'object' is typeof params
        if args.length is 2
            if 'function' is typeof args[1]
                [method, callback] = args
                params = {}
            else
                [method, params] = args
        if args.length is 1
            [method] = args
            params = {}
        id = genUuid()
        socket.emit 'rpc-call', id, method, params
        new Promise (resolve, reject)->
            calls.waitfor id, ({result, err})->
                if err
                    reject err
                else
                    resolve result
                callback? err, result
            .till timeout, ->
                reject 'timeout'
                callback? 'timeout'

    socket
