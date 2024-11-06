import express from 'express';
import cors from 'cors';  
import { fetchData } from './database.mjs';

const app = express();
const port = 5000;

app.use(cors()); 

app.get('/fetchData', async (req, res) => {
    try{
        const data = await fetchData();
        console.log('Fetched data:', data);  // Skriv ut vad servern hämtar
        res.json(data);
    } catch(error){
        console.error('Error fetching data:', error);
        res.status(500).json({error: error.message});
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});