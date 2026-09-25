import { pool } from '../db/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RedisClient } from '../db/reddis.js';

export const pleaceOrder = async (req, res) => {
    try {
        const uid = req.user.uid;
        const cust_name = req.user.name || 'Customer';
        const { oid } = req.body;

        if (!oid) {
            return res.status(400).json({
                message: "Product ID (oid) is required"
            });
        }

        const redisKey = `cart:${uid}`;
        let cartItem = null;

        if (RedisClient && RedisClient.isOpen) {
            const existingcrt = await RedisClient.hGet(redisKey, String(oid));

            if (!existingcrt) {
                return res.status(404).json({
                    message: "Product not found in Cart"
                });
            }

            cartItem = JSON.parse(existingcrt);
        } else {
            return res.status(500).json({ message: "Redis service unavailable" });
        }

        const randomOrderNum = Math.floor(10010 + Math.random() * 1000100);
        const orderTrackingId = `ORD-00A-${randomOrderNum}`;

        const totalAmount = Number(cartItem.price) * Number(cartItem.quantity);

        const insertQuery = `
            INSERT INTO orders (oid, cust_name, prod_details, total_amount, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;

        const queryValues = [
            orderTrackingId,
            cust_name,
            JSON.stringify(cartItem),
            totalAmount,
            'created'
        ];

        const dbResult = await pool.query(insertQuery, queryValues);

        if (RedisClient && RedisClient.isOpen) {
            await RedisClient.hDel(redisKey, String(oid));
        }

        return res.status(201).json({
            message: 'Order Created Successfully',
            orderTrackingId: orderTrackingId,
            orderDetails: dbResult.rows[0]
        });

    } catch (error) {
        console.error("Place Order Error:", error);
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};