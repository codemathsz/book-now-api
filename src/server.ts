import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { config } from './config';

// Routes
import authRoutes from './routes/auth';
import reservationsRoutes from './routes/reservations';
import dashboardRoutes from './routes/dashboard';
import timeSlotsRoutes from './routes/timeSlots';

dotenv.config();

const app: Application = express();

// Middlewares
// Configuração CORS para aceitar múltiplas origens (desktop + mobile)
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://192.168.18.8:5173',
  process.env.FRONTEND_URL
].filter(Boolean); // Remove undefined

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origin (Postman, apps mobile, etc)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // Permite envio de cookies
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/time-slots', timeSlotsRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

const PORT = Number(config.port);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 Network: http://192.168.18.8:${PORT}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
});

export default app;