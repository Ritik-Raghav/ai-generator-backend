import dotenv from 'dotenv';
dotenv.config();

import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
    process.env.MYSQLDATABASE, 
    process.env.MYSQLUSER, 
    process.env.MYSQLPASSWORD, 
    {
        dialect: 'mysql',
        host: process.env.MYSQLHOST,
        port: process.env.MYSQLPORT || 3306,
    }
);

export default sequelize;