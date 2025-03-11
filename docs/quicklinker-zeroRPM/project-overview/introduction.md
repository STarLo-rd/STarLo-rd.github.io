---
layout: doc
title: Project Overview - Introduction
---

# Project Overview: Introduction

## What is QuickLinker-ZeroRPM?

QuickLinker-ZeroRPM is a URL shortener designed to push the boundaries of cost efficiency and scalability, targeting 100,000 requests per minute (RPM) with zero infrastructure costs. Built with Node.js, Express, SQLite, and Redis, it’s hosted on Oracle’s Always Free Tier (4 Arm cores, 24 GB RAM). The project evolves through three phases—minimum viable scaling, analytics integration, and resilience engineering—each testing the limits of lightweight technologies in a production-like setting.

This isn’t just about shortening URLs; it’s a hands-on exploration of how far a single-node setup can scale, leveraging SQLite’s simplicity and Redis’s caching power, all while keeping costs at $0/month. It’s a learning journey for system engineers, challenging conventional database choices and offering practical insights into cost-performance trade-offs.

## Core Goals

QuickLinker-ZeroRPM is driven by four key objectives:
- **Cost Efficiency**: Achieve $0/month infrastructure costs by using SQLite on Oracle’s free Arm-based VMs, minimizing resource overhead compared to server-based databases like PostgreSQL or MongoDB’s replica sets.
- **Scalability**: Handle 100,000+ RPM through optimized caching (Redis) and SQLite tuning, reducing database load to a manageable level (e.g., ~33 operations/second with 99% cache hits).
- **Reliability**: Ensure 99.9% uptime with replication via LiteFS and chaos testing using Chaos Mesh, enhancing SQLite’s single-node resilience.
- **Learning Focus**: Deliver a case study on scaling SQLite for production workloads, exploring cost vs. complexity, and preparing engineers for enterprise challenges.

These goals shape every decision, from database selection to deployment strategy.

## Why SQLite Over PostgreSQL and MongoDB?

The choice of database is central to QuickLinker-ZeroRPM’s design. Here’s how SQLite emerged as the star, with PostgreSQL as a stepping stone and MongoDB ruled out:

### Initial Choice: PostgreSQL
- **ACID Compliance**: URL shorteners demand strong consistency—duplicate short codes or misdirected URLs are unacceptable. PostgreSQL’s robust transaction support ensures data integrity for Phase 1’s 100 req/s target.
- **Structured Simplicity**: The schema is straightforward: `short_code → original_url`. PostgreSQL’s relational model fits perfectly, avoiding the overhead of MongoDB’s flexible documents.
- **Vertical Scaling**: Phase 1 focuses on a single node, where PostgreSQL excels with connection pooling and indexing.

### Pivot to SQLite
- **Cost Efficiency**: SQLite is embedded, requiring no separate server process—just a file on disk. This slashes resource needs, aligning with the $0 cost goal on a free VM. PostgreSQL, while efficient, demands more setup and memory, and MongoDB’s 3-node high-availability setup is cost-prohibitive.
- **Migration Ease**: Moving from PostgreSQL to SQLite is seamless due to shared SQL syntax, unlike MongoDB’s document model, which would require a full data layer rewrite.
- **Performance with Tuning**: Research shows SQLite can handle 80,000 inserts/second and 100,000 SELECTs/second with optimizations like Write-Ahead Logging (WAL) and synchronous normal mode ([SQLite Performance Tuning](https://phiresky.github.io/blog/2020/sqlite-performance-tuning/)). With Redis caching 99% of reads, the database sees only ~1,990 operations/minute (990 reads, 1,000 writes), well within SQLite’s tuned capacity.

### Why Not MongoDB?
- **Read-Heavy Myth**: MongoDB shines for read-heavy caching, but Redis already offloads 99% of redirects. The primary database’s role shifts to reliable writes, where MongoDB’s eventual consistency risks duplicates (e.g., two threads picking the same `short_code` before uniqueness is enforced).
- **Cost Overhead**: High availability requires a 3-node replica set, costing $15+/month in cloud resources vs. SQLite’s $0 on a single node. Even PostgreSQL can scale later with cheaper read replicas.
- **Complexity**: MongoDB’s document flexibility adds unnecessary overhead for a simple key-value use case, complicating the shift to SQLite.

SQLite, enhanced by LiteFS for replication, balances cost, simplicity, and performance for this project’s unique constraints.

## Initial Research Insights

- **Workload Breakdown**: At 100,000 RPM, assuming 1% writes (new URLs) and 99% reads (redirects), with 99% of reads cached by Redis, the database handles ~1,990 operations/minute (~33/second). Bit.ly’s 33M clicks/day (~23,000 RPM) suggests low write loads (~230 new URLs/minute), supporting this model.
- **SQLite Feasibility**: Benchmarks indicate SQLite can manage 80,000 inserts/second and 100,000 SELECTs/second with tuning ([Hacker News Discussion](https://news.ycombinator.com/item?id=35547819)), far exceeding Phase 1’s needs.
- **Oracle Free Tier Fit**: The Arm-based VM (4 cores, 24 GB RAM) offers 4 Gbps bandwidth, easily supporting the estimated 13.33 Mbps for 100,000 RPM at 1 KB/request ([Oracle Free Tier FAQ](https://www.oracle.com/in/cloud/free/faq/)).

These findings validate Phase 1’s approach, setting the stage for deeper technical exploration.

## Next Steps

This project unfolds in phases:
- **[Phase 1: Minimum Viable Scaling](/quicklinker-zerorpm/technical-architecture/phase-1)**: Establish the core with PostgreSQL, then SQLite, targeting 100 req/s.
- **[Phase 2: Analytics Pipeline](/quicklinker-zerorpm/technical-architecture/phase-2)**: Integrate Kafka and TimescaleDB for insights.
- **[Phase 3: Resilience Engineering](/quicklinker-zerorpm/technical-architecture/phase-3)**: Enhance uptime with LiteFS and chaos testing.

Continue to [Technical Architecture](/quicklinker-zerorpm/technical-architecture/phase-1) for implementation details.

---
*Last Updated: March 11, 2025*