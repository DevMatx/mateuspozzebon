require('dotenv').config();

const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { connectDatabase } = require('./server/config/database');
const { seedInitialMedia } = require('./server/services/seedMedia');

const authRoutes = require('./server/routes/authRoutes');
const mediaRoutes = require('./server/routes/mediaRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const rootDir = __dirname;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/media', mediaRoutes);
app.use('/admin', express.static(path.join(rootDir, 'admin')));
app.use(express.static(rootDir));

app.get('/admin', (_req, res) => {
  res.sendFile(path.join(rootDir, 'admin', 'index.html'));
});

app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Erro interno do servidor' });
});

async function start() {
  await connectDatabase();
  await seedInitialMedia();
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Painel admin em http://localhost:${PORT}/admin`);
  });
}

start().catch((error) => {
  console.error('Falha ao iniciar servidor:', error);
  process.exit(1);
});
