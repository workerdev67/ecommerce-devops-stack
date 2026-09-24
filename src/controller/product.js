import { pool } from '../db/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RedisClient } from '../db/reddis.js'

const mapdata = async() =>{
    const url1 = process.env.PRODUCTAPI1
    const url2 = process.env.PRODUCTAPI2
}