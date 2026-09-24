import express from 'express'; 
const router = express.Router();
import { register , login } from '../controller/reg.js';
import { getAggregatedProducts } from '../controller/product.js';
import { verifyToken } from '../middleware/middleware.js';

router.get('/welcome', (req, res) => {
  res.status(200).json({ message: 'Welcome to the API!' });
});

router.post('/create/user', register);
router.post('/login/user', login);
router.post('/get/prods', verifyToken, getAggregatedProducts);
// router.post('/login/user', users.loginUser);

export default router;