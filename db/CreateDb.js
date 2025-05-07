import pg from 'pg';
import dotenv from 'dotenv';

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

//Creating tables with our data with Primary and Foreign Keys

//Carbon Footprint Table
await db.query(`
    drop table if exists carbon_footprint;
    create table carbon_footprint (
        transport_method text,
        code integer,
        year date,
        transport_emissions_pr_km integer
    );
`);


//GDP Table
await db.query(`
    drop table if exists gdp;
    create table gdp (
       gdp_id integer unique not null primary key,
       country_id integer references country (country_id),
       country text,
       code integer,
       year date,
       gdp_pr_capital integer
    );
`);

//Carbon Capital Table
await db.query(`
    drop table if exists carbon_capital;
    create table carbon_capital (
    carbon_footprint_id integer unique not null primary key,
    country_id integer references country (country_id),
    country text,
    code integer,
    year date,
    pr_capita_co2_emissions integer
    );
`);

//Country Table
await db.query(`
    drop table if exists country;
    create table country (
    country_id integer unique not null primary key,
    gdp_id integer references gdp (gdp_id),
    carbon_footprint_id integer references carbon_footprint (carbon_footprint_id)
    );
`);

  