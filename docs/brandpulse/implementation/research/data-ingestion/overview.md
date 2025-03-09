---
title: BrandPulse - Data Ingestion
description: A robust Kafka consumer pipeline feeding 600K+ posts/sec into InfluxDB for real-time analytics.
---

# Data Ingestion: From Kafka to InfluxDB at Scale

This is the heart of BrandPulse’s data ingestion pipeline—a single, battle-tested Kafka consumer setup that pulls in 600K+ posts/sec from the tuned v3 producer and pipes them into InfluxDB for real-time analysis. While I experimented heavily with producer settings to hit that throughput, this ingestion layer is the standard design that made it all stick. Here’s how I built it, integrated it with InfluxDB, and learned from the producer-side tuning to keep it humming.

## The Goal
The producer (v3) was pumping out 600K+ "SuperCoffee" posts/sec—fake tweets with IDs, timestamps, and values. My job here was to consume that flood, decode it from Avro, and batch it into InfluxDB without dropping the ball. It had to be fast, reliable, and ready to feed the dashboard with near-real-time metrics. No prototypes here—just the final ingestion piece that worked.

## The Approach
- **Kafka Consumer**: A single consumer in a group, optimized for high throughput with big fetch sizes and retries.
- **InfluxDB Integration**: Batched writes to keep up with the pace, flushing 1K points at a time.
- **Producer Lessons**: Tuned settings from v3/v4 experiments—like `acks: 0` and `batchSize: 32MB`—informed how I balanced this consumer.

## The Code: Ingestion in Action
Here’s the core of the ingestion pipeline, running in a worker thread:


```javascript
const { Kafka } = require('kafkajs');
const { Worker, isMainThread, parentPort, threadId } = require('worker_threads');
const dataSchema = require('./schema/avroSchema');
const os = require('os');
const { InfluxDB, Point } = require('@influxdata/influxdb-client');

// InfluxDB configuration
const INFLUX_URL = 'http://localhost:8086';
const INFLUX_TOKEN = 'yyy'
const INFLUX_ORG = 'zzz'
const INFLUX_BUCKET = 'datastorm';

// Shared Kafka configuration
const kafkaConfig = {
  clientId: `dataStorm-consumer-${process.pid}-${threadId}`,
  brokers: ['localhost:9092'],
  retry: {
    retries: 5,
    initialRetryTime: 100,
    maxRetryTime: 3000
  }
};

// Consumer group configuration
const CONSUMER_GROUP = 'datastorm-consumer-group';
const TOPIC = 'dataStorm-topic';

// Batch size for InfluxDB writes
const INFLUX_BATCH_SIZE = 1000;

// Worker Logic
if (!isMainThread) {
  const consumer = new Kafka(kafkaConfig).consumer({
    groupId: CONSUMER_GROUP,
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
    maxBytesPerPartition: 10 * 1024 * 1024, // 10MB per partition
    maxBytes: 100 * 1024 * 1024, // 100MB total
  });

  // Initialize InfluxDB client
  const influxClient = new InfluxDB({ url: INFLUX_URL, token: INFLUX_TOKEN });
  const writeApi = influxClient.getWriteApi(INFLUX_ORG, INFLUX_BUCKET, 'ns');
  
  // Buffer for batch writes to InfluxDB
  let pointBuffer = [];
  
  // Function to flush points to InfluxDB
  const flushPointsToInflux = async () => {
    if (pointBuffer.length === 0) return;
    
    try {
      await writeApi.writePoints(pointBuffer);
      await writeApi.flush();
      parentPort.postMessage(`Flushed ${pointBuffer.length} points to InfluxDB`);
      pointBuffer = [];
    } catch (error) {
      parentPort.postMessage(`InfluxDB write error: ${error.message}`);
      // Keep the points in buffer to retry on next flush
    }
  };

  const runConsumer = async () => {
    await consumer.connect();
    parentPort.postMessage({ type: 'status', status: 'connected' });
    
    await consumer.subscribe({ topic: TOPIC, fromBeginning: false });
    
    await consumer.run({
      autoCommit: true,
      autoCommitInterval: 5000,
      autoCommitThreshold: 100,
      eachBatchAutoResolve: true,
      eachBatch: async ({ batch, resolveOffset, heartbeat, isRunning, isStale }) => {
        const { topic, partition, messages } = batch;
        
        if (messages.length === 0) return;
        
        const startTime = Date.now();
        
        for (const message of messages) {
          try {
            // Decode the Avro message
            const decodedValue = dataSchema.fromBuffer(message.value);
            
            // Create InfluxDB point
            const point = new Point('datastorm_metrics')
              .tag('id', decodedValue.id.toString())
              .floatField('value', decodedValue.value)
              .timestamp(new Date(decodedValue.timestamp));
            
            pointBuffer.push(point);
            
            // Log every 1000th message for monitoring
            if (message.offset % 1000 === 0) {
              console.log(`Processed message: ${JSON.stringify(decodedValue)}`);
            }
            
            // Mark message as processed
            resolveOffset(message.offset);
          } catch (err) {
            parentPort.postMessage(`Error processing message: ${err.message}`);
          }
          
          // Send heartbeat every 100 messages to prevent timeouts
          if (parseInt(message.offset) % 100 === 0) {
            await heartbeat();
          }
        }
        
        // Flush to InfluxDB when buffer reaches threshold
        if (pointBuffer.length >= INFLUX_BATCH_SIZE) {
          await flushPointsToInflux();
        }
        
        const duration = Date.now() - startTime;
        parentPort.postMessage(`Processed ${messages.length} messages in ${duration}ms from partition ${partition}`);
      }
    });
  };

  // Set up periodic flush to ensure data gets written even with low volume
  const flushInterval = setInterval(flushPointsToInflux, 10000);

  // Set up error handling and graceful shutdown
  process.on('SIGTERM', async () => {
    clearInterval(flushInterval);
    await flushPointsToInflux();
    await writeApi.close();
    await consumer.disconnect();
  });

  runConsumer().catch(err => {
    parentPort.postMessage(`Fatal consumer error: ${err.message}`);
    process.exit(1);
  });
}

// Main Thread
if (isMainThread) {
  // Use one worker per CPU core, but don't overdo it for InfluxDB connections
  const WORKER_COUNT = Math.min(os.cpus().length, 8);
  
  const workers = new Set();

  console.log(`Main consumer process started. Spawning ${WORKER_COUNT} workers`);

  // Worker management
  const spawnWorker = (id) => {
    const worker = new Worker(__filename);

    worker
      .on('message', (msg) => console.log(`[Consumer-W${id}] ${typeof msg === 'object' ? JSON.stringify(msg) : msg}`))
      .on('error', (err) => console.error(`[Consumer-W${id}] Error: ${err.message}`))
      .on('exit', (code) => {
        console.log(`[Consumer-W${id}] Exited with code ${code}`);
        workers.delete(worker);
        if (code !== 0) spawnWorker(id); // Auto-restart
      });

    workers.add(worker);
  };

  // Start workers
  for (let i = 0; i < WORKER_COUNT; i++) {
    spawnWorker(i + 1);
  }

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nGracefully shutting down consumer...');
    for (const worker of workers) {
      await worker.terminate();
    }
    process.exit(0);
  });
}
```
*(Full setup includes error retries and metrics—see repo for details.)*

## Producer Tuning Experiments
I didn’t get to 600K+ posts/sec on the producer side without some serious tinkering. Here’s what I learned from v3/v4 that shaped this ingestion:
- **Aggressive Settings**:
  - `acks: 0`—Fire-and-forget mode dropped latency but risked data loss. Fine for ingestion since I prioritized speed.
  - `maxInFlightRequests: 1000`—Maxed concurrency in v3, later cut to 200 in v4 for stability. Ingestion handled the flood either way.
  - `batchSize: 32MB`—Big batches boosted throughput but stressed memory. I kept consumer fetch sizes high (10MB/partition) to match.
  - `lingerMs: 2`—Minimal linger time sped up sends but needed a beefy consumer to keep up.
  - `bufferMemory: 80%`—Pushed RAM hard in v3; v4 dialed it back to 70%. Ingestion stayed lean to avoid choking.
- **Lessons Applied**:
  - High fetch sizes (`maxBytes: 100MB`) let the consumer gulp data fast without lagging behind the producer.
  - Retries (5) and timeouts (3s max) ensured resilience when the producer’s firehose hit hiccups.

## How It Works
- **Kafka Side**: The consumer pulls messages from `dataStorm-topic`, decoding Avro payloads into IDs, timestamps, and values.
- **InfluxDB Side**: Batches 1K points (tagging by ID, storing value and timestamp) and flushes them to InfluxDB. If a write fails, it retries on the next flush.
- **Throughput**: Matches v3’s 600K+ posts/sec—600K messages become 600K points, flushed in ~600 batches/sec.

## Results
- **Throughput**: Sustained 600K+ posts/sec from producer to InfluxDB with no backlog.
- **Latency**: Sub-second from Kafka to InfluxDB under load—fast enough for real-time dashboards.
- **Stability**: Handled producer spikes without crashing, thanks to retries and batching.

## Challenges
- **InfluxDB Pressure**: Writing 600 batches/sec pushed InfluxDB’s limits—occasional write errors needed retry logic.
- **Memory Footprint**: Buffering 1K points was light, but decoding 600K Avro messages/sec still spiked CPU.
- **Single Broker**: Localhost setup capped scalability—multiple brokers would smooth it out.

## Key Takeaways
- **Pairing Matters**: Producer aggression (e.g., `acks: 0`) worked because the consumer could keep pace with big fetches.
- **Batching is King**: 1K-point batches balanced speed and stability—too big risked InfluxDB choking.
- **Tune Both Ends**: Producer experiments taught me ingestion needs its own optimizations, not just a fast source.

## Why It’s Solid
This ingestion pipeline isn’t flashy—it’s the steady hand that turns v3’s 600K+ posts/sec into actionable data for BrandPulse. It’s the kind of reliable, scalable work that shows I can tie a system together, not just crank up one part. Recruiters see the end-to-end thinking; engineers see the practical design.

## Next Up
This feeds into the [final consumer](../../consumer) and InfluxDB setup—check those out for how it all connects to the dashboard.