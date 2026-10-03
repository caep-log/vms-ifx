import express, { type Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';


dotenv.config();

import routes from './routes/routes';

const app: Express = express();

const PORT = process.env.PORT || 3000;

const allowedOrigins = [
    'http://localhost:5173', // local development
    'https://vms-ifx.ai' // "production"
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());

app.use('/api', routes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
