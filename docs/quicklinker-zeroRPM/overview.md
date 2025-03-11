---
layout: doc
title: QuickLinker-ZeroRPM
---

# QuickLinker-ZeroRPM

**A High-Performance URL Shortener**  
*Zero infrastructure cost, infinite scalability*

## Overview

QuickLinker-ZeroRPM is a URL shortener engineered to handle enterprise-scale traffic—targeting 100,000 requests per minute (RPM)—at zero infrastructure cost. Built with Node.js, Express, SQLite, and Redis, it leverages lightweight technologies to deliver a scalable, resilient system hosted on Oracle’s Always Free Tier (4 Arm cores, 24 GB RAM). This project challenges the notion that SQLite is only for small apps, using optimizations and caching to push its limits, while exploring cost-effective alternatives to traditional databases like PostgreSQL and MongoDB.

### Project Motivation

The project pursues four core goals:
- **Cost Efficiency**: Achieve $0/month infrastructure costs using SQLite on a free VM, minimizing resource overhead.
- **Scalability**: Support 100,000+ RPM with Redis caching and SQLite optimizations, reducing database load.
- **Reliability**: Ensure 99.9% uptime through replication (LiteFS) and chaos testing (Chaos Mesh).
- **Learning**: Provide a case study on scaling SQLite for production, balancing cost and complexity for system engineers.

This isn’t just a tool—it’s an experiment in rethinking system design with minimal resources.

## Why SQLite Over PostgreSQL and MongoDB?

QuickLinker-ZeroRPM starts with PostgreSQL in Phase 1 for its ACID compliance and simplicity, then pivots to SQLite for cost savings. MongoDB was considered but sidelined—here’s why:
- **SQLite Preference**: 
  - Embedded, serverless, and lightweight, SQLite runs within the app on a single file, slashing setup and resource costs. With Redis caching 99% of reads, SQLite handles the remaining 1,990 operations per minute (990 reads, 1,000 writes), well within its tuned capacity of 80,000 inserts/second ([SQLite Performance Tuning](https://phiresky.github.io/blog/2020/sqlite-performance-tuning/)).
  - Migration from PostgreSQL to SQLite is seamless due to shared SQL syntax, unlike MongoDB’s document model.
- **PostgreSQL Strengths**: Offers strong consistency and vertical scaling for Phase 1’s 100 req/s target, but its server-based nature increases resource demands compared to SQLite.
- **MongoDB Drawbacks**: Excels in read-heavy caching, but Redis already offloads reads. MongoDB’s eventual consistency risks duplicate short codes, and its high-availability setup (3-node replica set) conflicts with the $0 cost goal.

SQLite, paired with LiteFS for replication, aligns with the project’s cost-performance trade-offs.

## Technical Highlights

- **Zero-Cost Hosting**: Deploys on Oracle’s free Arm-based VMs, leveraging 4 cores and 24 GB RAM.
- **SQLite Scalability**: Achieves 100,000 RPM with Write-Ahead Logging (WAL), synchronous normal mode, and Redis caching ([Hacker News Discussion](https://news.ycombinator.com/item?id=35547819)).
- **Resilience**: Uses LiteFS for SQLite replication across nodes ([LiteFS GitHub](https://github.com/superfly/litefs)) and Chaos Mesh for fault testing.
- **Phased Evolution**:
  1. **Phase 1**: Minimum Viable Scaling with PostgreSQL, then SQLite, targeting 100 req/s.
  2. **Phase 2**: Analytics Pipeline with Kafka and TimescaleDB.
  3. **Phase 3**: Resilience Engineering with multi-node replication.

## Expected Outcomes

- Handle **100,000+ RPM** on a single SQLite instance with caching.
- Maintain **$0/month costs** on free-tier infrastructure.
- Deliver a case study on:
  - Scaling SQLite beyond traditional limits.
  - Optimizing cost-to-complexity ratios.
  - Efficient caching for high-traffic services.

## Navigation

Dive deeper:
- **[Project Details](./project-overview/introduction.md)**: Explore motivation and goals.
- **[Technical Architecture](./technical-architecture/phase-1/)**: Review phased implementation.
- **[Findings](./findings/feasibility.md)**: See research insights.
- **[References](index.md)**: Cited resources.

## Get Involved

Check the [GitHub repository](https://github.com/your-repo/quicklinker-zerorpm) (update with your URL) or explore the sections above. This project invites you to rethink system design with efficiency at its core.

