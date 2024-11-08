import express from 'express';
import cors from 'cors';  
import { fetchData } from './database.mjs';

const app = express();
const port = 5000;

app.use(cors()); 

app.use(express.static('Design')); 
app.use(express.static('Code')); 

app.get('/fetchData', async (req, res) => {

    const myString = req.query.myString;

    if (myString === undefined || myString === '') {
        console.log('No query string provided');
        return res.status(400).json({ error: 'Query string is required' });
    } else {
        console.log('Received request with query:', myString)
    }
    
    try{
        const data = await fetchData(myString);
        console.log('Fetched data:', data);  // Skriv ut vad servern hämtar i konsollen 
        res.json(data); // Returnera JSON data till klienten
    } catch(error){
        console.error('Error fetching data:', error);
        res.status(500).json({error: error.message});
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});