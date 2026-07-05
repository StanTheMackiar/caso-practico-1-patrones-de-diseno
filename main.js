import express from 'express';
import router from './src/routes/routes.js';
import { seed } from './src/utils/helpers/seed.helper.js';

const app = express();

app.use(express.json());
app.use('/api', router);

app.get('/', (req, res) => {
  res.json({
    message: 'Backend UES + ICCIS funcionando',
    api: '/api'
  });
});

const PORT = process.env.PORT || 3000;

seed();

app.listen(PORT, () => {
  console.log(`Servidor UES + ICCIS escuchando en http://localhost:${PORT}`);
});

export default app;
