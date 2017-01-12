import PackageConfig from '../../package.json';
import io from 'socket.io-client';
import 'console.style';
const c = console.colors;

let socket = io(PackageConfig.target.host + ':' + PackageConfig.target.port);
socket.on('connect', function() {
    console.debug("[Socket] Socket connected!");

    // Get token so that we can authenticate on /authenticated
    socket.emit('retrieveToken', {
        user: 'test',
        password: 'password'
    }, function(err, token) {
        receivedToken(token);
    });

    socket.on('disconnect', function() {
        socket.authenticed = false;
    });
});

const requireAuthentication = ['listDirectory', 'fileSize', 'fileRead', 'fileInfo'];
let pendingAuthentication = [];

socket.oldEmit = socket.emit;
socket.emit = function() {
    let _self = this, args = arguments;
    if (requireAuthentication.indexOf(arguments[0]) > -1 && !socket.authenticated) {
        console.debug('[Socket]', arguments[0], 'requires authentication. Waiting for authentication...');
        pendingAuthentication.push(function() {
            socket.oldEmit.apply(_self, args);
        });
    } else {
        socket.oldEmit.apply(_self, arguments);
    }
    return this;
};

function receivedToken(token) {
    console.debug('[Socket] Retrieved token!');
    socket.emit('authenticate', {token}).on('authenticated', function() {
        authenticated();
    }).on('unauthorized', function(msg) {
        console.error("[Socket] Unauthorized: " + JSON.stringify(msg.data));
        throw new Error(msg.data.type);
    });
}

function authenticated() {
    console.debug('[Socket] Authenticated!');
    socket.authenticated = true;
    for (let func of pendingAuthentication) {
        func();
    }
    pendingAuthentication.length = 0;
}

export default function(state = socket, action) {
    return state;
}
