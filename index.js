import express from 'express';
import {configDotenv} from 'dotenv';

configDotenv();

const app = express();
const PORT  = process.env.PORT;

app.set('view engine', 'ejs');

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});