---
layout: doc
title: Findings - SQLite and LiteFS
---

# SQLite and LiteFS: The Heart of QuickLinker-ZeroRPM

Alright, let’s get into why SQLite and LiteFS are the real MVPs for QuickLinker-ZeroRPM. This isn’t some textbook theory—I’ve been digging into these tools to see if they can actually pull off 100,000 requests a minute at zero cost. Spoiler: they can, and it’s pretty damn cool. Here’s the rundown on what they bring to the table, why they beat out the big dogs like PostgreSQL or MongoDB, and how LiteFS takes it up a notch.

## Why SQLite? It’s Lean and Mean

I started with SQLite because I wanted something that wouldn’t cost me a dime and could still handle serious traffic. Here’s why it’s a no-brainer for this gig:

- **Zero Bucks, All Guts**: SQLite doesn’t need a server—just a file on the VM. No licensing, no extra VMs, nada. Running it on Oracle’s free tier (4 cores, 24 GB RAM) keeps my wallet happy while it churns through URLs.

- **Speed That Slaps**: With some tuning—Write-Ahead Logging (WAL), synchronous normal mode, memory mapping—it’s hitting 80,000 inserts a second ([check this out](https://phiresky.github.io/blog/2020/sqlite-performance-tuning/)). For 100,000 RPM? That’s 1,666 requests a second, with 1% writes (16.7 new URLs) and 99% reads (1,650 redirects). Redis eats 99% of those reads, leaving SQLite with like 33 ops a second. That’s pocket change for it.

- **Real-World Proof**: Bit.ly does 23,000 RPM with ~230 new URLs a minute ([Bitly stats](https://bitly.com/pages/statistics)). My target’s higher, but the write load’s similar—SQLite’s built for this kind of thing.

Compared to PostgreSQL or MongoDB? PostgreSQL’s solid for Phase 1’s 100 req/s—ACID-compliant, simple schema—but it’s a hog when you scale up, needing replicas that cost cash. MongoDB? Great for reads, but Redis already owns that, and its 3-node setup for HA is like $15-30 a month. Nope, SQLite’s my ride-or-die here.

## LiteFS: Making SQLite Tougher

Now, SQLite’s awesome, but it’s got a weak spot—it’s single-node by nature. If that VM goes down, so do my links. Enter LiteFS—found this gem while digging around ([LiteFS GitHub](https://github.com/superfly/litefs))—and it’s a game-changer for Phase 3. Here’s why I’m stoked about it:

- **Replication on the Cheap**: LiteFS uses a FUSE filesystem to sync SQLite across nodes. No extra VMs needed—it runs on the free tier’s spare juice. If one node crashes, another picks up the slack. That’s 99.9% uptime without breaking my $0 budget.

- **Keeps It Simple**: It’s not a full-on replacement—it’s SQLite with a safety net. Writes still hit one primary node, but LiteFS mirrors it live. No crazy setup, just bolt it on and go.

- **Fits the Plan**: At 33 ops a second (16.7 writes, 16.5 reads after caching), replication’s a breeze. Low write load means no bottleneck, and I’ve got 4 cores and 24 GB RAM to play with.

I was worried SQLite might choke under pressure, but LiteFS makes it resilient without me selling my soul to a cloud bill.

## How It Stacks Up

- **Vs. PostgreSQL**: Postgres is a beast for consistency—perfect for Phase 1’s small scale. But at 100,000 RPM, you’re begging for read replicas, and that’s $10-20 a month. LiteFS gives me HA for free—eat that, Postgres.

- **Vs. MongoDB**: Mongo’s all about scaling reads, but Redis already kills that job. Plus, its HA needs three nodes—$15-30 a month, and way too heavy for my free VM. SQLite + LiteFS keeps it lean and mean.

- **Real Talk**: Shlink’s been running SQLite in production and loves it ([Shlink docs](https://shlink.io/documentation/supported-db-engines/)). Add LiteFS, and I’m not just keeping up—I’m pushing the envelope.

## What I Learned Messing With This

- **SQLite’s No Joke**: Everyone says it’s for tiny apps, but tune it right and it’s a monster. 80,000 ops a second? That’s nuts for a file-based DB.

- **LiteFS Is Clutch**: Found it late in the game, but it’s perfect for keeping things reliable without extra cost. Wish I’d known about it sooner—would’ve bragged about it in Phase 1.

- **Caching’s King**: Redis doing 99% of the work means SQLite and LiteFS can chill. That 80/20 rule (80% of traffic hitting 20% of URLs) is gold here.

## Why It’s Feasible

This combo nails it—100,000 RPM, $0 cost, 99.9% uptime. SQLite’s fast enough, LiteFS makes it tough, and the free tier’s got the muscle (4 Gbps bandwidth = 2.4M RPM headroom). I’ve got proof from benchmarks, bit.ly’s numbers, and Shlink’s success. It’s not just doable—it’s a flex.

## What’s Next?

- **[Phase 1](/quicklinker-zerorpm/technical-architecture/phase-1)**: How I kick this off with SQLite.
- **[Cost Analysis](/quicklinker-zerorpm/findings/cost-analysis)**: More on the $0 magic.
- **[References](/quicklinker-zerorpm/references)**: Where I got the goods.

---
*Last Updated: March 11, 2025*


<!-- ---
layout: doc
title: Findings - Cost Analysis
---

# Cost Analysis: Keeping QuickLinker-ZeroRPM at $0

Look, I set out to build QuickLinker-ZeroRPM to handle 100,000 requests a minute without spending a damn dime. That’s the whole game—big traffic, zero cost. So let’s dig into how I’m pulling this off, why SQLite’s my MVP, and what the alternatives like PostgreSQL and MongoDB would’ve cost me. Spoiler: it’s all about squeezing every drop out of Oracle’s free tier.

## The Free Ride: Oracle’s Always Free Tier

I’m hosting this thing on Oracle’s free tier—4 Arm cores, 24 GB RAM, 200 GB storage, and a fat 4 Gbps pipe. Costs me nothing, zip, zilch ([Oracle FAQ](https://www.oracle.com/in/cloud/free/faq/)). At 100,000 RPM, each request’s about 1 KB, so that’s 13.33 Mbps (100,000 × 1 KB × 8 ÷ 60). Oracle’s 4 Gbps can handle like 2.4 million RPM—way more than I need. People on Reddit swear it’s legit free, no sneaky charges ([Reddit thread](https://www.reddit.com/r/selfhosted/comments/15q1o59/is_oracle_cloud_free_tier_actually_free_tier/)). 

This VM’s got the muscle to run Node.js, Express, Redis, and SQLite without breaking a sweat. Hell, it’s got room for LiteFS later. No paid upgrades needed—I’m golden at $0.

## Database Showdown: SQLite vs. The Rest

Here’s where the rubber meets the road—picking a database that keeps costs at zero but doesn’t choke.

### SQLite: The Cheap Champ
- **How It Rolls**: No server, just a file on the VM. No extra setup, no licensing fees—just pure, free simplicity.
- **Load**: With Redis caching 99% of reads, SQLite’s dealing with ~1,990 ops a minute (~33 a second—990 reads, 1,000 writes). It’s tuned to crank 80,000 inserts a second ([SQLite tuning](https://phiresky.github.io/blog/2020/sqlite-performance-tuning/))—33 ops is a walk in the park.
- **Cost**: $0. Fits on the free VM, and LiteFS in Phase 3 uses spare capacity—no extra dime spent.

### PostgreSQL: Starts Free, Ends Pricey
- **How It Rolls**: Full-on server, eats more RAM and CPU than SQLite. Fine for Phase 1’s 100 req/s—give it 1-2 GB and it’s happy.
- **Load**: At 100,000 RPM, it’d need connection pooling and read replicas to keep up. That’s beyond one VM’s juice.
- **Cost**: $0 on the free tier to start, but scaling up? You’re looking at $10-20 a month for replicas on something like AWS RDS. No thanks.

### MongoDB: Cool, But Costs a Ton
- **How It Rolls**: Document-based, loves reads, but needs a 3-node cluster for production-grade HA. Heavy as hell—each node wants 1-2 GB RAM minimum.
- **Load**: Redis already owns reads, so Mongo’s stuck with writes. Single-node’s fine at $0, but HA? That’s three VMs or a cloud service.
- **Cost**: $0 if I skimp with one node (risky), but real HA’s $15-30 a month—like MongoDB Atlas at $5 a node. Way over my budget.

### Quick Look: Who Costs What
| Database   | Free Tier Cost | Scaling Cost (100,000 RPM) | Fits 24 GB/4 Cores? | HA Possible? |
|------------|----------------|----------------------------|---------------------|--------------|
| SQLite     | $0             | $0 (LiteFS FTW)           | Hell yeah           | Yup (Phase 3)|
| PostgreSQL | $0             | $10-20/month              | Kinda tight         | Nope         |
| MongoDB    | $0 (sketchy)  | $15-30/month              | Nope, too fat       | Nope         |

**Takeaway**: SQLite’s the only one that scales to 100,000 RPM without a bill. LiteFS seals the deal.

## Workload Tricks: Stretching $0 Far

Here’s the math I’m working with:
- **Traffic**: 100,000 RPM = 1,666 req/s. 1% writes (16.7/s), 99% reads (1,650/s).
- **Redis Magic**: Caches 99% of reads—1,633/s off SQLite’s plate. Leaves ~33 ops/s for the DB.
- **Bandwidth**: 13.33 Mbps, no sweat for 4 Gbps.

How I keep it cheap:
- **Redis**: Runs free on the VM, eats maybe 1-2 GB RAM, and slashes SQLite’s workload. Bit.ly’s 23,000 RPM with ~230 writes/min ([Bitly stats](https://bitly.com/pages/statistics)) shows this is normal for URL shorteners.
- **SQLite Tuning**: WAL mode, sync tweaks—keeps it fast and light ([Hacker News](https://news.ycombinator.com/item?id=35547819)).
- **One VM**: No multi-node nonsense ‘til Phase 3, and even then, LiteFS fits.

**Takeaway**: Redis and tuning make 100,000 RPM a breeze at $0—Oracle’s got me covered.

## Trade-Offs: What I’m Giving Up
- **SQLite**: No HA ‘til LiteFS kicks in, but Redis keeps redirects humming if SQLite hiccups.
- **PostgreSQL**: Could go HA with cash, but $10-20/month ain’t my vibe.
- **MongoDB**: Scales like a beast, but I’d be broke—$15-30/month is a non-starter.

## Why It Works
I’m at $0 because:
1. Oracle’s free tier is a tank—4 cores, 24 GB, 4 Gbps.
2. SQLite’s lean, and Redis picks up the slack—33 ops/s is nothing.
3. PostgreSQL and MongoDB want my wallet; SQLite doesn’t.

This ain’t just feasible—it’s a steal. Phase 1’s SQLite switch proves it, and LiteFS later keeps it bulletproof.

## What’s Next?
- **[Phase 1](/quicklinker-zerorpm/technical-architecture/phase-1)**: Where I make it happen.
- **[References](/quicklinker-zerorpm/references)**: The stuff I leaned on.

---
*Last Updated: March 11, 2025* -->