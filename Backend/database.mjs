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

export async function uploadInterpretation(data) {
    
    try {
        const insertInterpretation = `
        CALL addInterpretation(?, ?, ?, ?, ?, ?);
        `;
        await pool.query(insertInterpretation, [data.title, data.composer, data.conductor, data.publisher, data.year, data.filelink]);
        console.log("Interpretation " + data.title + " inserted to database");

    } catch (error) {
        console.error('Error when inserting data:', error);
    }

}

export async function getImageDescription(url) {
    const filename = url.split('/').pop(); 
    try {
        const imageQuery = 'SELECT description FROM Image WHERE filelink = ?';
        const [rows] = await pool.query(imageQuery, [filename]); 
        return rows[0].description;
    } catch (error) {
        console.error('Error fetching image description:', error);
    }
}

export async function getRelevantDataForDisplayedPdf(url) {
    const urlParams = new URLSearchParams(url.split('?')[1]);
    const folder = urlParams.get('folder');
    const fileName = urlParams.get('url');
    let informationQuery ='';
    let folderTable;
    if (folder === 'documents') {
        folderTable = 'Document';
    } else if (folder === 'programs') {
        folderTable = 'Program';
        informationQuery = `CALL GetProgramDetails(?)`;
    } else if (folder === 'scores') {
        folderTable = 'Interpretation';
        informationQuery = `CALL GetInterpretationDetails(?)`;
    } else {
        console.error('Unknown folder:', folder);
        return null; 
    }

    try {
        const [results] = await pool.query(informationQuery, [fileName]);
        const allResults = results.map(resultSet => resultSet);
        return allResults;
    } catch (error) {
        console.error('Error fetching data from database:', error);
        return null;
    }
}

export async function uploadProgram(data) {

    try {
        const insertProgram = `
        CALL addProgram(?, ?, ?, ?, ?, ?, ?);
        `;
        await pool.query(insertProgram, [data.title, data.location, data.season, data.notes, data.filelink, data.conductor, data.orchestra]);
        const programIDQuery = 'SELECT LAST_INSERT_ID() AS programID';
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
        CALL addImage(?, ?, ?);
        `;
        await pool.query(insertImage, [data.description, data.filelink, data.photographer]);
        console.log("Image inserted to database");

    } catch (error) {
        console.error('Error when inserting data:', error);
    }

}

export async function searchDatabase(searchTerm) {
    try {
        //console.log("searchDatabase in database.mjs");
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
        '' AS document_year,
        i.filelink AS file_link
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
        '' AS document_year,
        p.filelink AS file_link
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
        d.year AS document_year,
        d.filelink AS file_link
        FROM Document d
        WHERE d.title LIKE ?;`;
        
        const wildCard = `%${searchTerm}%`;
        const wildCardParameters = [
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
        //console.log('Search results:', results);
        return results;
    } catch (error) {
        console.error('Error when searching database:', error);
    }
}

export async function searchWithFilters(searchTerm, filters) {

    try {

        let whereClausesInterpretation = [];
        let whereClausesProgram = [];
        let whereClausesDocument = [];
        let queryParameters = [];

        const wildCard = `%${searchTerm}%`;

        whereClausesInterpretation.push(`(s.title LIKE ? OR s.composer LIKE ? OR c.name LIKE ?)`);
        queryParameters.push(wildCard, wildCard, wildCard);

        whereClausesProgram.push(`(p.title LIKE ? OR p.location LIKE ? OR c.name LIKE ? OR o.name LIKE ? OR s.name LIKE ?)`);
        queryParameters.push(wildCard, wildCard, wildCard, wildCard, wildCard);

        whereClausesDocument.push(`d.title LIKE ?`);
        queryParameters.push(wildCard);

        if (filters.time.length > 0) {
            let timeClauses = [];
            filters.time.forEach(period => {
                const startYear = period.start;

                whereClausesInterpretation.push(`i.year BETWEEN ? AND ?`);
                whereClausesDocument.push(`d.year BETWEEN ? AND ?`);
                queryParameters.push(startYear, startYear + 9, startYear, startYear + 9);
        
                // TODO: funkar inte, hitta annan lösning
                timeClauses.push(`p.season LIKE ?`);
                queryParameters.push(`%${startYear.toString().substring(0, 3)}%`);
            });
            if (timeClauses.length > 0) {
                whereClausesProgram.push(`(` + timeClauses.join(' OR ') + `)`);
            }
        }        

        if (filters.conductors.length > 0) {
            filters.conductors.forEach(conductor => {
                whereClausesInterpretation.push(`c.name = ?`);
                whereClausesProgram.push(`c.name = ?`);
                queryParameters.push(conductor, conductor);
            });
        }

        if (filters.types.length > 0) {
            if (!filters.types.includes('Interpretation')) {
                whereClausesInterpretation.push(`1 = 0`); // Exclude interpretations if not selected
            }
            if (!filters.types.includes('Program')) {
                whereClausesProgram.push(`1 = 0`); // Exclude programs if not selected
            }
            if (!filters.types.includes('Other Documents')) {
                whereClausesDocument.push(`1 = 0`); // Exclude documents if not selected
            }
        } else {
            whereClausesInterpretation.push(`1 = 1`);
            whereClausesProgram.push(`1 = 1`);
            whereClausesDocument.push(`1 = 1`);
        }

        const baseQuery = `
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
            '' AS document_year,
            i.filelink AS file_link
        FROM Interpretation i
        JOIN Conductor c ON i.conductor = c.id
        JOIN Score s ON i.score = s.id
        ${whereClausesInterpretation.length > 0 ? 'WHERE ' + whereClausesInterpretation.join(' AND ') : ''}
        
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
            '' AS document_year,
            p.filelink AS file_link
        FROM Program p
        JOIN Conductor c ON p.conductor = c.id
        JOIN Orchestra o ON p.orchestra = o.id
        LEFT JOIN Program_Soloist ps ON p.id = ps.programID
        LEFT JOIN Soloist s ON ps.soloistID = s.id
        ${whereClausesProgram.length > 0 ? 'WHERE ' + whereClausesProgram.join(' AND ') : ''}
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
            d.year AS document_year,
            d.filelink AS file_link
        FROM Document d
        ${whereClausesDocument.length > 0 ? 'WHERE ' + whereClausesDocument.join(' AND ') : ''};
        `;

        const [results] = await pool.query(baseQuery, queryParameters);
        console.log('Filter-based search results:', results);
        return results;
    } catch (error) {
        console.error('Error when searching database & filters:', error);
    }
    
}

export async function searchByFilters(filters){
    
    try {
        let whereClausesInterpretation = [];
        let whereClausesProgram = [];
        let whereClausesDocument = [];
        let queryParameters = [];

        if (filters.time.length > 0) {
            let timeClauses = [];
            filters.time.forEach(period => {
                const startYear = period.start;

                whereClausesInterpretation.push(`i.year BETWEEN ? AND ?`);
                whereClausesDocument.push(`d.year BETWEEN ? AND ?`);
                queryParameters.push(startYear, startYear + 9, startYear, startYear + 9);
        
                // TODO: funkar inte, hitta annan lösning
                timeClauses.push(`p.season LIKE ?`);
                queryParameters.push(`%${startYear.toString().substring(0, 3)}%`);
            });
            if (timeClauses.length > 0) {
                whereClausesProgram.push(`(` + timeClauses.join(' OR ') + `)`);
            }
        }        

        if (filters.conductors.length > 0) {
            filters.conductors.forEach(conductor => {
                whereClausesInterpretation.push(`c.name = ?`);
                whereClausesProgram.push(`c.name = ?`);
                queryParameters.push(conductor, conductor);
            });
        }

        if (filters.types.length > 0) {
            if (!filters.types.includes('Interpretation')) {
                whereClausesInterpretation.push(`1 = 0`); // Exclude interpretations if not selected
            }
            if (!filters.types.includes('Program')) {
                whereClausesProgram.push(`1 = 0`); // Exclude programs if not selected
            }
            if (!filters.types.includes('Other Documents')) {
                whereClausesDocument.push(`1 = 0`); // Exclude documents if not selected
            }
        } else {
            whereClausesInterpretation.push(`1 = 1`);
            whereClausesProgram.push(`1 = 1`);
            whereClausesDocument.push(`1 = 1`);
        }

        const baseQuery = `
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
            '' AS document_year,
            i.filelink AS file_link
        FROM Interpretation i
        JOIN Conductor c ON i.conductor = c.id
        JOIN Score s ON i.score = s.id
        ${whereClausesInterpretation.length > 0 ? 'WHERE ' + whereClausesInterpretation.join(' AND ') : ''}
        
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
            '' AS document_year,
            p.filelink AS file_link
        FROM Program p
        JOIN Conductor c ON p.conductor = c.id
        JOIN Orchestra o ON p.orchestra = o.id
        LEFT JOIN Program_Soloist ps ON p.id = ps.programID
        LEFT JOIN Soloist s ON ps.soloistID = s.id
        ${whereClausesProgram.length > 0 ? 'WHERE ' + whereClausesProgram.join(' AND ') : ''}
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
            d.year AS document_year,
            d.filelink AS file_link
        FROM Document d
        ${whereClausesDocument.length > 0 ? 'WHERE ' + whereClausesDocument.join(' AND ') : ''};
        `;

        const [results] = await pool.query(baseQuery, queryParameters);
        console.log('Filter-based search results:', results);
        return results;
    } catch (error) {
        console.error('Error when searching with filters:', error);
        throw error;
    }

}

export async function getConductors() {

    try {
        const getConductors = `
        SELECT name FROM Conductor;
        `;
        const [results] = await pool.query(getConductors);
        return results;
    } catch (error) {
        console.error('Error when fetching conductors:', error);
    }

}

testConnection();