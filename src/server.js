import app from './app.js'; // Fixed: added .js extension

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`⚡ Test your route at: http://localhost:${PORT}/api/welcome`);
});