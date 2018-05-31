const dgram = require('dgram');
module.exports = (segment) => {
    return new Promise((resolve, reject) => {
        const server = dgram.createSocket('udp4');
        server.on('error', (err) => {
            console.log(`server error:\n${err.stack}`);
            server.close();
            reject(err)
        });
        server.on('message', (msg, rinfo) => {
            server.close();
            resolve(msg)
        });
        server.on('listening', () => {
            server.send(segment, 41234, '127.0.0.1', (err) => {
                console.log(err)
            });
        });
        server.bind(41235);
    })
};