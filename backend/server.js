import express from 'express';
import cors from 'cors';
import testRoute from './routes/test.route.js';
import uploadRoute from './routes/upload.route.js';
import chatRoute from './routes/chat.route.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // JSON Handling Requirement

// Routes
app.use('/test', testRoute);
app.use('/api/upload', uploadRoute);
app.use('/api/chat', chatRoute);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
