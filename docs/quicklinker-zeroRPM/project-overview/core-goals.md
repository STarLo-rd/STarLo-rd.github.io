---
layout: doc
title: Project Overview - Core Goals
---

# Core Goals of QuickLinker-ZeroRPM

QuickLinker-ZeroRPM isn’t just a URL shortener—it’s an experiment in pushing lightweight technologies to their limits. The project is anchored by four core goals: **cost efficiency**, **scalability**, **reliability**, and **learning focus**. These objectives drive every architectural decision, from choosing SQLite over PostgreSQL or MongoDB to leveraging Oracle’s free tier and Redis caching. Below, each goal is unpacked with its motivation, implementation strategy, and real-world implications.

## 1. Cost Efficiency

### Motivation
Running a high-performance URL shortener shouldn’t break the bank. The goal is to achieve **$0/month infrastructure costs**, making this a viable side project or proof-of-concept that scales without financial overhead.

### Strategy
- **SQLite Over Server-Based Databases**: SQLite’s embedded nature eliminates the need for a separate server process, unlike PostgreSQL or MongoDB’s 3-node replica sets (costing $15+/month in cloud setups). It runs as a single file on a VM, reducing resource demands.
- **Oracle Always Free Tier**: Hosting on Oracle’s Arm-based VMs (4 cores, 24 GB RAM, 200 GB storage) provides enterprise-grade compute at no cost, with 4 Gbps bandwidth dwarfing the project’s 13.33 Mbps need for 100,000 RPM ([Oracle Free Tier FAQ](https://www.oracle.com/in/cloud/free/faq/)).
- **Minimal Footprint**: With Redis caching 99% of reads, SQLite handles only ~1,990 operations/minute (~33/second), keeping CPU and memory usage low on a free VM ([Reddit Discussion](https://www.reddit.com/r/selfhosted/comments/15q1o59/is_oracle_cloud_free_tier_actually_free_tier/)).

### Implications
This approach challenges the norm of pricey cloud setups, proving that a $0 budget can support significant workloads. It’s a practical lesson in resource optimization for system engineers.

## 2. Scalability

### Motivation
Handling **100,000 requests per minute (RPM)** on a single node is ambitious, especially with SQLite, often dismissed as a “toy” database. This goal tests how far optimization and caching can stretch a lightweight stack.

### Strategy
- **Redis Caching**: Leveraging the 80/20 rule (80% of traffic hits 20% of URLs), Redis caches 99% of redirects, reducing database load to ~990 reads and 1,000 writes per minute. Real-world data from bit.ly (33M clicks/day, ~23,000 RPM) suggests low write loads (~230 new URLs/minute), supporting this model.
- **SQLite Tuning**: Optimizations like Write-Ahead Logging (WAL), synchronous normal mode, and memory mapping push SQLite to 80,000 inserts/second and 100,000 SELECTs/second ([SQLite Performance Tuning](https://phiresky.github.io/blog/2020/sqlite-performance-tuning/)), far exceeding the ~33 operations/second needed.
- **Phase Evolution**: Starts with PostgreSQL for Phase 1’s 100 req/s, pivots to SQLite for cost, and scales with LiteFS replication in Phase 3.

### Implications
Achieving 100,000 RPM with SQLite redefines its production potential, offering a scalable blueprint for read-heavy apps with minimal writes—perfect for URL shorteners.

## 3. Reliability

### Motivation
A URL shortener must be **99.9% reliable**—downtime means broken links and frustrated users. This goal ensures the system withstands failures, even on a single-node budget.

### Strategy
- **LiteFS Replication**: LiteFS, a FUSE-based file system, replicates SQLite across nodes, enhancing availability beyond its single-node roots ([LiteFS GitHub](https://github.com/superfly/litefs)). Used in Phase 3, it ensures failover without extra cost.
- **Chaos Testing**: Tools like Chaos Mesh simulate failures (e.g., network drops, VM crashes) to validate 99.9% uptime, building resilience into the stack.
- **Caching Redundancy**: Redis acts as a first line of defense, serving 99% of requests even if the database lags, minimizing user impact.

### Implications
This transforms SQLite into a resilient option for distributed systems, proving that reliability doesn’t require expensive infrastructure—just smart engineering.

## 4. Learning Focus

### Motivation
Beyond functionality, QuickLinker-ZeroRPM is a **learning platform** for system engineers. It explores cost vs. performance trade-offs, preparing for enterprise challenges while documenting real-world scaling tactics.

### Strategy
- **SQLite Scalability Case Study**: Tests SQLite’s limits with tuning and caching, challenging its “small app only” reputation ([Shlink Documentation](https://shlink.io/documentation/supported-db-engines/)). Results are shared as a resource for others.
- **Hands-On Skills**: Engineers gain experience with:
  - Designing cost-efficient stacks (SQLite, free VMs).
  - Implementing caching (Redis) to slash database load.
  - Building analytics pipelines (Kafka, TimescaleDB in Phase 2).
  - Testing resilience (Chaos Mesh in Phase 3).
- **Open Documentation**: Findings, like SQLite’s 80,000 inserts/second benchmark ([Hacker News](https://news.ycombinator.com/item?id=35547819)), are detailed for community learning.

### Implications
This goal empowers engineers with practical, transferable skills, bridging academic theory and production realities—all within a $0 budget constraint.

## How These Goals Interconnect

- **Cost Efficiency enables Scalability**: Free resources force creative optimization, like SQLite tuning and caching, to hit 100,000 RPM.
- **Scalability supports Reliability**: A low database load (33 ops/second) simplifies replication and failover with LiteFS.
- **Reliability fuels Learning**: Chaos testing and replication experiments yield insights into resilient design.
- **Learning ties it together**: Documenting this journey benefits the community while refining the system.

## Next Steps

These goals unfold across phases:
- **[Phase 1](../technical-architecture/phase-1/)**: Cost-efficient scaling to 100 req/s with SQLite.
- **[Phase 2](../technical-architecture/phase-2/)**: Scalable analytics with Kafka.
- **[Phase 3](../technical-architecture/phase-3/)**: Reliable multi-node resilience.

Explore the [Technical Architecture](../technical-architecture/phase-1/) for how these goals come to life.

---
*Last Updated: March 11, 2025*