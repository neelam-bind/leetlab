import expresss from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';

dotenv.config();

const app = expresss();
app.use(expresss.json());

app.get('/', (req, res) => {
    res.send('Hello Guys! Welcome to leetlab🔥');
})

app.use('/api/v1/auth',authRoutes);

app.listen(process.env.PORT , () => {
    console.log('server is running on port 8080');
})