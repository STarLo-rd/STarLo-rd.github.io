---
title: BrandPulse - Producer
description: Flooding Kafka with 700K+ tweets/sec using workers, sentiment modes, and ruthless optimization.
---

# Producer: The Engine Behind BrandPulse’s Tweet Storm

The producer in BrandPulse is the heavy hitter, built to slam out **700K+ tweets per second** into Kafka like it’s nothing. Powered by Node.js, `kafkajs`, and a multi-worker setup, it’s tuned to the edge—handling fixed sentiment ratios or volatile swings without blinking. This isn’t just about speed; it’s about proving I can craft a system that scales hard and stays adaptable. Let’s rip into what makes it roar.

## The Challenge
The goal was clear: hit 700K tweets/sec while juggling two sentiment modes—fixed and volatile—and keeping everything configurable via `.env` or CLI. It had to scale with CPU cores, pump out massive batches, and feed Kafka without a hiccup. That’s millions of tweets in motion, and I needed it to feel effortless.

## The Plan
Here’s how I tackled it:
1. **Worker Army**: Spin up at least 4 workers, scaling to `os.cpus().length`, for parallel firepower.
2. **Tweet Pool**: Pre-generate 1,000 "SuperCoffee" tweets with sentiment, then randomize from there for efficiency.
3. **Batch Barrage**: Fire 8,000-tweet batches every 1ms per worker—relentless and fast.
4. **Kafka Overdrive**: No compression, `acks: 0`, 1ms linger—pure throughput, no fluff.
5. **Mode Flexibility**: Toggle between fixed sentiment or volatile chaos, driven by `MODE` and CLI/.env settings.

## The Code: Producer in Action
The full guts live in [`producer.js` on my GitHub repo](https://github.com/STarLo-rd/brandpulse/blob/main/producer.js)—check it out for the unfiltered view. Here’s the core, stripped down to show the muscle:

```javascript
const { Kafka, Partitioners } = require("kafkajs");
const { Worker, isMainThread, parentPort } = require("worker_threads");
const os = require("os");
const { generateTweetPool, adjustBatchSentiment } = require("./tweetGenerator");
require("dotenv").config();

// Configs from CLI or .env
const MODE = process.argv[2] || process.env.MODE || "fixed";
const SENTIMENT_DISTRIBUTION = {
  positive: parseFloat(process.argv[3] || process.env.SENTIMENT_POSITIVE || 0.33),
  negative: parseFloat(process.argv[4] || process.env.SENTIMENT_NEGATIVE || 0.33),
  neutral: parseFloat(process.env.SENTIMENT_NEUTRAL || 0.34),
};
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || 8000, 10);
const BATCH_INTERVAL_MS = parseInt(process.env.BATCH_INTERVAL_MS || 1, 10);
const VOLATILITY_FACTOR = parseFloat(process.env.VOLATILITY_FACTOR || 0.8);

// Kafka setup—built for speed
const kafkaConfig = {
  clientId: `dataStorm-producer-${process.pid}-${threadId}`,
  brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
  producer: {
    compression: null,          // No overhead, just speed
    maxInFlightRequests: 1000, // High concurrency
    batchSize: 32 * 1024 * 1024, // 32MB batches
    lingerMs: 1,               // Minimal wait
    acks: 0,                   // Fire and forget
    bufferMemory: Math.min(8 * 1024 * 1024 * 1024, Math.floor(os.totalmem() * 0.9)),
  },
};

// Pre-generate tweet pool
const preSerializedTweets = generateTweetPool({
  size: 1000,
  brand: "SuperCoffee",
  sentimentDistribution: SENTIMENT_DISTRIBUTION,
  mode: MODE,
});

const generateBatch = () => {
  const baseBatch = Array(BATCH_SIZE)
    .fill(null)
    .map(() => {
      const { value } = preSerializedTweets[Math.floor(Math.random() * preSerializedTweets.length)];
      return { value: Buffer.from(value) };
    });
  return MODE === "volatile" ? adjustBatchSentiment(baseBatch, VOLATILITY_FACTOR) : baseBatch;
};

// Worker: Relentless batch pumping
if (!isMainThread) {
  const producer = new Kafka(kafkaConfig).producer();
  const runProducer = async () => {
    await producer.connect();
    while (true) {
      const batch = generateBatch();
      const startTime = Date.now();
      await producer.send({ topic: "tweets", messages: batch });
      const duration = Date.now() - startTime;
      parentPort.postMessage(`${BATCH_SIZE} in ${duration}ms`);
      await new Promise((r) => setTimeout(r, BATCH_INTERVAL_MS));
    }
  };
  runProducer().catch((err) => console.error(`Worker crashed: ${err.message}`));
}

// Main: Unleash the workers
if (isMainThread) {
  const WORKER_COUNT = Math.max(4, os.cpus().length);
  console.log(`Spawning ${WORKER_COUNT} workers | Mode: ${MODE}`);
  for (let i = 0; i < WORKER_COUNT; i++) {
    new Worker(__filename)
      .on("message", (msg) => console.log(`[W${i + 1}] ${msg}`));
  }
}
```

## Digging Deeper
The [GitHub repo](https://github.com/STarLo-rd/brandpulse) has the full codebase—`producer.js`, `tweetGenerator.js`, and all the configs. It’s where you’ll see the nitty-gritty: how I silence Kafka warnings, handle worker crashes, and wire up graceful shutdowns. Here, I’m keeping it high-level, but the repo’s got the raw details—perfect for anyone (or any recruiter) wanting to see how I stitch it all together.

## How It Works
- **Tweet Pool**: Pre-build 1,000 tweets about "SuperCoffee" with sentiment set by `MODE`. Fixed mode sticks to the user’s split (e.g., 33/33/34); volatile mode preps for batch-level chaos.
- **Batch Frenzy**: Each worker pulls 8,000 tweets from the pool, randomizing picks. Volatile mode tweaks sentiment per batch with `adjustBatchSentiment`.
- **Kafka Assault**: Batches fly every 1ms, with Kafka stripped down—32MB batches, no compression, `acks: 0`—to hit 700K+/sec.
- **Worker Scaling**: I stick to `os.cpus().length` (e.g., 8 workers on 8 cores) for balance, but I’ve pushed 24 on bigger rigs.

## Results
- **Throughput**: On my 8-core setup, I’m clocking 550K-730K tweets/sec with 8 workers (~90K/worker at peak). With 24 workers, I’ve nudged past 700K consistently—target smashed.
- **Fixed Mode**: Sentiment locks in—33% positive, 33% negative, 34% neutral—batch after batch.
- **Volatile Mode**: Sentiment goes wild—80% positive one batch, 10% the next—thanks to `VOLATILITY_FACTOR=0.8`.
- **Sample Run**: 9.4M tweets in 17 seconds, averaging 552K/sec, peaking at 731K/sec. Right on the 700K edge.

```
BrandPulse Tweet Generation Metrics
[▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░] 18.78%
├─ Total Tweets: 9,392,000 / 50,000,000
├─ Throughput (current): 731,200 tweets/sec
├─ Throughput (avg): 552,081 tweets/sec
├─ Elapsed: 00:00:17
└─ Remaining: 00:01:13
```

## Config Highlights
| Setting             | Value       | Why It’s There             |
|---------------------|-------------|----------------------------|
| `batchSize`         | 8,000       | Big batches, fewer sends   |
| `interval`          | 1ms         | Max pressure, max speed    |
| `compression`       | None        | +20% throughput boost      |
| `acks`              | 0           | No waiting, pure velocity  |
| `bufferMemory`      | ~8GB        | No bottlenecks, full RAM   |
| `maxInFlightRequests` | 1000      | Parallel sends, no queueing|

## Challenges Faced
- **Worker Overload**: Tested 24 workers on 8 cores—hit 700K/sec but saw I/O thrashing. Settled on `os.cpus().length` for stability.
- **Memory Hog**: 8GB buffer eats 90% of RAM. Fine for my rig, but it’s a beast—might tweak it later.
- **Timestamp Trade-off**: All 8,000 tweets in a batch share one timestamp. Fast as hell, but loses granularity—MVP material.

## Why It Rocks
This producer isn’t just pushing tweets—it’s hitting 700K/sec and showing I can architect high-throughput systems that flex. For BrandPulse, it’s the backbone of real-time insights; for my portfolio, it’s a loud-and-proud demo of scalable design. The [repo](https://github.com/STarLo-rd/brandpulse) backs it up with every line of code.

## Next Up
700K/sec is the win, but I’m not stopping. Maybe pre-serialize more tweets, shave `lingerMs` further, or pair it with a [consumer](./consumer.md). Peek at [Future Enhancements](../future-enhancements) for what’s next.

