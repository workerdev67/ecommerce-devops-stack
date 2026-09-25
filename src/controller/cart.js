import { pool } from '../db/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RedisClient } from '../db/reddis.js';

export const addtoCart = async (req, res) => {
    try {
        const { oid, quantity } = req.body;
        console.log("orderId is :- ", oid);
        console.log("quantity is :- ", quantity);

        if (!oid || !quantity) {
            return res.status(400).json({ message: 'oid and quantity are required' });
        }

        const uid = req.user.uid

        const url = process.env.PRODUCTAPI1;
        const url2 = process.env.PRODUCTAPI2;

        const [proda, prodb] = await Promise.all([
            fetch(url),
            fetch(url2)
        ]);

        const data1 = await proda.json();
        const data2 = await prodb.json();

        const products1 = Array.isArray(data1) ? data1 : (data1.products || []);
        const products2 = Array.isArray(data2) ? data2 : (data2.products || []);

        const api2Products = products2.map((item, index) => ({
            ...item,
            id: 1001 + index
        }));

        const alldata = [...products1, ...api2Products];

        const targetProduct = alldata.find(p => String(p.id) === String(oid));

        if (!targetProduct) {
            return res.status(404).json({ message: 'Product not found with this oid' });
        }

        const cartItem = {
            id: targetProduct.id,
            title: targetProduct.title,
            description: targetProduct.description || '',
            category: targetProduct.category || '',
            price: targetProduct.price,
            sku: targetProduct.sku || 'N/A',
            quantity: Number(quantity)
        };

        if (RedisClient && RedisClient.isOpen) {
            const cartKey = `cart:${uid}`;

            const existingStr = await RedisClient.hGet(cartKey, String(oid));
            if (existingStr) {
                const existingItem = JSON.parse(existingStr);
                cartItem.quantity += existingItem.quantity;
            }

            await RedisClient.hSet(cartKey, String(oid), JSON.stringify(cartItem));

            await RedisClient.expire(cartKey, 7 * 24 * 60 * 60);
        }

        return res.status(201).json({
            message: "product added to cart",
            cartItem
        });

    } catch (error) {
        console.error("Cart Controller Error:", error);
        return res.status(500).json({
            message: 'internal server error',
            error: error.message
        });
    }
};