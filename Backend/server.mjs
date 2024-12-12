import express from 'express';
import https from 'https';
import cors from 'cors';  
import fs from 'fs';  
import dotenv from 'dotenv';
import path from 'path';
import { fetchData, uploadToDataBase } from './database.mjs';
import { fileURLToPath } from 'url';
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 5001;

const ssl = {
privateKey: process.env.PRIVKEYDEV,
certificate: process.env.FULLCHAINDEV,
}

const sslOptions = {
    key: fs.readFileSync(ssl.certificate),  
    cert: fs.readFileSync(ssl.privateKey), 
};

app.use(cors({
    origin: [
                'https://sixtenehrlingdigitalarchive.com', 
                'https://13.61.87.232:5001', 
                'http://localhost:5001',
                'http://13.61.87.232:5001'],   
    methods: ['GET', 'POST'], 
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json()); 

app.use(express.static('Design')); 
app.use(express.static('Code')); 

app.get('/fetchData', async (req, res) => {

    const myString = req.query.myString;

    if (myString === undefined || myString === '') {
        return res.status(400).json({ error: 'Query string is required' });
    } else {
        console.log('Received request with query:', myString)
    }
    
    try{
        const data = await fetchData(myString);
        res.json(data); 
    } catch(error){
        console.error('Error fetching data:', error);
        res.status(500).json({error: error.message});
    }
});

app.post('/uploadToDatabase', async (req, res) => {
    try {
        const data = req.body;
        const result = await uploadToDataBase(data);
        res.json({ message: 'Data sent to database.mjs' });
    } catch (error) {
        console.error('Error when inserting data:', error);
        res.status(500).json({ error: error.message });
    }
});



https.createServer(sslOptions, app).listen(port, '0.0.0.0', () => {
    console.log(`Server listening at https://13.61.87.232:${port}`);
});

