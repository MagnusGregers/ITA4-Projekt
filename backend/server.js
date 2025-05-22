console.log('Script is running')

import express from 'express';
import pg from 'pg';
import dotenv from 'dotenv';


dotenv.config();

const port = 3000;
const server = express();

//creating databas connection with prostgres - 
//to insure the database is not on git, an envioment fill is added with the actual port ect.
const db = new pg.Pool({
    host: process.env.PG_HOST,
    port: parseInt(process.env.PG_PORT),
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    ssl: { rejectUnauthorized: false },
});

const dbResult = await db.query('select now()');

//server files from the frontend folder
server.use(express.static('frontend'));
server.use(onEachRequest);

// adding API-endpoint
server.get('/api/top20', onGetTop20);
server.get('/api/gdp', onGetGdp);
server.get('/api/carbonCap', onGetCarbonCap);
server.listen(port, onServerReady);

//function to get data from a view based in carbon_cap in the database
async function onGetTop20(request, response) {
    try {
        // testing the conection
        console.log('Connecting to database', process.env.PG_DATABASE);
        
        // completing the query
        const result = await db.query('SELECT * FROM top_20_emissions_with_area');
        
        // Logging the result
        console.log(result.rows);
        
        // returning the data to the klient
        response.json(result.rows);
    } catch (error) {
        console.error('Database query failed', error);
        response.status(500).json({ error: 'Database query failed' });
    }
}


async function onGetGdp(request, response) {
    try {
        console.log('Connecting to database', process.env.PG_DATABASE);
        const result = await db.query('SELECT * FROM top_20_gdp_with_area ');
        console.log(result.rows);
        response.json(result.rows);
    } catch (error) {
        console.error('Database query failed', error);
        response.status(500).json({ error: 'Database query failed' });
    }
}

async function onGetCarbonCap(request, response) {
  try {
    const result = await db.query('select country, year, round (pr_capita_co2_emissions, 2) as pr_capita_co2_emissions from carbon_cap');
    response.json(result.rows);
  } catch (err) {
    console.error('DB error:', err);
    response.status(500).json({ error: 'Database error' });
  }
}

// Logger hver indkommende forespørgsel
//logging every incomming query
function onEachRequest(request, response, next) {
    console.log(new Date(), request.method, request.url);
    next();
}

//when the server is ready
function onServerReady() {
    console.log('Webserver running on port', port);
}
