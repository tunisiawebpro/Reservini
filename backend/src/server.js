import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Import routes
import authRouter from './routes/auth.js';
import productRouter from './routes/products.js';
import cartRouter from './routes/cart.js';
import orderRouter from './routes/order.js';
import adminRouter from './routes/admin.js';

// Load environment variables
dotenv.config();

// Initialize Prisma
export const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Security Middleware
app.use(helmet()); // Sets secure HTTP headers (XSS, Clickjacking, etc.)
app.use(cookieParser(process.env.COOKIE_SECRET)); // Secure cookie parsing

// 2. CORS Configuration (Allows Vercel + Localhost for development)
const allowedOrigins = [
  'https://reservini-omega.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://192.168.1.198:5173',
  'null' // يسمح بفتح الملفات محلياً مباشرة
];

app.use(cors({
  origin: function (origin, callback) {
    // السماح بالاتصال إذا لم يكن هناك origin (مثل بعض التطبيقات) أو إذا كان في القائمة
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://192.168.')) {
      callback(null, true);
    } else {
      console.log('⚠️ CORS bloqué pour:', origin);
      callback(null, true); // On laisse passer en dev pour éviter les blocages
    }
  },
  credentials: true, // Allow cookies to be sent
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// 3. Body Parsing (Limit payload size to prevent DoS attacks)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Rate Limiting (Protect auth routes from brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { error: "Too many attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// 5. Health Check Route (For Vercel/Deployment monitoring)
app.get('/api/v1/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ 
      status: 'OK', 
      database: 'Connected', 
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      database: 'Disconnected', 
      error: error.message 
    });
  }
});

// 6. API Routes
app.use('/api/v1/auth', authLimiter, authRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/admin', adminRouter);

// 7. Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// 8. Start Server
app.listen(PORT, () => {
  console.log(`🚀 Reservini API running on http://localhost:${PORT}`);
  console.log(`🔗 Frontend allowed: ${process.env.FRONTEND_URL}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('\n🛑 Database disconnected. Server shutting down.');
  process.exit(0);
});