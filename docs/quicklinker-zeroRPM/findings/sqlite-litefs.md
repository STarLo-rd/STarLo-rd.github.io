---
layout: doc
title: Findings - SQLite and LiteFS
---

# SQLite and LiteFS: The Guts of QuickLinker-ZeroRPM

Okay, let’s talk about why SQLite and LiteFS are the heavy hitters keeping QuickLinker-ZeroRPM alive. I’m chasing 100,000 requests a minute at zero cost, and these two are how I’m making it happen—not just some tech buzzwords, but the real deal. Here’s why they’re my go-to, how they stack up against the big shots like PostgreSQL and MongoDB, and what LiteFS brings to the party.

## SQLite: My Cheap, Tough Sidekick

I picked SQLite because I wanted something that wouldn’t cost me a penny but could still take a beating. Here’s why it’s clutch:

- **No Cash, No Problem**: SQLite’s a file on my VM—no server, no fees, no bullshit. Running it on Oracle’s free tier (4 cores, 24 GB RAM) means I’m not shelling out a dime, and it’s still got grit.

- **Fast as Hell**: I tweaked it—Write-Ahead Logging, sync tricks, memory mapping—and it’s pumping 80,000 inserts a second ([proof here](https://phiresky.github.io/blog/2020/sqlite-performance-tuning/)). For 100,000 RPM (1,666 req/s), I’ve got 1% writes (16.7 new URLs/s) and 99% reads (1,650 redirects/s). Redis snags 99% of those reads, so SQLite’s left with ~33 ops/s. That’s nothing—it’s barely breaking a sweat.

- **Real Deal Vibes**: Bit.ly’s at 23,000 RPM with ~230 new URLs a minute ([Bitly stats](https://bitly.com/pages/statistics)). My target’s bigger, but the pattern’s the same—low writes, perfect for SQLite.

PostgreSQL? MongoDB? Postgres was my Phase 1 buddy—solid, consistent, easy for 100 req/s. But at 100,000 RPM, it’s begging for replicas, and that’s cash I don’t have. MongoDB’s a read beast, but Redis already owns that, and its 3-node HA setup? $15-30 a month. Hell no—SQLite’s my ride-or-die.

## LiteFS: Toughening Up the Game

SQLite’s a champ, but it’s got one hitch—single-node life. If my VM tanks, I’m toast. That’s where LiteFS swoops in—I stumbled on it late and lost my mind ([LiteFS GitHub](https://github.com/superfly/litefs)). Here’s why it’s dope:

- **Free Backup Plan**: LiteFS syncs SQLite across nodes using some FUSE filesystem magic. No extra VMs—it piggybacks on the free tier’s leftovers. One node flops? Another’s got my back. That’s 99.9% uptime, no wallet hit.

- **Keeps It Chill**: It’s not replacing SQLite—it’s just adding a safety net. Writes hit one main node, LiteFS mirrors it live. No headache, just plug and play.

- **Fits Like a Glove**: At 33 ops/s (16.7 writes, 16.5 reads post-caching), replication’s smooth. My 4 cores and 24 GB RAM laugh at that load.

I was sweating SQLite’s limits, but LiteFS makes it bulletproof without costing me a thing.

## How They Stack Up

- **PostgreSQL**: Killer for Phase 1—tight consistency, simple setup. But 100,000 RPM? You’re coughing up $10-20 a month for replicas. LiteFS does HA for free—sorry, Postgres.

- **MongoDB**: Scales reads like a pro, but Redis has that covered. HA needs three nodes—$15-30 a month, and it’s too chunky for my VM. SQLite + LiteFS keeps it lean.

- **Street Cred**: Shlink runs SQLite in production and loves it ([Shlink docs](https://shlink.io/documentation/supported-db-engines/)). Toss in LiteFS, and I’m not just surviving—I’m flexing.

## What I Figured Out

- **SQLite’s a Beast**: Everyone calls it a toy, but tune it right and it’s a monster—80,000 ops/s is wild for a file.

- **LiteFS Steals the Show**: Found it late, but it’s gold. Reliability at $0? Should’ve hyped it from day one.

- **Caching’s My Ace**: Redis handling 99% of reads means SQLite and LiteFS barely work. That 80/20 rule (80% traffic, 20% URLs) is my cheat code.

## Why It’s a Lock

This duo’s got me covered—100,000 RPM, $0, 99.9% uptime. SQLite’s fast, LiteFS is tough, and Oracle’s free tier (4 Gbps = 2.4M RPM headroom) is overkill in the best way. Bit.ly, Shlink, and benchmarks back me up. This isn’t just doable—it’s a brag.

## What’s Next?

- **[Phase 1](/quicklinker-zerorpm/technical-architecture/phase-1)**: Where I kick it off.
- **[Cost Analysis](/quicklinker-zerorpm/findings/cost-analysis)**: How I keep it at $0.
- **[References](/quicklinker-zerorpm/references)**: The stuff I dug up.

---
*Last Updated: March 11, 2025*