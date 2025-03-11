---
layout: doc
title: Findings - Database Comparison
---

# Database Comparison: SQLite vs. PostgreSQL vs. MongoDB

Alright, picking a database for QuickLinker-ZeroRPM was a big damn deal—I needed something that could handle 100,000 requests a minute, cost me nothing, and not fall apart under pressure. I messed around with SQLite, PostgreSQL, and MongoDB, and here’s the straight dope on why SQLite’s my champ, PostgreSQL’s a solid starter, and MongoDB’s out of the running. Let’s break it down.

## SQLite: The Scrappy Winner

This little beast is why I’m hitting my goals—cheap, fast, and tough when paired with Redis.

- **Cost**: $0. It’s just a file—no server, no fees. Lives on Oracle’s free tier (4 cores, 24 GB RAM) without blinking.
- **Speed**: Tuned it up—WAL mode, sync tweaks—and it’s cranking 80,000 inserts a second ([SQLite tuning](https://phiresky.github.io/blog/2020/sqlite-performance-tuning/)). At 100,000 RPM (1,666 req/s), with 1% writes (16.7/s) and 99% reads (1,650/s), Redis grabs 99% of reads. SQLite’s left with ~33 ops/s—pocket change.
- **Fit**: Low writes, high reads? That’s URL shortening in a nutshell—bit.ly’s 230 writes/min at 23,000 RPM proves it ([Bitly stats](https://bitly.com/pages/statistics)). SQLite eats that up.
- **Upside**: LiteFS in Phase 3 adds HA for free—keeps it bulletproof ([LiteFS GitHub](https://github.com/superfly/litefs)).

I love it ‘cause it’s lean and mean—keeps my $0 dream alive and scales with some grit.

## PostgreSQL: The Reliable Rookie

I kicked off Phase 1 with PostgreSQL—it’s got chops, but it’s not the endgame.

- **Cost**: $0 on the free VM for 100 req/s, but scaling to 100,000 RPM? Read replicas kick in at $10-20 a month—like AWS RDS territory.
- **Speed**: Handles 100 req/s no sweat—ACID-compliant, solid for my `short_code → original_url` setup. But 1,666 req/s needs more juice—connection pooling and replicas eat CPU and RAM.
- **Fit**: Great for Phase 1’s small scale—consistent, simple, no duplicates. Switching to SQLite later was easy since they speak the same SQL lingo.
- **Downside**: It’s a server hog. More RAM, more overhead—fine ‘til I hit big traffic, then it’s cash or bust.

It’s my trusty starter, but it’s too thirsty for the long haul.

## MongoDB: The Fancy Flop

MongoDB sounded cool—big name, big promises—but it’s a mismatch for my gig.

- **Cost**: $0 on one VM, but that’s sketchy for production. Real HA needs a 3-node cluster—$15-30 a month, like MongoDB Atlas at $5 a node. No way I’m paying that.
- **Speed**: Loves reads, sure—scales like crazy there. But Redis already owns 99% of my reads (1,633/s). Mongo’s stuck with writes, and its eventual consistency could screw me—two threads grabbing the same `short_code`? Disaster.
- **Fit**: Overkill for `short_code → original_url`. Its document flex is wasted here, and moving to SQLite later would’ve been a nightmare—no SQL overlap.
- **Downside**: Too fat—3 nodes need 3-6 GB RAM and heavy I/O. My free VM chokes on that.

Mongo’s a beast, but not my beast—Redis steals its thunder, and the price tag’s a dealbreaker.

## Head-to-Head: Who’s Got What

| Database   | Cost (100,000 RPM) | Speed Fit          | Resource Load       | HA at $0? |
|------------|--------------------|--------------------|---------------------|-----------|
| SQLite     | $0 (LiteFS)        | 80,000 ops/s       | Light as hell       | Yup       |
| PostgreSQL | $10-20/month       | Good ‘til 100 req/s| Chunky server      | Nope      |
| MongoDB    | $15-30/month       | Read-heavy king    | Fat and greedy      | Nope      |

**Takeaway**: SQLite’s the only one that hits 100,000 RPM at $0—fast, light, and future-proof with LiteFS.

## Why SQLite Wins

- **Cash Rules**: $0 from day one to 100,000 RPM. PostgreSQL and MongoDB tap out when I scale.
- **Workload Match**: Low writes (16.7/s), high reads (1,650/s)—Redis and SQLite split it perfect. Mongo’s read edge is moot, and PostgreSQL’s too bulky.
- **Flex**: LiteFS makes SQLite HA-ready; the others need paid crutches.

I started with PostgreSQL ‘cause it’s safe and simple—got me to 100 req/s no fuss. But SQLite’s where I landed—same SQL vibe, way cheaper, and with Redis, it’s untouchable. MongoDB? Cool for someone else’s wallet.

## What I Learned

- **SQLite’s Sneaky Good**: Thought it was small-time, but it’s a tank with the right setup.
- **Cost Kills**: PostgreSQL and MongoDB are dope ‘til the bill hits—$0’s my line in the sand.
- **Teamwork Wins**: SQLite + Redis + LiteFS = my dream squad.

## What’s Next?

- **[Phase 1](/quicklinker-zerorpm/technical-architecture/phase-1)**: Where PostgreSQL hands off to SQLite.
- **[SQLite + LiteFS](/quicklinker-zerorpm/findings/sqlite-litefs)**: Deep dive on the duo.
- **[References](/quicklinker-zerorpm/references)**: The dirt I dug up.

---
*Last Updated: March 11, 2025*