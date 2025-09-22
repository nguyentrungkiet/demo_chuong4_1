import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

import { config } from './config';
import deviceRoutes from './routes/devices';
import historyRoutes from './routes/history';
import thresholdRoutes from './routes/thresholds';
import alertRoutes from './routes/alerts';
import { MqttBridgeService } from './services/mqttBridge';
import { WebSocketMockService } from './services/webSocketMock';

const app: Express = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (config.nodeEnv !== 'test') {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
  });
});

// API routes
app.use('/api/devices', deviceRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/thresholds', thresholdRoutes);
app.use('/api/alerts', alertRoutes);

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
    timestamp: Date.now(),
  });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: config.nodeEnv === 'production' ? 'Internal server error' : err.message,
    timestamp: Date.now(),
  });
});

// Initialize services
let mqttBridge: MqttBridgeService | null = null;
let webSocketMock: WebSocketMockService | null = null;

async function initializeServices() {
  try {
    // Initialize MQTT Bridge Service
    console.log('🔌 Initializing MQTT Bridge Service...');
    mqttBridge = new MqttBridgeService();
    await mqttBridge.connect();
    console.log('✅ MQTT Bridge Service connected');

    // Initialize WebSocket Mock Service if enabled
    console.log('🔌 Initializing WebSocket Mock Service...');
    webSocketMock = new WebSocketMockService(config.wsMockPort);
    await webSocketMock.start();
    console.log(`✅ WebSocket Mock Service started on port ${config.wsMockPort}`);
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    
    // In development, continue without MQTT if connection fails
    if (config.nodeEnv === 'development') {
      console.warn('⚠️  Running in development mode without MQTT connection');
    } else {
      process.exit(1);
    }
  }
}

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  console.log(`\n📴 Received ${signal}. Shutting down gracefully...`);
  
  try {
    // Close MQTT connection
    if (mqttBridge) {
      await mqttBridge.disconnect();
      console.log('✅ MQTT Bridge Service disconnected');
    }
    
    // Close WebSocket mock service
    if (webSocketMock) {
      await webSocketMock.stop();
      console.log('✅ WebSocket Mock Service stopped');
    }
    
    console.log('👋 Shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
async function startServer() {
  try {
    // Initialize services first
    await initializeServices();
    
    // Start HTTP server
    const server = app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`📊 Environment: ${config.nodeEnv}`);
      console.log(`🌐 CORS origin: ${config.corsOrigin}`);
      console.log(`📡 MQTT broker: ${config.mqttBrokerUrl}`);
      
      
      console.log(`🔌 WebSocket mock: ws://localhost:${config.wsMockPort}`);
      
      console.log('\n💡 API Endpoints:');
      console.log('   GET  /health');
      console.log('   GET  /api/devices');
      console.log('   POST /api/devices');
      console.log('   GET  /api/devices/:deviceId');
      console.log('   PUT  /api/devices/:deviceId');
      console.log('   DELETE /api/devices/:deviceId');
      console.log('   GET  /api/history/:deviceId');
      console.log('   POST /api/history/:deviceId');
      console.log('   GET  /api/thresholds');
      console.log('   POST /api/thresholds');
      console.log('   PUT  /api/thresholds/:thresholdId');
      console.log('   DELETE /api/thresholds/:thresholdId');
      console.log('   GET  /api/alerts');
      console.log('   POST /api/alerts');
      console.log('   GET  /api/alerts/:alertId');
      console.log('   POST /api/alerts/:alertId/ack');
      console.log('   DELETE /api/alerts/:alertId');
      console.log('\n🎯 Ready for IoT connections!');
    });
    
    // Handle server shutdown
    server.on('close', () => {
      console.log('🛑 HTTP server closed');
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the application
if (require.main === module) {
  startServer().catch((error) => {
    console.error('❌ Startup error:', error);
    process.exit(1);
  });
}

export { app };
export default app;