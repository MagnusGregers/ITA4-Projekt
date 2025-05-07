import express from 'express';

const port = 3000;
const server = express();

server.get('/api/json1', onGetJson1);
server.listen(port);

function onGetJson1(request, response) {
    response.json('hello, web world!');
}
