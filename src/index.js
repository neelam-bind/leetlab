import express from 'express';
import cors from "cors";
import morgan from "morgan";
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes.js'; 
import problemRoutes from './routes/problem.routes.js';
import executionRoutes from './routes/executeCode.route.js';
import submissionRoutes from './routes/submission.routes.js';
import playlistRoutes from './routes/playlist.routes.js';

dotenv.config();

const app = express();


app.use(
    cors({
      origin: ["http://localhost:5173","https://leetlab-frontend-ebon.vercel.app"],
      credentials: true,
    })
  );
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Hello Guys! Welcome to leetlab🔥');
})

app.use('/api/v1/auth',authRoutes);
app.use('/api/v1/problems',problemRoutes);
app.use('/api/v1/execute-code',executionRoutes);
app.use('/api/v1/submissions',submissionRoutes);
app.use('/api/v1/playlist',playlistRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
