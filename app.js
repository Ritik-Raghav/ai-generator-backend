import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import sequelize from './util/database.js';
import axios from 'axios';

const app = express();
import User from './models/user.js';

import authRoutes from './routes/auth.js';
import fileRoutes from './routes/file.js';


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));


app.use('/', authRoutes);
app.use('/', fileRoutes);



sequelize.sync()
    .then(() => {
        app.listen(3000, () => console.log("Server running on port 3000"));
    })
    .catch(error => console.log(error));