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
import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
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

        fileName = reformatFileName(fileName);

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
        let fileName = req.params.fileName;
        const folder = req.params.folder;
    
        console.log(`Requested folder: ${folder}`);
        console.log(`Requested file: ${fileName}`);
    
        fileName = reformatFileName(fileName);
        const range = req.headers.range;
    
        if (!range) {
            return res.status(400).send('Range header is required');
        }
    
        console.log(`Requested range: ${range}`);
    
        const getObjectParams = {
            Bucket: bucketName,
            Key: `${folder}/${fileName}`,
            Range: range, // Hantera byte-ranges
        };
    
        try {
            const command = new GetObjectCommand(getObjectParams);
            const { Body, ContentType, ContentRange, ContentLength } = await s3.send(command);
    
            const chunks = [];
            Body.on('data', (chunk) => {
                chunks.push(chunk);
            });
    
            Body.on('end', () => {
                const fileBuffer = Buffer.concat(chunks); // Sammanfoga alla bitarna
                res.status(200).setHeader('Content-Type', ContentType || 'application/octet-stream');
                res.setHeader('Content-Length', fileBuffer.length);
                res.send(fileBuffer); // Skicka hela filen när alla bitar är nedladdade
            });
    
            Body.on('error', (err) => {
                console.error('Error fetching file from S3:', err);
                res.status(500).send('Error fetching file from S3');
            });
        } catch (error) {
            console.error('Error fetching file from S3:', error);
    
            if (error.$metadata?.httpStatusCode === 416) {
                res.status(416).send('Requested range not satisfiable');
            } else {
                res.status(500).send('Error fetching file from S3');
            }
        }
    });

    function reformatFileName(fileName){
        fileName = fileName.replace(/[åäö]/gi, (match) => {
            switch (match.toLowerCase()) {
                case 'å': return 'a';
                case 'ä': return 'a';
                case 'ö': return 'o';
                default: return match;
            }
        });
        return fileName;  
    }

    app.get('/api/fetchImagesFromS3', async (req, res) => {
        const folder = req.query.folder || 'images'; 
    
        const params = {
            Bucket: bucketName,
            Prefix: `${folder}/`, 
        };
    
        try {
            const command = new ListObjectsV2Command(params);
            const data = await s3.send(command);
    
            if (!data.Contents || data.Contents.length === 0) {
                return res.status(404).json({ message: 'No images found in the specified folder.' });
            }
    
            const imageUrls = data.Contents
                .filter(item => /\.(jpg|jpeg|png|gif)$/i.test(item.Key)) 
                .map(item => `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${item.Key}`);
            console.log('I am fetching images from S3 once again');
            res.status(200).json({ images: imageUrls });
        } catch (error) {
            console.error('Error fetching images from S3:', error);
            res.status(500).json({ message: 'Error fetching images from S3', error: error.message });
        }
    });

    app.get('/api/getUploadPassword', async (req, res) => {

        const uploadPassword = process.env.UPLOAD_PASSWORD;

        if(uploadPassword === undefined || uploadPassword === ''){
            return res.status(500).json({error: 'Upload password not found'});
        }

        res.json({ uploadPassword });

    });




  