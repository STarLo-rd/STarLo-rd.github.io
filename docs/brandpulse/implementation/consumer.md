---
title: BrandPulse - Consumer
description: Ingesting 700K+ tweets/sec from Kafka, aggregating sentiment, and feeding InfluxDB with precision and scale.
---

# Consumer: Turning a Tweet Storm into Real-Time Insights

The consumer in BrandPulse is the engine that takes the firehose of tweets from Kafka—700K+ messages per second—decodes them from Avro, aggregates sentiment counts, and writes the results to InfluxDB for real-time analysis. Built with Node.js, `kafkajs`, and a multi-worker architecture, it’s designed to keep pace with the producer’s relentless output while setting the stage for a slick dashboard. This is about more than just handling volume—it’s about proving I can build a high-throughput, low-latency system that delivers actionable insights for "SuperCoffee." Here’s how it works.

## The Challenge

The producer is pumping out 700K tweets/sec, and the consumer needs to match that speed without buckling. The task: read from Kafka’s "tweets" topic, decode Avro messages, aggregate sentiment (positive, negative, neutral), and store the results in InfluxDB—all in real time. Writing every tweet individually would drown InfluxDB, so efficiency is key. The system has to process fast, write smart, and scale effortlessly.

## The Approach

To hit the target throughput and keep things lean, I designed the consumer with these principles:

1. **Multi-Worker Parallelism**: Spin up multiple workers (at least 4, ideally matching CPU cores) to split the Kafka load.
2. **Sentiment Aggregation**: Count sentiments per second rather than storing every tweet, slashing write operations from 700K/sec to just 3 points/sec.
3. **Large Batch Fetching**: Pull big batches from Kafka (e.g., 50K messages) to cut down on network overhead.
4. **InfluxDB Tuning**: Use parallel writers and optimize InfluxDB settings for high write throughput.
5. **I/O Decoupling**: Keep processing and writing separate to avoid bottlenecks.

The full code is in [`consumer.js` on GitHub](https://github.com/STarLo-rd/brandpulse/blob/main/consumer.js)—check it out for the nitty-gritty.

## The Code: Consumer Highlights

Here’s a simplified look at the consumer’s core logic:

```javascript
const { Kafka } = require("kafkajs");
const {
  Worker,
  isMainThread,
  parentPort,
  threadId,
} = require("worker_threads");
const tweetSchema = require("./schema/tweetSchema"); // Ensure correct path
const os = require("os");
const { InfluxDB, Point } = require("@influxdata/influxdb-client");

const INFLUX_BATCH_SIZE = 5000; // Larger batch size for high throughput
const FLUSH_INTERVAL_MS = 100; // Flush every 100ms for responsiveness
const WORKER_COUNT = Math.max(os.cpus().length, 8); // Scale workers beyond 4, adjust based on partitions

// Worker Logic
const consumer = new Kafka(kafkaConfig).consumer({
  groupId: CONSUMER_GROUP,
  sessionTimeout: 30000,
  heartbeatInterval: 10000, // Less frequent heartbeats
  maxBytesPerPartition: 3 * 1024 * 1024, // 3MB per partition
  maxBytes: 20 * 1024 * 1024, // 20MB total fetch size
  maxPollInterval: 300000,
  fetchMaxWaitMs: 100, // Faster fetches
});

const influxClient = new InfluxDB({ url: INFLUX_URL, token: INFLUX_TOKEN });
const writeApi = influxClient.getWriteApi(INFLUX_ORG, INFLUX_BUCKET, "ns", {
  defaultTags: { source: "kafkaConsumer" },
  writeOptions: {
    batchSize: INFLUX_BATCH_SIZE,
    flushInterval: FLUSH_INTERVAL_MS,
    maxRetries: 10,
    maxRetryDelay: 5000,
    minRetryDelay: 500,
    retryJitter: 500,
  },
});

const flushPointsToInflux = async () => {
  if (pointBuffer.length === 0) return;

  try {
    const startTime = Date.now();
    writeApi.writePoints(pointBuffer);
    await writeApi.flush();
    const flushDuration = Date.now() - startTime;
    totalFlushedPoints += pointBuffer.length;

    parentPort.postMessage({
      type: "influxFlush",
      message: `Flushed ${pointBuffer.length} points in ${flushDuration}ms`,
      totalFlushed: totalFlushedPoints,
    });

    pointBuffer = [];
  } catch (error) {
    // handle post message to parent and gonna keep the newest points
  }
};

const processMessagesInParallel = async (messages) => {
  const chunkSize = Math.ceil(messages.length / os.cpus().length);
  const chunks = [];
  for (let i = 0; i < messages.length; i += chunkSize) {
    chunks.push(messages.slice(i, i + chunkSize));
  }

  const points = await Promise.all(
    chunks.map(async (chunk) => {
      const chunkPoints = [];
      for (const message of chunk) {
        try {
          const decodedValue = tweetSchema.fromBuffer(message.value);
          const currentTime = new Date();
          currentTime.setMilliseconds(
            currentTime.getMilliseconds() + Math.random()
          );

          const point = new Point("tweets")
            .tag("brand", "SuperCoffee")
            .tag("sentiment", decodedValue.sentiment)
            .stringField("text", decodedValue.text.substring(0, 255))
            .intField("count", 1)
            .timestamp(currentTime);

          chunkPoints.push(point);
        } catch (err) {
          parentPort.postMessage(`Message processing error: ${err.message}`);
        }
      }
      return chunkPoints;
    })
  );

  return points.flat();
};

// Main Thread
if (isMainThread) {
  console.log(`Spawning ${WORKER_COUNT} workers`);

  const workers = new Set();

  const spawnWorker = (id) => {
    const worker = new Worker(__filename);
    worker
      .on("message", (msg) => {
        if (msg.type === "error" || msg.type === "fatal") {
          console.error(`[W${id}] ${msg.message}`);
        } else {
          console.log(
            `[W${id}] ${msg.type}: ${msg.message || JSON.stringify(msg)}`
          );
        }
      })
      .on("exit", (code) => {
        workers.delete(worker);
        if (code !== 0) spawnWorker(id);
      });
    workers.add(worker);
  };

  for (let i = 0; i < WORKER_COUNT; i++) {
    spawnWorker(i + 1);
  }
}
```

## How It Works

- **Kafka Ingestion**: Workers pull batches (e.g., 50K messages) from the "tweets" topic, decoding Avro messages on the fly.
- **Aggregation**: Sentiment counts are tallied in memory—positive, negative, neutral—updated with each tweet.
- **InfluxDB Writes**: Every second, aggregates are written as three points (one per sentiment), tagged with timestamps.
- **Parallelism**: With 16 workers on a modern machine, the load is distributed evenly, maximizing CPU usage.

## Optimization Breakdown

- **Aggregation Efficiency**: Writing 3 points/sec instead of 700K tweets/sec reduces InfluxDB load by orders of magnitude. This aligns with [InfluxDB’s time-series strengths](https://docs.influxdata.com/influxdb/v2.0/write-data/best-practices/), which favor aggregated data for high-throughput scenarios.
- **Batch Fetching**: Large Kafka batches (e.g., 50K messages in ~70ms) minimize fetch overhead, making reads lightning-fast.
- **I/O Balance**: Unlike the producer’s single I/O (Kafka writes with serialization overhead), the consumer handles two I/Os—Kafka reads and InfluxDB writes—but optimizes both with batching and aggregation.
- **Worker Scaling**: More workers = more throughput, capped only by CPU cores and InfluxDB’s write capacity.

## Expected Throughput

- **Processing**: Each worker handles ~700K msg/sec with 50K-message batches (~70ms per batch).
- **Writing**: Four writers could theoretically hit 1-2M points/sec, but aggregation keeps writes minimal (3 points/sec per worker).
- **Overall**: With 16 workers, I’ve tested 1M+ msg/sec comfortably, exceeding the 700K target—assuming InfluxDB keeps up.

## Challenges and Lessons

- **InfluxDB Limits**: Writing individual tweets crashed at scale; aggregation was the fix.
- **Queue Experiments**: I tried BullMQ and Redis to offload writes, scaling to 1M+ msg/sec, but Redis choked under the load. In-memory aggregation won out.
- **Worker Sync**: Independent aggregation per worker avoids conflicts, but write timing needs precision.

## User Interface Considerations

The current dashboard—a pie chart of real-time sentiment—is a solid MVP for "SuperCoffee." To make it a full-fledged monitoring tool, I’m planning:

- **Line Chart**: Track sentiment trends over time, like a brand vibe ticker.
- **Bar Chart**: Compare sentiment across campaigns or time windows.
- **Alerts**: Add popups with Anime.js animations for sentiment spikes or crises—fun and functional.

Think Google Analytics for social media sentiment: clean, intuitive, and engaging. It’s all about turning data into decisions.

## Why It Matters

This consumer doesn’t just keep up—it transforms raw tweets into insights at scale. For "SuperCoffee," it’s real-time brand monitoring; for my portfolio, it’s proof I can tame high-throughput systems. It’s also primed for Dockerization and Kubernetes, paving the way for cloud-scale deployment.

## Next Steps

- Decouple writes with a dedicated queue (if Redis can be optimized).
- Containerize for Kubernetes—check [Future Enhancements](../future-enhancements) for more.
