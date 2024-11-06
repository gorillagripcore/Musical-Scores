import mysql from 'mysql2/promise'; 
import dotenv from 'dotenv';
dotenv.config();

/*
console.log('HOST:', process.env.HOST);
console.log('USER:', process.env.USER);
console.log('PASSWORD:', process.env.PASSWORD ? '✔️' : '❌'); 
console.log('DATABASE:', process.env.DATABASE);
*/

const pool = mysql.createPool({
host: process.env.HOST,
user: process.env.USER,
password: process.env.PASSWORD,
database: process.env.DATABASE
});

export async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Database connected successfully!');
        connection.release();  // Släpp anslutningen när den inte behövs
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
}

export async function fetchData() {
    try {
        const [rows] = await pool.query("SELECT * FROM Conductor");
        if (rows.length > 0) {
            return rows;  // Om det finns rader, returnera dem
        } else {
            console.log('No data found');
            return [];  // Om ingen data hittades, returnera en tom array
        }
    } catch (error) {
        console.error('Error executing query:', error);
        return [];
    }
}

testConnection();
fetchData();