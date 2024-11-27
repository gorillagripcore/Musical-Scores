import express from 'express';
import cors from 'cors';  
import { fetchData, uploadToDataBase } from './database.mjs';

const app = express();
const port = 5001;

app.use(cors());
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
        res.json(data); // Returnera JSON data till klienten
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



app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

/*
app.get('/startUpFetchData', async (req, res) => {

    try{
        const data = await startUpFetchData
        console.log('Fetched data:', data);  // Skriv ut vad servern hämtar i konsollen 
        res.json(data); // Returnera JSON data till klienten
    } catch(error){
        console.error('Error fetching data:', error);
        res.status(500).json({error: error.message});
    }
});
*/