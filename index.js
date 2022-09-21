// configuration
const host = '0.0.0.0';
const port = 8000;
const checkEvery = 5; // second

const pingTarget = [
    ['108.61.150.105', 'hakowork'],
    ['66.66.66.66', 'haha offline']
];

const express = require('express');
var ping = require("net-ping");
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: {
        origin: '*',
    }
});

app.use(express.urlencoded({ extended: true }));
const liveData = io.of("/server");
var session = ping.createSession();
const timeData = checkEvery * 1000;

function check_all_ping() {
    for (i = 0; i < pingTarget.length; i++) {
        const name_server = pingTarget[i][1];
        const ip = pingTarget[i][0];
        const id = i;

        session.pingHost(ip, function (error, target) {
            if (error) {
                if (error instanceof ping.RequestTimedOutError) {
                    liveData.emit(`ping-data`, [id, name_server, false]);
                } else {
                    liveData.emit(`ping-data`, [id, name_server, false, error.toString()]);
                }
            } else {
                liveData.emit(`ping-data`, [id, name_server, true]);
            }
        });
    }
};

function run_loop() {
    setInterval(check_all_ping, timeData);
};

run_loop();

app.get("/", (req, res) => res.send("ping server lol"));
http.listen(port, host, () => console.log(`listening on http://${host}:${port}/`));