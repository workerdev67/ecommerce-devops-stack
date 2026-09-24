import express from 'express';
import routes from './route/route.js'; // Fixed: named 'routes' and added .js extension

const app = express();

app.use(express.json());
app.use('/api', routes);

export default app; // Fixed: ES Module export instead of module.exports