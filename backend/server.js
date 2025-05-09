import express from 'express';

const port = 3000;
const server = express();

server.use(express.static('frontend'));
server.use(onEachRequest)
server.get('/api/ita4', onGetita4);
server.listen(port);

function onGetita4(request, response) {
    response.json('hello, web world!');
}
function onEachRequest(request, response, next) {
    console.log(new Date(), request.method, request.url);
    next();
}

function onServerReady() {
    console.log('Webserver running on port', port);
}