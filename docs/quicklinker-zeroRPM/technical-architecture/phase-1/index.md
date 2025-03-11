# Phase 1: Master the "Minimum Viable Scaling"

> *Building the foundation for a high-performance URL shortener*

## Project Overview

**Objective:** Build a URL shortener that may seem simple but forces critical scaling decisions.

**Why This Matters:** This project is relatable, easy to test, and full of hidden scaling challenges that prepare we for enterprise-level problems.

## Implementation Journey

### 1. Basic Version

- **Stack:** Node.js + Express + PostgreSQL (for short code storage)
- **Performance Target:** Handle 100 requests per second
- **Testing Method:** Artillery for load testing
- **Key Learning:** Understanding baseline performance and identifying bottlenecks

### 2. Performance Enhancement with Caching

- **Implementation:** Redis for hot links (leveraging the 80/20 rule where 80% of traffic hits 20% of URLs)
- **Measurement:** Compare and document cache-hit ratios with and without Redis
- **Key Learning:** Quantifying the real-world impact of caching strategies

### 3. Cost-Saving Optimization

- **Database Migration:** Replace PostgreSQL with SQLite + LiteFS for replication
- **Comparison Points:** 
  - Performance differences between PostgreSQL and SQLite
  - Cost savings analysis
  - Trade-offs in scalability vs. simplicity
- **Key Learning:** Understanding when lightweight solutions can outperform traditional databases

## Expected Outcomes

By the end of Phase 1, we will have:
- A functioning URL shortener with optimized performance
- Empirical data on the effectiveness of caching
- A cost-efficient database implementation
- Hands-on experience with fundamental scaling decisions