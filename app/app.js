import express from 'express';
import cors from 'cors';
import hazardRoutes from '../routes/hazardRoutes.js';
import { errorHandler } from '../middleware/errorHandler.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!'); // or serve your frontend index.html
});


app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/hazards', hazardRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

// Error handler
app.use(errorHandler);

export default app;
