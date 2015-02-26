// Generated by CoffeeScript 1.9.1
(function() {
  var calls, genUuid,
    slice = [].slice;

  calls = require('too-late')();

  genUuid = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r, v;
      r = Math.random() * 16 | 0;
      v = c === 'x' ? r : r & 0x3 | 0x8;
      return v.toString(16);
    });
  };

  module.exports = function() {
    var args, socket, timeout;
    timeout = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    socket = io.apply(null, args);
    socket.on('rpc-result', function(id, result, err) {
      return calls.deliver(id, {
        result: result,
        err: err
      });
    });
    socket.call = function() {
      var args, callback, id, method, params;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      if (args.length === 3) {
        method = args[0], params = args[1], callback = args[2];
        if ('object' !== typeof params) {
          throw new Error("params should be passed in the form of key:value");
        }
      }
      if (args.length === 2) {
        if ('function' === typeof args[1]) {
          method = args[0], callback = args[1];
          params = {};
        } else {
          method = args[0], params = args[1];
        }
      }
      if (args.length === 1) {
        method = args[0];
        params = {};
      }
      id = genUuid();
      socket.emit('rpc-call', id, method, params);
      return new Promise(function(resolve, reject) {
        return calls.waitfor(id, function(arg) {
          var err, result;
          result = arg.result, err = arg.err;
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
          return typeof callback === "function" ? callback(err, result) : void 0;
        }).till(timeout, function() {
          reject('timeout');
          return typeof callback === "function" ? callback('timeout') : void 0;
        });
      });
    };
    return socket;
  };

}).call(this);
