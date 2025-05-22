import dotenv from 'dotenv';
dotenv.config();

import { Sequelize } from "sequelize";

const sequelize = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
    dialect: 'mysql',
    host: process.env.MYSQL_HOST
});

export default sequelize;