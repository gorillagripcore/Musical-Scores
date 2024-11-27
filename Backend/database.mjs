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

export async function fetchData(searchTerm) {
    try {
        const searchTitlesFromConductor = "SELECT s.title AS score_title, s.composer, i.type, i.publicationYear, i.fileLink, c.name AS conductor_name " + 
            " FROM Interpretation i" +
            " JOIN Conductor c ON i.conductor = c.id" + 
            " JOIN Score s ON i.score = s.id" + 
            " WHERE c.name LIKE '%" + searchTerm + "%'";

            const searchConductorByName = "SELECT * FROM Conductor WHERE name LIKE '%" + searchTerm + "%'";

            const searchConductorByTitle = "SELECT Conductor.name FROM Conductor " + 
            "JOIN Interpretation ON Conductor.id = Interpretation.conductor " +
            "JOIN Score ON Interpretation.score = Score.id WHERE Score.title LIKE '%" + searchTerm + "%'";

        const [rows] = await pool.query(searchTitlesFromConductor);
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

export async function uploadToDataBase(data) {
    
    let parsedData = checkDataType(data);
  
    try {
        if (parsedData.conductor != "") {
            const insertConductorByName = "INSERT INTO Conductor(name) VALUE(?)";
            await pool.query(insertConductorByName, [parsedData.conductor]);
            console.log("Conductor: " + parsedData.conductor + " inserted to database");
            fetchData(parsedData.conductor);
        } else {
            console.log('No conductor name provided');
        }
    } catch (error) {
        console.error('Error when inserting data:', error);
    }
}

function checkDataType(data) {

    let parsedData;
    if (data !== undefined && data !== null) {
        try {
            if (typeof data === 'string') {
                parsedData = JSON.parse(data);
            } else {
                parsedData = data;
            }

            return parsedData;

        } catch (error) {
            console.error('Invalid JSON data received:', error);
            return;
        }
    }
}


testConnection();
fetchData();