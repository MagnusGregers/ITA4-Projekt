console.log('Script is running')

import express from 'express';
import pg from 'pg';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const port = 3000;
const server = express();

// Opret databaseforbindelse
const db = new pg.Pool({
    host: process.env.PG_HOST,
    port: parseInt(process.env.PG_PORT),
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    ssl: { rejectUnauthorized: false },
});

const dbResult = await db.query('select now()');


// Server statiske filer fra frontend-mappen
server.use(express.static('frontend'));
server.use(onEachRequest);

// Opsæt API-endpoint
server.get('/api/top20', onGetTop20);
server.get('/api/gdp', onGetGdp);
server.get('/api/carbonCap', onGetCarbonCap);
server.listen(port, onServerReady);

// Funktion til at hente data fra carbon_cap
async function onGetTop20(request, response) {
    try {
        // Test databaseforbindelsen
        console.log('Connecting to database', process.env.PG_DATABASE);
        
        // Udfør forespørgslen
        const result = await db.query('SELECT * FROM top_20_emissions_with_area');
        
        // Log resultatet
        console.log(result.rows);
        
        // Returner data til klienten
        response.json(result.rows);
    } catch (error) {
        console.error('Database query failed', error);
        response.status(500).json({ error: 'Database query failed' });
    }
}


async function onGetGdp(request, response) {
    try {
        // Test databaseforbindelsen
        console.log('Connecting to database', process.env.PG_DATABASE);
        
        // Udfør forespørgslen
        const result = await db.query('SELECT * FROM top_20_gdp_with_area ');
        
        // Log resultatet
        console.log(result.rows);
        
        // Returner data til klienten
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
function onEachRequest(request, response, next) {
    console.log(new Date(), request.method, request.url);
    next();
}

// Når serveren er klar
function onServerReady() {
    console.log('Webserver running on port', port);
}
