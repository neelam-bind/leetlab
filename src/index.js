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
      origin: "http://localhost:5173",
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

app.listen(process.env.PORT , () => {
    console.log('server is running on port 8080');
})