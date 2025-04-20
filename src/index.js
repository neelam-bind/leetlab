import expresss from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = expresss();

app.listen(process.env.PORT , () => {
    console.log('server is running on port 8080');
})