import mysql from 'mysql2/promise'; 
import dotenv from 'dotenv';
dotenv.config();

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
        connection.release(); 
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
}

export async function fetchData(searchTerm) {
    try {
        const searchTitlesFromConductor = "SELECT s.title AS score_title, s.composer, i.type, i.year, i.fileLink, c.name AS conductor_name " + 
            " FROM Interpretation i" +
            " JOIN Conductor c ON i.conductor = c.id" + 
            " JOIN Score s ON i.score = s.id" + 
            " WHERE c.name LIKE '%" + searchTerm + "%'";

            const searchConductorByName = "SELECT * FROM Conductor WHERE name LIKE '%" + searchTerm + "%'";

            const searchConductorByTitle = "SELECT conductor.name FROM Conductor " + 
            "JOIN Interpretation ON conductor.id = Interpretation.conductor " +
            "JOIN Score ON Interpretation.score = Score.id WHERE Score.title LIKE '%" + searchTerm + "%'";

        const [rows] = await pool.query(searchConductorByName);
        if (rows.length > 0) {
            return rows; 
            console.log('Data found:', rows);
        } else {
            console.log('No data found');
            return []; 
        }
    } catch (error) {
        console.error('Error executing query:', error);
        return [];
    }
}

export async function uploadToDataBase(data) {
    
    let parsedData = checkDataType(data);
    await uploadScore(parsedData.title, parsedData.composer);
    const scoreId = await temporaryScoreId(parsedData.title);
    let conductorId = await uploadConductor(parsedData);
    await uploadInterpretation(parsedData, conductorId, scoreId);
}

async function uploadConductor(parsedData) {

    let conductor = parsedData.conductor;
    let conductorId = null;

    try{
        await pool.query('CALL checkConductor(?, @conductorId)', [conductor]);
        const [rows] = await pool.query('SELECT @conductorId AS output');
        conductorId = rows[0].output;
        return conductorId;
    } catch (error) {
        console.error('Error when inserting data:', error);
    }
}

async function uploadScore(title, composer) {
    try{
        await pool.query('INSERT INTO Score(title, composer) VALUES(?, ?)', [title, composer]);
    } catch (error) {
        console.error('Error when fetching score ID:', error);
        return null;
    }
}

async function uploadInterpretation(parsedData, conductorId, scoreId) {
    console.log('Score ID argument:', scoreId);
    
    try{
       await pool.query('INSERT INTO Interpretation(score, conductor, interpreter, type, publicationYear, fileLink) VALUES(?, ?, ?, ?, ?, ?)', 
        [scoreId, conductorId, parsedData.interpreter, parsedData.type, parsedData.year, parsedData.filelink]);
    } catch {
        error => console.error('Error when inserting data:', error);
    }
}

async function temporaryScoreId(title) {
    try{
        const [rows] = await pool.query('SELECT id FROM Score where title = ?', [title]);
        console.log('I fetched and will return Score ID:', rows[0].id);
        return rows[0].id;
    } catch {
        error => console.error('Error when inserting data:', error);
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