//import { Pool } from 'pg';
let pg;

if (typeof window === 'undefined') {
  pg = require('pg');
} else {
  pg = null;
}

// const connection = pg ? new pg.Pool({

// }) : null;
const connection = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
})

export default connection;