console.log('Script is running')

import pg from 'pg';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();
console.log('Connecting to database', process.env.PG_DATABASE);
const db = new pg.Pool({
    host:     process.env.PG_HOST,
    port:     parseInt(process.env.PG_PORT),
    database: process.env.PG_DATABASE,
    user:     process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    ssl:      { rejectUnauthorized: false },
});
const dbResult = await db.query('select now()');


const app = express();
const port = 3000;
const server = express();

server.use(express.static('frontend'));
server.use(onEachRequest)
server.get('/api/ita4', onGetita4);
server.get('/api/dbData', onGetdbData);
server.listen(port, onServerReady);

function onGetita4(request, response) {
    response.json('hello, web world!');
}

async function onGetdbData(request, response) {
  try {
    const result = await db.query('SELECT * FROM carbon_cap order by country asc');
    response.json(result.rows);
  } catch (err) {
    console.error('DB error:', err);
    response.status(500).json({ error: 'Database error' });
  }
}

function onEachRequest(request, response, next) {
    console.log(new Date(), request.method, request.url);
    next();
}

function onServerReady() {
    console.log('Webserver running on port', port);
}

