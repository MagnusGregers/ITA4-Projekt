import pg from 'pg';
import dotenv from 'dotenv';
import {upload} from 'pg-upload'

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
//in each create table a number of contraints was added
//not null = ensures the coloum cannot store null values
//unique = prevents duplicare entries
// auto increment = generates a unique incrementing integer for every row (skips manual input)

//drop table if exists, is to drop old tables and only keep active or excisting tables

/*await db.query(`
  drop table if exists carbon_footprint;
  drop table if exists country;
  drop table if exists gdp;
  drop table if exists carbon_cap;
  `);
  */

  await db.query(`
    drop table if exists carbon_cap;
    drop table if exists gdp;
    drop table if exists country;
    drop table if exists carbon_footprint;
    `)

//Carbon Footprint Table
await db.query(`
    create table carbon_footprint (
        transport_method text,
        code integer,
        year int,
        transport_emissions_pr_km numeric
    );
`);

//Country Table
await db.query(`
  create table country (
  country_id integer unique not null primary key,
  country text
  );
`);

//GDP Table
await db.query(`
    create table gdp (
       country text,
       code text,
       year numeric,
       gdp_pr_capital numeric
    );
`);

//Carbon Capital Table
await db.query(` 
    create table carbon_cap (
        country text,
        code text,
        year numeric,
        pr_capita_co2_emissions numeric
    );
`);

//Carbon Footprint Table
await upload (
  db,
  'db/carbon_footprint.csv',
  'copy carbon_footprint (transport_method, code, year, transport_emissions_pr_km) from stdin with csv header' 
);

//Country Table
await upload (
  db,
  'db/country.csv',
  'copy country (country_id, country) from stdin with csv header' 
);

  //GDP Table
  await upload (
    db,
    'db/gdp.csv',
    'copy gdp (country, code, year, gdp_pr_capital) from stdin with csv header' 
  );

  //Carbon Capital Table
  await upload (
    db,
    'db/carbon_cap.csv',
    'copy carbon_cap (country, code, year, pr_capita_co2_emissions) from stdin with csv header' 
  );

await db.end();