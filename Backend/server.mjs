import express from 'express';
import https from 'https';
import http from 'http';
import cors from 'cors';  
import fs from 'fs';  
import dotenv from 'dotenv';
import path from 'path';
import {uploadInterpretation, uploadProgram, uploadDocument, uploadImage, searchDatabase } from './database.mjs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dotenv.config({ path: '.env.dev' });

const isProduction = process.env.NODE_ENV === 'production';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


const bucketName = process.env.AWS_BUCKET_NAME
const accessKey = process.env.AWS_ACCESSKEYID
const secretAccessKey = process.env.AWS_SECRETACCESSKEY
const bucketRegion = process.env.AWS_REGION

const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey,
    },
    region: bucketRegion
});
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT || 5001;
const httpPort = process.env.HTTPPORT || 5001;

const ssl = {
privateKey: process.env.PRIVKEYDEV,
certificate: process.env.FULLCHAINDEV,
}

if (isProduction) {
    const sslOptions = {
        key: fs.readFileSync(ssl.certificate),
        cert: fs.readFileSync(ssl.privateKey)
    };
    https.createServer(sslOptions, app).listen(port, '0.0.0.0', () => {
        console.log(`Server listening at https://13.61.87.232:${port}`);
    });
} else {
    http.createServer(app).listen(httpPort, '0.0.0.0', () => {
        console.log(`HTTP Server listening at http://127.0.0.1:${httpPort}`);
    });
}

app.use(cors({
    origin: [
            'https://sixtenehrlingdigitalarchive.com', 
            'https://13.61.87.232:5001',
            'https://localhost:5001',
            'http://127.0.0.1:8080',
            'http://127.0.0.1:5500'
        ],   
   
             methods: ['GET', 'POST'], 
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json()); 

app.use(express.static('Design')); 
app.use(express.static('Code')); 

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

app.get('/api/searchDatabase', async (req, res) => { 

    const myString = req.query.myString;

    if (myString === undefined || myString === '') {
        return res.status(400).json({ error: 'Query string is required' });
    } else {
        console.log('Received request with query:', myString)
    }
    
    try{
        const data = await searchDatabase(myString);
        res.json(data); // Returnera JSON data till klienten
    } catch(error){
        console.error('Error fetching data:', error);
        res.status(500).json({error: error.message});
    }

});

app.post('/api/:folder/uploadToS3', upload.single('file'), async (req, res) => {   

        //const folderName = 'scores/';   
        const fileName = req.file.originalname; 
        const folder = req.params.folder;

        const parameters = {
            Bucket: bucketName,
            Key: `${folder}/${fileName}`,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
        };
        const command = new PutObjectCommand(parameters);

        await s3.send(command);
        console.log(`File uploaded: ${fileName}`);

        res.send({});
    });

    app.get('/api/fetchFromS3/:folder/:fileName', async (req, res) => {   
        const fileName = req.params.fileName;
        const folder = req.params.folder;

        console.log(`Requested file: ${fileName}`);

        const getObjectParams = {
            Bucket: bucketName,
            Key: `${folder}/${fileName}`
        };
        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

        res.json({ url });
    });


  