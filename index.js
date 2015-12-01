var upb = require("upb");

var command = {
  network: 1,                 // Required - Set Network ID. Use 0 for the global network (controls all devices)
  id: 12,                     // Required - Set link or device ID
  type: "device",             // Required - Set whether to control a link or device
  source: 255,                // Optional - Set PIM source ID. Defaults to 255, which is almost always fine.
  cmd: "goto",                // Required - Set the command to send. You may also use the command numbers associated with those commands.
  level: 75,                  // Optional - Set the level (percent). Accepts values 0 through 100. Required with goto and fade start. Only applies to goto, fadeStart, fadeStop, and toggle. Otherwise this will be ignored.
  rate: 3,                    // Optional - Set the fade rate (seconds). Use false for instant on. Only applies to goto, fadeStart, and toggle. Otherwise  this will be ignored. Defaults to device settings.
  channel: false,             // Optional - Set the channel to use. Use false for default. Only applies to goto, fadeStart, blink, and toggle. Otherwise this will be ignored. Only works on some devices. Defaults to off (command not sent).
  sendx: 2,                   // Optional - Set the number of times to send the command. Accepts numbers 1 through 4. Defaults to 1.
  sendTime: 1,                // Optional - Send the number of time this command is sent out of the total (sendx). NOTE: THE PIM WILL AUTOMATICALLY SEND THE CORRECT NUMBER OF COMMANDS! So, this is only useful for displaying commands and not sending them. Accepts numbers 1 through 4. Cannot be greater than sendx. Defaults to 1.
  ackPulse: false,            // Optional - Request an acknowledge pulse. Defaults to false.
  idPulse: false,             // Optional - Request an ID pulse. Defaults to false.
  ackMsg: true,               // Optional - Request an acknowledge message. Defaults to false.
  powerlineRepeater: false,   // Optional - Request for the command to go through a powerline repeater. Set or numbers 1, 2, 4, or false. Defaults to false.
  blinkRate: 255,             // Optional - Set the blink rate (unknown unit). USE CAUTION WITH LOW NUMBERS! I am not sure what unit this is in. Accepts values 1 through 255. Required for blink. Only applies to blink. Otherwise this will be ignored.
  toggleCount: 0,             // Optional - Set the toggle count. Required for toggle. Only applies to toggle. Otherwise this will be ignored.
  toggleRate: 5               // Optional - Set the toggle rate. Only applies to toggle. Otherwise this will be ignored. Defaults to 0.5.
};

upb.generate(command, function(commandNew, err) {
  if (err) throw err;
  if (defaults.response.fullJSON == false) { console.log(commandNew.generated); }
  else if (defaults.response.fullJSON == true && defaults.response.fullJSONstring == true) { console.log(JSON.stringify(commandNew)); }
  else if (defaults.response.fullJSON == true) { console.log(commandNew); }
  if (defaults.response.send == true) {
    var serialport = require("serialport");
    var SerialPort = serialport.SerialPort;
    var pim = new SerialPort(defaults.serial.port, {
      baudrate: defaults.serial.baudrate,
      databits: defaults.serial.databits,
      parity: defaults.serial.parity,
      stopbits: defaults.serial.stopbits,
      buffersize: defaults.serial.buffersize,
      parser: serialport.parsers.readline(defaults.serial.parser)
    }, false); // Do not automatically open port

    pim.open(function (err) {
      if (err) throw err;
      consoleDebug('');
      consoleDebug('Serial Port Opened');
      pim.on('data', function(data) {
        consoleDebug('data received: ' + data);
        if (defaults.serial.closeAfterReceive == true) {
          pim.close(function (err) {
            if (err) throw err;
            consoleDebug('closed');
          });
        }
      });
      pim.write(String.fromCharCode(20) + commandNew.generated + String.fromCharCode(13), function(err, results) {
        if (err) throw err;
        consoleDebug('Serial write RAW: ' + String.fromCharCode(20) + commandNew.generated + String.fromCharCode(13));
        consoleDebug('Serial write encoded: ' + commandNew.generated);
        consoleDebug('Serial results: ' + results);
        consoleDebug('');
        if (defaults.serial.closeAfterSend == true) {
          pim.close(function (err) {
            if (err) throw err;
            consoleDebug('');
            consoleDebug('Serial Port Closed');
          });
        }
      });
    });
  }
}, function(commandNew, err) {
  if (err) throw err;                         // Will trigger if there is an error in the supplied data
  console.log(commandNew.generated);          // 09441504FF224B0529
  console.log(JSON.stringify(commandNew));
  // {"source":255,"sendx":"2","ackPulse":false,"idPulse":false,"ackMsg":true,"powerlineRepeater":false,"sendTime":1,"network":"21","id":"4","type":"device","cmd":"goto","level":"75","rate":"5","ctrlWord":{"byte1":0,"byte2":9,"byte3":4,"byte4":4},"words":9,"hex":{"network":"15","id":"4","source":"ff","msg":"22","level":"4b","rate":"5","ctrlWord":{"byte1":"0","byte2":"9","byte3":"4","byte4":"4","fullByte1":"09","fullByte2":"44"}},"msg":22,"generated":"09441504FF224B0529","checksum":"29"}
});
