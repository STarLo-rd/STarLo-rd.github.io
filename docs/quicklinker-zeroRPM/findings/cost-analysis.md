---
layout: doc
title: Findings - Cost Analysis
---

# Findings: Cost Analysis

QuickLinker-ZeroRPM targets **$0/month infrastructure costs** while handling 100,000 requests per minute (RPM). This analysis evaluates how the project achieves that, focusing on database choices (SQLite, PostgreSQL, MongoDB), hosting on Oracle’s Always Free Tier, and workload optimization with Redis caching. The findings validate the cost-efficiency goal and highlight trade-offs that make this possible.

## Hosting: Oracle Always Free Tier

### Specs and Capabilities
- **Compute**: 4 Arm cores, 24 GB RAM, 200 GB block storage.
- **Bandwidth**: 4 Gbps outbound, far exceeding the estimated 13.33 Mbps needed for 100,000 RPM (assuming 1 KB/request: 100,000 req/min × 1 KB × 8 bits ÷ 60 sec ≈ 13.33 Mbps).
- **Cost**: $0/month, with no hidden fees for the base tier ([Oracle Free Tier FAQ](https://www.oracle.com/in/cloud/free/faq/)).

### Fit for Purpose
- A single VM comfortably runs Node.js, Express, Redis, and SQLite, with room for LiteFS replication in Phase 3.
- Users report hosting full stacks (e.g., web servers, databases) on this tier without throttling, confirming its viability ([Reddit Discussion](https://www.reddit.com/r/selfhosted/comments/15q1o59/is_oracle_cloud_free_tier_actually_free_tier/)).
- No need for paid upgrades—24 GB RAM and 4 cores exceed the lightweight stack’s needs, even at peak load.

### Cost Implication
Oracle’s free tier eliminates hosting expenses, shifting the burden to software optimization for cost efficiency.

## Database Cost Breakdown

### SQLite
- **Setup**: Embedded, serverless, single-file database within the app.
- **Resource Use**: Minimal—runs on the VM’s existing 24 GB RAM and 4 cores. With Redis caching 99% of reads, SQLite handles ~1,990 operations/minute (~33/second), a tiny fraction of its tuned capacity (80,000 inserts/second, [SQLite Performance Tuning](https://phiresky.github.io/blog/2020/sqlite-performance-tuning/)).
- **Cost**: $0. No licensing, no server, no additional VMs required.
- **Scaling**: LiteFS adds replication in Phase 3 at no cost beyond the free tier’s resources.

### PostgreSQL
- **Setup**: Standalone server process, typically on the same VM in Phase 1.
- **Resource Use**: Higher than SQLite—requires dedicated memory (e.g., 1-2 GB for buffers) and CPU for connection handling. At 100 req/s (Phase 1), it’s manageable, but at 100,000 RPM, connection pooling and read replicas would strain the free tier’s limits.
- **Cost**: $0 on the free VM initially, but scaling beyond one node (e.g., read replicas) demands paid resources (~$10/month per instance on AWS RDS or similar).
- **Scaling**: Vertical scaling works for Phase 1, but horizontal scaling (e.g., multi-node HA) incurs costs incompatible with the $0 goal.

### MongoDB
- **Setup**: Document-based, requires a 3-node replica set for high availability (HA) in production.
- **Resource Use**: Heavy—each node needs ~1-2 GB RAM and significant disk I/O. A single-node setup fits the free tier but risks data loss; HA exceeds it, needing multiple VMs.
- **Cost**: $0 on one VM (not recommended for production), but $15-30/month for a 3-node cluster (e.g., MongoDB Atlas M10 tier at $5/node/month). Even self-hosted HA on paid VMs starts at $10-20/month.
- **Scaling**: Horizontal scaling is MongoDB’s strength, but the cost of additional nodes clashes with the project’s budget.

### Comparison Table

| Database   | Cost on Free Tier | Cost to Scale (100,000 RPM) | Resource Fit (24 GB, 4 cores) | HA Feasibility |
|------------|-------------------|-----------------------------|-------------------------------|----------------|
| SQLite     | $0                | $0 (with LiteFS)            | Excellent (minimal load)      | Yes (Phase 3)  |
| PostgreSQL | $0                | $10-20/month (replicas)     | Moderate (higher overhead)    | No             |
| MongoDB    | $0 (single node)  | $15-30/month (3 nodes)      | Poor (HA exceeds tier)        | No             |

**Finding**: SQLite is the only option that scales to 100,000 RPM at $0, thanks to its lightweight design and LiteFS.

## Workload and Optimization

### Assumptions
- **Traffic**: 100,000 RPM (1,666 req/s), with 1% writes (1,000 new URLs/minute) and 99% reads (99,000 redirects/minute).
- **Caching**: Redis handles 99% of reads (98,010 req/min), leaving ~990 reads and 1,000 writes (~33 ops/second) for the database.
- **Request Size**: 1 KB/request (URL data + headers), totaling 13.33 Mbps.

### Cost-Saving Optimizations
- **Redis Caching**: Offloads 99% of redirects, reducing database load to ~1% of total traffic. At $0 (running on the VM), it’s a cost-effective alternative to MongoDB’s read-heavy design.
- **SQLite Tuning**: WAL mode, synchronous normal, and memory mapping keep SQLite’s footprint tiny while hitting 80,000 inserts/second ([Hacker News](https://news.ycombinator.com/item?id=35547819)). No additional hardware needed.
- **Single-Node Design**: Phases 1-2 avoid multi-node complexity, fitting all components (Node.js, Redis, SQLite) on one VM. Phase 3’s LiteFS uses spare capacity for replication.

### Validation
- Bit.ly’s 33M clicks/day (~23,000 RPM) with ~230 writes/minute suggests URL shorteners have low write loads, aligning with SQLite’s strengths ([Bitly Stats Reference](https://bitly.com/pages/statistics)).
- Oracle’s 4 Gbps bandwidth supports ~2.4M RPM at 1 KB/request, far beyond the target.

**Finding**: Caching and tuning make 100,000 RPM feasible at $0, leveraging the free tier’s full potential.

## Trade-Offs

- **SQLite**: Sacrifices multi-node HA until Phase 3 (LiteFS), but caching mitigates downtime risks. Ideal for cost focus.
- **PostgreSQL**: Offers robust HA with paid replicas, but at $10-20/month, it’s overkill for this use case.
- **MongoDB**: Provides scalability and flexibility, but the $15-30/month HA cost and resource mismatch rule it out.

## Conclusion

QuickLinker-ZeroRPM achieves $0/month costs by:
1. Hosting on Oracle’s free tier (4 cores, 24 GB RAM, 4 Gbps).
2. Using SQLite with Redis caching, handling 100,000 RPM with ~33 ops/second.
3. Avoiding server-based databases (PostgreSQL, MongoDB) that incur scaling costs.

This analysis confirms SQLite as the cost-efficient backbone, with LiteFS poised to address reliability in Phase 3—all within the free tier’s limits. PostgreSQL suits Phase 1’s simplicity, but MongoDB’s overhead makes it impractical.

## Next Steps

See how this plays out in:
- **[Phase 1](../technical-architecture/phase-1/)**: SQLite implementation.
- **[References](../index.md)**: Cited resources.

---
*Last Updated: March 11, 2025*