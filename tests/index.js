const spawn = require('child_process').spawn
const path = require('path')

const tplangPath = '/Applications/CAMotics.app/Contents/MacOS/tplang'

const proc = spawn(tplangPath, [path.join(__dirname, 'cut.tpl')])
proc.stdout.on('data', (buff) => {
    console.log(buff.toString())
})

proc.stderr.on('data', function (data) {
    console.log('stderr: ' + data.toString());
});

proc.on('exit', function (code) {
    console.log('child process exited with code ' + code.toString());
});