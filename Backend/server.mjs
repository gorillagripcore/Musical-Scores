import express from 'express';
import https from 'https';
import cors from 'cors';  
import fs from 'fs';  
import dotenv from 'dotenv';
import path from 'path';
import { fetchData, uploadInterpretation, uploadProgram, uploadDocument, uploadImage } from './database.mjs';
import { fileURLToPath } from 'url';
dotenv.config({ path: '/etc/app.env' });  

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
            'https://localhost:5001',],   
   
             methods: ['GET', 'POST'], 
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json()); 

app.use(express.static('Design')); 
app.use(express.static('Code')); 

app.get('/api/fetchData', async (req, res) => {

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

app.post('/api/uploadInterpretation', async (req, res) => {
    try {
        const data = req.body;
        await uploadInterpretation(data);
        res.status(200).json({ message: 'Interpretation uploaded successfully!' });
    } catch (error) {
        console.error('Error when uploading interpretation:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/uploadProgram', async (req, res) => {
    try {
        const data = req.body;
        await uploadProgram(data);
        res.status(200).json({ message: 'Program uploaded successfully!' });
    } catch (error) {
        console.error('Error when uploading program:', error);
        res.status(500).json({ error: 'Failed to upload program' });
    }
});

app.post('/api/uploadDocument', async (req, res) => {
    try {
        const data = req.body;
        await uploadDocument(data);
        res.status(200).json({ message: 'Document uploaded successfully!' });
    } catch (error) {
        console.error('Error when uploading document:', error);
        res.status(500).json({ error: 'Failed to upload document' });
    }
});

app.post('/api/uploadImage', async (req, res) => {
    try {
        const data = req.body;
        await uploadImage(data);
        res.status(200).json({ message: 'Image uploaded successfully!' });
    } catch (error) {
        console.error('Error when uploading image:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

https.createServer(sslOptions, app).listen(port, '0.0.0.0', () => {
    console.log(`Server listening at https://13.61.87.232:${port}`);
});
