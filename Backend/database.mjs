import mysql from 'mysql2/promise'; 
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
host: process.env.HOST,
user: process.env.USER,
password: process.env.PASSWORD,
database: process.env.DATABASE,
multipleStatements: true
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

export async function uploadInterpretation(data) {
    
    try {
        const insertInterpretation = `
        CALL addInterpretation(?, ?, ?, ?, ?, ?, ?);
        `;
        await pool.query(insertInterpretation, [data.title, data.composer, data.conductor, data.interpreter, data.year, data.filelink, data.opusNumber]);
        const [rows] = await pool.query(programIDQuery);
        console.log("Interpretation " + data.title + " inserted to database");

    } catch (error) {
        console.error('Error when inserting data:', error);
    }

}

export async function uploadProgram(data) {

    try {
        //const insertProgram= "call addProgram(?, ?, ?, ?, ?, ?, ?, ?)";
        const insertProgram = `
        CALL addProgram(?, ?, ?, ?, ?, ?, ?);
        `;
        await pool.query(insertProgram, [data.title, data.location, data.year, data.notes, data.filelink, data.conductor, data.orchestra]);
        const programIDQuery = 'SELECT @programID AS programID';
        const [rows] = await pool.query(programIDQuery);
        const programID = rows[0].programID;
        console.log("Program #" + programID + ": " + data.title + " inserted to database");

        if(data.soloist !== undefined || data.soloist !== null) {
            const soloists = data.soloist.split(', ').map(soloist => soloist.trim());

            for(const soloistName of soloists) {
                const insertSoloist = 'CALL addSoloist(?, ?)';
                await pool.query(insertSoloist, [soloistName, programID]);
                console.log("Soloist: " + soloistName + " inserted to database");
            } 
        }

    } catch (error) {
        console.error('Error when inserting data:', error);
    }

}

export async function uploadDocument(data) {

    try {
        const insertDocument = `
        CALL addDocument(?, ?, ?, ?);
        `;
        await pool.query(insertDocument, [data.title, data.type, data.year, data.filelink]);
        console.log("Document " + data.title + " inserted to database");

    } catch (error) {
        console.error('Error when inserting data:', error);
    }

}

export async function uploadImage(data) {

    try {
        const insertImage = `
        CALL addImage(?, ?);
        `;
        await pool.query(insertImage, [data.description, data.filelink]);
        console.log("Image " + data.description + " inserted to database");

    } catch (error) {
        console.error('Error when inserting data:', error);
    }

}


testConnection();
fetchData();