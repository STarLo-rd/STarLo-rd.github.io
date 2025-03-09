---
title: Technical Architecture - BrandPulse
description: How BrandPulse processes 700k social media posts per second.
---

# Technical Architecture

Time to peek under the hood of **BrandPulse**—this thing cranks through 500,000 tweets a second and turns them into real-time sentiment insights without breaking a sweat. I pieced it together with Node.js, Kafka, and InfluxDB, and here’s how it all flows to handle that kind of madness.

## The Big Picture
BrandPulse is like a well-oiled machine: it generates a ton of fake tweets, streams them fast, ingests the data, and throws it up on a dashboard—all live. It’s built to scale up, stay snappy, and not choke when the volume’s insane. Check out the flow:

<!-- ![Architecture Diagram](./assets/architecture-diagram.png)  
*Data zipping from generation to dashboard at 700k req/sec.* -->

### Architecture Diagram
```
+----------------+      +----------------+      +----------------+      +----------------+
| Node.js Workers| -->  | Kafka          | -->  | Node.js Consumer| -->  | InfluxDB       |
| (Data Gen)     |      | (tweets topic) |      | (Data Ingestion)|      | (Storage)      |
+----------------+      +----------------+      +----------------+      +----------------+
       ^                         |                           |
       |                         |                           |
       |                  +----------------+                 |
       +----------------- | Web App         | <---------------+
                          | (Express + Socket.io) |
                          +----------------+
```


## The Components
I split it into four main chunks—each one’s got a job to keep the whole thing humming.

### 1. Data Generation (Node.js Workers)
- **What It Does**: This is where I whip up 700k tweets a second about "SuperCoffee"—stuff like “SuperCoffee’s the best!” or “This coffee’s gross.”
- **How It Works**: Node.js with worker threads fires up multiple workers, each spitting out tweets with `tweetId`, `timestamp`, `text`, `brand`, and `sentiment`. Sentiment’s a quick rule-based call—“awesome” tags positive, “awful” tags negative, rest is neutral.
- **Why Node.js?**: It’s killer for I/O-heavy tasks like this, and workers let me squeeze every core for max output.
- **Output**: Tweets get wrapped in Avro and shot over to Kafka.

### 2. Data Streaming (Kafka)
- **What It Does**: Kafka’s the backbone—hauling all those tweets without dropping a beat.
- **How It Works**: I’ve got a `tweets` topic where workers dump Avro messages. Kafka’s tuned for high throughput with multiple partitions to manage the 700k flood.
- **Why Kafka?**: It’s bulletproof for streaming big data, and I can scale it out if I need more horsepower later.

### 3. Data Ingestion (Node.js Consumer + InfluxDB)
- **What It Does**: This grabs tweets from Kafka and ingests them into InfluxDB for fast crunching.
- **How It Works**: A Node.js consumer listens on the `tweets` topic, pulls messages, and unpacks the Avro into JSON. I batch them—maybe 1000 tweets or every second—and shove them into InfluxDB. It’s stored as a `tweets` measurement with tags like `brand` and `sentiment`, plus `text` as a field.
- **Why InfluxDB?**: It’s a time-series beast, perfect for tracking changes over seconds—like sentiment swings. Batching keeps it from choking at 700k req/sec.

### 4. Web Application (Express + Socket.io)
- **What It Does**: This is the flashy part—showing live sentiment on a dashboard.
- **How It Works**: An Express server pings InfluxDB every second (e.g., “Count positive tweets from the last 10 seconds”), then pushes updates to the browser via Socket.io. The dashboard rocks a pie chart (Chart.js), a counter locked at 700k, and an alert if negatives spike over 50%. Buttons let me start/stop the tweet storm or tweak sentiment on the fly.
- **Why This Stack?**: Express keeps it lean, Socket.io handles real-time like a pro, and Chart.js makes it pop visually.

## How It Flows
Workers blast tweets into Kafka, the consumer ingests them into InfluxDB, and the web app pulls counts to show live. Hit “start” on the dashboard? A control message zips through Kafka to kick the workers off—keeps it clean since I’m already streaming everything there. It’s fast, smooth, and takes the 700k load in stride.

## Technical Highlights
- **Speed**: Sub-second from tweet to screen—blink and it’s there.
- **Scale**: 700k req/sec is nuts (Twitter peaks around that for huge events), but it proves I can handle the big leagues.
- **Choices**: Node.js for speed, Kafka for streaming, InfluxDB for time-series—picked to keep it flying at this rate.
