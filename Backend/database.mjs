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

export async function uploadToDataBase(data) {
    
    let parsedData = checkDataType(data);
    
    await uploadScore(parsedData.title, parsedData.composer);
    const scoreId = await temporaryScoreId(parsedData.title);
    let conductorId = await uploadConductor(parsedData);
    await uploadInterpreter(parsedData.interpreter);
    const interpreterId = await temporaryInterpreterId(parsedData.interpreter);
    await uploadInterpretation(parsedData, conductorId, scoreId, interpreterId);
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

async function uploadInterpretation(parsedData, conductorId, scoreId, interpreterId) {
    console.log('Score ID argument:', scoreId);
    
    try{
       await pool.query('INSERT INTO Interpretation(score, conductor, interpreter, year, filelink,  opus) VALUES(?, ?, ?, ?, ?, ?)', 
        [scoreId, conductorId, interpreterId, parsedData.year, parsedData.filelink, parsedData.opus]); //det strular här
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

async function uploadInterpreter(interpreter) {

    try{
        await pool.query('INSERT INTO Interpreter(name) VALUES(?)', [interpreter]);
    } catch (error) {
        console.error('Error when inserting data:', error);
    }
}

async function temporaryInterpreterId(interpreter) {
    try{
        const [rows] = await pool.query('SELECT id FROM Interpreter where name = ?', [interpreter]);
        console.log('I fetched and will return interpreter ID:', rows[0].id);
        return rows[0].id;
    } catch {
        error => console.error('Error when inserting data:', error);
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