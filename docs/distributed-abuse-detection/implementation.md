# Implementation Details

## 🚀 Development Journey

The Distributed Abuse Detection System was built using modern cloud-native technologies with a focus on scalability, performance, and maintainability. This document outlines the key implementation decisions, technical challenges, and solutions developed during the project.

## 🛠️ Core Implementation

### 1. API Gateway Implementation

#### Express.js with TypeScript
```typescript
import express from 'express';
import { KafkaProducer } from './kafka/producer';
import { RateLimiter } from './middleware/rateLimiter';
import { AuthMiddleware } from './middleware/auth';

class ModerationAPIGateway {
  private app: express.Application;
  private producer: KafkaProducer;
  private rateLimiter: RateLimiter;

  constructor() {
    this.app = express();
    this.producer = new KafkaProducer();
    this.rateLimiter = new RateLimiter();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(AuthMiddleware.validate);
    this.app.use(this.rateLimiter.middleware);
  }

  private setupRoutes(): void {
    this.app.post('/api/v1/moderate', async (req, res) => {
      try {
        const contentEvent = this.validateContentEvent(req.body);
        await this.producer.publishContent(contentEvent);
        
        res.status(202).json({
          status: 'accepted',
          contentId: contentEvent.id,
          message: 'Content submitted for moderation'
        });
      } catch (error) {
        this.handleError(error, res);
      }
    });
  }

  private validateContentEvent(body: any): ContentEvent {
    // Comprehensive validation logic
    if (!body.content || !body.contentType) {
      throw new ValidationError('Missing required fields');
    }
    
    return {
      id: generateUUID(),
      userId: body.userId,
      contentType: body.contentType,
      content: body.content,
      metadata: {
        timestamp: new Date(),
        source: body.source || 'api',
        priority: body.priority || 'normal'
      }
    };
  }
}
```

#### Rate Limiting with Redis
```typescript
import Redis from 'ioredis';

export class RateLimiter {
  private redis: Redis;
  private windowSize: number = 3600; // 1 hour
  private maxRequests: number = 1000;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3
    });
  }

  async middleware(req: Request, res: Response, next: NextFunction) {
    const key = `rate_limit:${req.ip}:${Math.floor(Date.now() / 1000 / this.windowSize)}`;
    
    try {
      const current = await this.redis.incr(key);
      
      if (current === 1) {
        await this.redis.expire(key, this.windowSize);
      }
      
      if (current > this.maxRequests) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          retryAfter: this.windowSize
        });
      }
      
      res.setHeader('X-RateLimit-Limit', this.maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, this.maxRequests - current));
      
      next();
    } catch (error) {
      console.error('Rate limiting error:', error);
      next(); // Fail open - don't block requests on Redis errors
    }
  }
}
```

### 2. Kafka Integration

#### Producer Implementation
```typescript
import { Kafka, Producer, ProducerRecord } from 'kafkajs';

export class KafkaProducer {
  private kafka: Kafka;
  private producer: Producer;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'moderation-api-gateway',
      brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
      retry: {
        initialRetryTime: 100,
        retries: 8
      }
    });
    
    this.producer = this.kafka.producer({
      maxInFlightRequests: 1,
      idempotent: true,
      transactionTimeout: 30000
    });
  }

  async publishContent(contentEvent: ContentEvent): Promise<void> {
    const record: ProducerRecord = {
      topic: 'raw-content',
      partition: this.getPartition(contentEvent.userId),
      messages: [{
        key: contentEvent.id,
        value: JSON.stringify(contentEvent),
        headers: {
          'content-type': contentEvent.contentType,
          'user-id': contentEvent.userId,
          'timestamp': contentEvent.metadata.timestamp.toISOString()
        }
      }]
    };

    await this.producer.send(record);
  }

  private getPartition(userId: string): number {
    // Consistent hashing for user-based partitioning
    const hash = this.simpleHash(userId);
    return hash % 12; // 12 partitions
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}
```

#### Consumer Implementation
```typescript
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';

export class ContentConsumer {
  private kafka: Kafka;
  private consumer: Consumer;
  private processor: ContentProcessor;

  constructor(groupId: string, processor: ContentProcessor) {
    this.kafka = new Kafka({
      clientId: `${groupId}-consumer`,
      brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092']
    });
    
    this.consumer = this.kafka.consumer({
      groupId,
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
      maxBytesPerPartition: 1048576, // 1MB
      minBytes: 1,
      maxBytes: 10485760, // 10MB
      maxWaitTimeInMs: 5000
    });
    
    this.processor = processor;
  }

  async start(): Promise<void> {
    await this.consumer.connect();
    await this.consumer.subscribe({ 
      topic: 'raw-content',
      fromBeginning: false 
    });

    await this.consumer.run({
      partitionsConsumedConcurrently: 3,
      eachMessage: async (payload: EachMessagePayload) => {
        await this.processMessage(payload);
      }
    });
  }

  private async processMessage(payload: EachMessagePayload): Promise<void> {
    const { message, partition, topic } = payload;
    
    try {
      const contentEvent = JSON.parse(message.value?.toString() || '{}');
      const result = await this.processor.process(contentEvent);
      
      // Publish result to results topic
      await this.publishResult(result);
      
      // Commit offset after successful processing
      await this.consumer.commitOffsets([{
        topic,
        partition,
        offset: (parseInt(message.offset) + 1).toString()
      }]);
      
    } catch (error) {
      console.error('Message processing error:', error);
      // Implement dead letter queue logic here
      await this.handleProcessingError(payload, error);
    }
  }
}
```

### 3. ML Model Integration

#### Text Moderation with TensorFlow.js
```javascript
const tf = require('@tensorflow/tfjs-node');
const toxicity = require('@tensorflow-models/toxicity');

class TextModerationService {
  constructor() {
    this.model = null;
    this.threshold = 0.85;
    this.initializeModel();
  }

  async initializeModel() {
    try {
      // Load the toxicity model
      this.model = await toxicity.load(this.threshold, [
        'identity_attack',
        'insult',
        'obscene',
        'severe_toxicity',
        'sexual_explicit',
        'threat',
        'toxicity'
      ]);
      
      console.log('Text moderation model loaded successfully');
    } catch (error) {
      console.error('Failed to load text moderation model:', error);
      throw error;
    }
  }

  async moderateText(text) {
    if (!this.model) {
      throw new Error('Model not initialized');
    }

    try {
      const predictions = await this.model.classify([text]);
      
      const results = predictions.map(prediction => ({
        label: prediction.label,
        match: prediction.results[0].match,
        probability: prediction.results[0].probabilities[1]
      }));

      const highConfidenceFlags = results.filter(r => r.match && r.probability > this.threshold);
      
      return {
        text,
        flags: highConfidenceFlags,
        overallToxicity: Math.max(...results.map(r => r.probability)),
        action: this.determineAction(highConfidenceFlags),
        processingTime: Date.now()
      };
    } catch (error) {
      console.error('Text moderation error:', error);
      throw error;
    }
  }

  determineAction(flags) {
    if (flags.length === 0) return 'approve';
    
    const severityMap = {
      'severe_toxicity': 10,
      'threat': 9,
      'identity_attack': 8,
      'sexual_explicit': 7,
      'obscene': 6,
      'insult': 5,
      'toxicity': 4
    };

    const maxSeverity = Math.max(...flags.map(f => severityMap[f.label] || 0));
    
    if (maxSeverity >= 8) return 'block';
    if (maxSeverity >= 6) return 'review';
    return 'flag';
  }
}
```

#### Image Moderation with ONNX Runtime
```javascript
const ort = require('onnxruntime-node');
const sharp = require('sharp');

class ImageModerationService {
  constructor() {
    this.session = null;
    this.inputSize = 224;
    this.initializeModel();
  }

  async initializeModel() {
    try {
      this.session = await ort.InferenceSession.create('./models/nsfw_detector.onnx');
      console.log('Image moderation model loaded successfully');
    } catch (error) {
      console.error('Failed to load image moderation model:', error);
      throw error;
    }
  }

  async moderateImage(imageBuffer) {
    if (!this.session) {
      throw new Error('Model not initialized');
    }

    try {
      // Preprocess image
      const preprocessed = await this.preprocessImage(imageBuffer);
      
      // Create input tensor
      const inputTensor = new ort.Tensor('float32', preprocessed, [1, 3, this.inputSize, this.inputSize]);
      
      // Run inference
      const feeds = { input: inputTensor };
      const results = await this.session.run(feeds);
      
      // Process results
      const output = results.output.data;
      const classes = ['safe', 'suggestive', 'explicit', 'violent'];
      
      const predictions = classes.map((className, index) => ({
        class: className,
        confidence: output[index]
      }));

      const maxPrediction = predictions.reduce((max, pred) => 
        pred.confidence > max.confidence ? pred : max
      );

      return {
        predictions,
        primaryClass: maxPrediction.class,
        confidence: maxPrediction.confidence,
        action: this.determineImageAction(maxPrediction),
        processingTime: Date.now()
      };
    } catch (error) {
      console.error('Image moderation error:', error);
      throw error;
    }
  }

  async preprocessImage(imageBuffer) {
    try {
      // Resize and normalize image
      const resized = await sharp(imageBuffer)
        .resize(this.inputSize, this.inputSize)
        .removeAlpha()
        .raw()
        .toBuffer();

      // Convert to float32 and normalize to [0, 1]
      const float32Array = new Float32Array(resized.length);
      for (let i = 0; i < resized.length; i++) {
        float32Array[i] = resized[i] / 255.0;
      }

      // Rearrange from HWC to CHW format
      const chw = new Float32Array(3 * this.inputSize * this.inputSize);
      const pixelCount = this.inputSize * this.inputSize;
      
      for (let i = 0; i < pixelCount; i++) {
        chw[i] = float32Array[i * 3];                    // R channel
        chw[pixelCount + i] = float32Array[i * 3 + 1];   // G channel
        chw[2 * pixelCount + i] = float32Array[i * 3 + 2]; // B channel
      }

      return chw;
    } catch (error) {
      console.error('Image preprocessing error:', error);
      throw error;
    }
  }

  determineImageAction(prediction) {
    const { class: className, confidence } = prediction;
    
    if (className === 'explicit' && confidence > 0.8) return 'block';
    if (className === 'violent' && confidence > 0.7) return 'block';
    if (className === 'suggestive' && confidence > 0.9) return 'review';
    if (confidence < 0.5) return 'approve';
    
    return 'review';
  }
}
```

### 4. Database Integration

#### PostgreSQL with Connection Pooling
```typescript
import { Pool, PoolClient } from 'pg';

export class DatabaseService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      statement_timeout: 30000,
      query_timeout: 30000
    });

    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  async saveModerationResult(result: ModerationResult): Promise<void> {
    const client: PoolClient = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Insert moderation result
      await client.query(
        `INSERT INTO moderation_results 
         (content_id, user_id, content_type, moderation_status, confidence_score, flags, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          result.contentId,
          result.userId,
          result.contentType,
          result.status,
          result.confidence,
          JSON.stringify(result.flags)
        ]
      );

      // Insert audit log
      await client.query(
        `INSERT INTO audit_logs 
         (content_id, action, reason, automated, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [
          result.contentId,
          result.action,
          result.reason,
          true
        ]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getPerformanceMetrics(timeRange: string): Promise<PerformanceMetric[]> {
    const query = `
      SELECT 
        worker_type,
        AVG(processing_time_ms) as avg_processing_time,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY processing_time_ms) as p95_processing_time,
        COUNT(*) as total_processed
      FROM performance_metrics 
      WHERE timestamp > NOW() - INTERVAL '${timeRange}'
      GROUP BY worker_type
      ORDER BY worker_type
    `;

    const result = await this.pool.query(query);
    return result.rows;
  }
}
```

### 5. Monitoring and Observability

#### Prometheus Metrics Integration
```typescript
import { register, Counter, Histogram, Gauge } from 'prom-client';

export class MetricsService {
  private contentProcessedCounter: Counter<string>;
  private processingDurationHistogram: Histogram<string>;
  private activeConnectionsGauge: Gauge<string>;
  private errorCounter: Counter<string>;

  constructor() {
    this.contentProcessedCounter = new Counter({
      name: 'content_processed_total',
      help: 'Total number of content items processed',
      labelNames: ['content_type', 'action', 'worker_type']
    });

    this.processingDurationHistogram = new Histogram({
      name: 'content_processing_duration_seconds',
      help: 'Duration of content processing',
      labelNames: ['content_type', 'worker_type'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
    });

    this.activeConnectionsGauge = new Gauge({
      name: 'active_connections',
      help: 'Number of active connections',
      labelNames: ['service']
    });

    this.errorCounter = new Counter({
      name: 'errors_total',
      help: 'Total number of errors',
      labelNames: ['service', 'error_type']
    });

    register.registerMetric(this.contentProcessedCounter);
    register.registerMetric(this.processingDurationHistogram);
    register.registerMetric(this.activeConnectionsGauge);
    register.registerMetric(this.errorCounter);
  }

  recordContentProcessed(contentType: string, action: string, workerType: string): void {
    this.contentProcessedCounter.inc({ content_type: contentType, action, worker_type: workerType });
  }

  recordProcessingDuration(contentType: string, workerType: string, duration: number): void {
    this.processingDurationHistogram.observe({ content_type: contentType, worker_type: workerType }, duration);
  }

  setActiveConnections(service: string, count: number): void {
    this.activeConnectionsGauge.set({ service }, count);
  }

  recordError(service: string, errorType: string): void {
    this.errorCounter.inc({ service, error_type: errorType });
  }

  getMetrics(): string {
    return register.metrics();
  }
}
```

#### Distributed Tracing with OpenTelemetry
```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

const jaegerExporter = new JaegerExporter({
  endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces'
});

const sdk = new NodeSDK({
  traceExporter: jaegerExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-kafka': {
        enabled: true
      },
      '@opentelemetry/instrumentation-pg': {
        enabled: true
      },
      '@opentelemetry/instrumentation-redis': {
        enabled: true
      }
    })
  ]
});

sdk.start();
```

## 🧪 Testing Strategy

### Unit Testing
```typescript
import { TextModerationService } from '../src/services/textModeration';

describe('TextModerationService', () => {
  let service: TextModerationService;

  beforeAll(async () => {
    service = new TextModerationService();
    await service.initializeModel();
  });

  describe('moderateText', () => {
    it('should flag toxic content', async () => {
      const result = await service.moderateText('You are stupid and ugly');
      
      expect(result.action).toBe('flag');
      expect(result.flags.length).toBeGreaterThan(0);
      expect(result.overallToxicity).toBeGreaterThan(0.5);
    });

    it('should approve clean content', async () => {
      const result = await service.moderateText('This is a nice day');
      
      expect(result.action).toBe('approve');
      expect(result.flags.length).toBe(0);
      expect(result.overallToxicity).toBeLessThan(0.3);
    });

    it('should handle empty content', async () => {
      const result = await service.moderateText('');
      
      expect(result.action).toBe('approve');
      expect(result.flags.length).toBe(0);
    });
  });
});
```

### Integration Testing
```typescript
import { KafkaProducer } from '../src/kafka/producer';
import { ContentConsumer } from '../src/kafka/consumer';

describe('Kafka Integration', () => {
  let producer: KafkaProducer;
  let consumer: ContentConsumer;

  beforeAll(async () => {
    producer = new KafkaProducer();
    consumer = new ContentConsumer('test-group', mockProcessor);
    
    await producer.connect();
    await consumer.start();
  });

  afterAll(async () => {
    await producer.disconnect();
    await consumer.stop();
  });

  it('should process messages end-to-end', async () => {
    const testContent = {
      id: 'test-123',
      userId: 'user-456',
      contentType: 'text',
      content: 'Test message',
      metadata: {
        timestamp: new Date(),
        source: 'test',
        priority: 'normal'
      }
    };

    await producer.publishContent(testContent);
    
    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify processing occurred
    expect(mockProcessor.process).toHaveBeenCalledWith(testContent);
  });
});
```

This implementation showcases enterprise-grade patterns including proper error handling, monitoring, testing, and scalable architecture design suitable for high-throughput content moderation systems. 