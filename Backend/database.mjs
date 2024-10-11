import mysql from 'mysql2/promise'; 
import dotenv from 'dotenv';
dotenv.config();

console.log('HOST:', process.env.HOST);
console.log('USER:', process.env.USER);
console.log('PASSWORD:', process.env.PASSWORD ? '✔️' : '❌'); 
console.log('DATABASE:', process.env.DATABASE);

const pool = mysql.createPool({
host: process.env.HOST,
user: process.env.USER,
password: process.env.PASSWORD,
database: process.env.DATABASE
});

async function fetchData() {
try {
const [rows] = await pool.query("SELECT * FROM Test");
console.log(rows); 
} catch (error) {
console.error('Error executing query:', error);
}
}

fetchData();