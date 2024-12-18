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
    database: process.env.DATABASE,
    multipleStatements: true
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

export async function uploadProgram(data) {

    try {
        //const insertProgram= "call addProgram(?, ?, ?, ?, ?, ?, ?, ?)";
        const insertProgram = `
        CALL addProgram(?, ?, ?, ?, ?, ?, ?);
        `;
        await pool.query(insertProgram, [data.title, data.location, data.season, data.notes, data.filelink, data.conductor, data.orchestra]);
        const programIDQuery = 'SELECT @programID AS programID';
        const [rows] = await pool.query(programIDQuery);
        const programID = rows[0].programID;
        console.log("Program #" + programID + ": " + data.title + " inserted to database");

        if (data.soloist !== undefined || data.soloist !== null) {
            const soloists = data.soloist.split(', ').map(soloist => soloist.trim());

            for (const soloistName of soloists) {
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

export async function searchDatabase(data) {
    try {
        console.log("searchDatabase in database.mjs");
        const searchQuery = `
        SELECT 
        'Interpretation' AS type,
        s.title AS score_title, 
        c.name AS conductor_name, 
        s.composer AS score_composer,
        '' AS program_title, 
        '' AS season, 
        '' AS location, 
        '' AS orchestra, 
        '' AS soloists, 
        '' AS document_title, 
        '' AS document_year
        FROM Interpretation i
        JOIN Conductor c ON i.conductor = c.id
        JOIN Score s ON i.score = s.id
        WHERE s.title LIKE ?
            OR s.composer LIKE ?
            OR c.name LIKE ?
        UNION ALL
        SELECT 
        'Program' AS type,
        '' AS score_title, 
        c.name AS conductor_name, 
        '' AS score_composer,
        p.title AS program_title, 
        p.season AS season, 
        p.location AS location, 
        o.name AS orchestra, 
        GROUP_CONCAT(s.name SEPARATOR ', ') AS soloists, 
        '' AS document_title, 
        '' AS document_year
        FROM Program p
        JOIN Conductor c ON p.conductor = c.id
        JOIN Orchestra o ON p.orchestra = o.id
        LEFT JOIN Program_Soloist ps ON p.id = ps.programID
        LEFT JOIN Soloist s ON ps.soloistID = s.id
        WHERE p.title LIKE ?
            OR p.location LIKE ?
            OR c.name LIKE ?
            OR o.name LIKE ?
            OR s.name LIKE ?
        GROUP BY 
        p.id,
        p.title,
        p.season,
        p.location,
        c.name,
        o.name
        UNION ALL
        SELECT 
        'Document' AS type,
        '' AS score_title, 
        '' AS conductor_name, 
        '' AS score_composer,
        '' AS program_title, 
        '' AS season, 
        '' AS location, 
        '' AS orchestra, 
        '' AS soloists, 
        d.title AS document_title, 
        d.year AS document_year
        FROM Document d
        WHERE d.title LIKE ?;`;
        const wildCard = `%${data}%`;
        const wildCardParameters = [ // en wildcard för varje parameter i queryn
            wildCard,
            wildCard,
            wildCard,
            wildCard,
            wildCard,
            wildCard,
            wildCard,
            wildCard,
            wildCard
        ];
        const [results] = await pool.query(searchQuery, wildCardParameters);
        console.log('Search results:', results);
        return results;
    } catch (error) {
        console.error('Error when searching database:', error);
    }
}


testConnection();
fetchData();