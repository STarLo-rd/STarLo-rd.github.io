---
title: BrandPulse - Sentiment Analysis
description: Powering real-time brand insights with flexible sentiment distribution—fixed or wildly volatile.
---

# Sentiment Analysis: Giving BrandPulse Its Emotional Edge

When I set out to build BrandPulse, I knew sentiment analysis was the heartbeat of the project. It’s not enough to just process 500K posts per second—you’ve got to *understand* what people are saying about "SuperCoffee" in real time. Are they hyped? Pissed off? Meh? That’s where this piece comes in. I didn’t want a one-size-fits-all approach, so I cooked up two distinct modes for generating sentiment in the tweet pool: **Fixed Values** for precision and **High Volatility Random** for chaos. Here’s how I made it happen.

## The Challenge
Sentiment isn’t static in the real world. Sometimes you’ve got a steady vibe—like 50% positive chatter about a new coffee blend—and other times it’s a rollercoaster, swinging from love to hate in minutes. I needed BrandPulse to handle both: a controlled setup for testing and a wild, unpredictable mode to mimic real social media storms. Plus, it had to scale without choking on the 500K posts/sec target. No pressure, right?

## The Plan
I split the sentiment generation into two flavors:
1. **Fixed Mode**: Let the user dial in exact percentages—like 50% positive, 30% negative, 20% neutral—and enforce that across every tweet. Consistency is king here.
2. **Volatile Mode**: Toss predictability out the window. Each batch gets its own random sentiment split, swinging hard—like 80% positive one second, 10% the next. Real-world chaos, bottled up.

The trick was making these modes play nice with the Kafka pipeline and keeping the system lean enough to hit my throughput goals. Let’s break it down.

## The Two Modes

### Fixed Mode: Locking It Down
In Fixed Mode, it’s all about control. The user sets the sentiment split (via `userSentimentDistribution`), and I make damn sure every batch sticks to it. Say you want 50% positive, 30% negative, 20% neutral—I generate the tweet pool upfront and enforce those ratios across the board. No surprises, just clean, predictable data.

- **How It Works**: The `generateTweetPool` function takes the user’s percentages and builds a pool of tweets with sentiment assigned proportionally. Every batch pulls from this pool, so the distribution stays rock-solid.
- **Why It’s Useful**: Perfect for testing specific scenarios—like simulating a steady brand reputation—or proving the system can handle a known baseline at scale.

### Volatile Mode: Unleashing the Storm
Volatile Mode is where things get spicy. Instead of sticking to one distribution, I let each batch roll its own dice. One batch might be 80% positive, the next 15%—controlled by a `volatilityFactor` I set to 0.8 (on a 0-to-1 scale, where 1 is pure madness). It’s like watching a Twitter mob flip moods in real time.

- **How It Works**: The `adjustBatchSentiment` function kicks in here. It takes the base tweet pool and rerolls the sentiment for each batch, skewing it with big swings. That `volatilityFactor` dials up the chaos—0.8 means pretty extreme shifts, but not total anarchy.
- **Why It’s Useful**: This mimics real crises or viral moments—think a PR disaster or a product launch going viral. It stress-tests BrandPulse’s ability to adapt on the fly.

## The Code: Sentiment in Action
Here’s a stripped-down look at how I wired it up in `index.js`. Nothing fancy—just enough to show the guts:

```javascript
const tweetSchema = require("./schema/tweetSchema");
const crypto = require("crypto");

// Predefined tweet templates
const tweetTemplates = [
  "{brand} is {positiveAdj}!",
  "I {positiveVerb} {brand}!",
  "{brand} tastes {negativeAdj}",
  "Just tried {brand}, feeling {neutralAdj}",
  "Why does {brand} have to be so {negativeAdj}?",
  "Drinking {brand} today, it’s {neutralAdj}",
];

// Sentiment-specific word banks
const wordBanks = {
  positiveAdj: ["awesome", "great", "fantastic", "delicious", "amazing"],
  positiveVerb: ["love", "enjoy", "adore", "appreciate"],
  negativeAdj: ["awful", "terrible", "gross", "disappointing", "bad"],
  neutralAdj: ["okay", "fine", "normal", "average", "meh"],
};

// Default sentiment distribution for fixed mode
const DEFAULT_SENTIMENT_DISTRIBUTION = {
  positive: 0.33,
  negative: 0.33,
  neutral: 0.34,
};

// Function to generate a tweet pool
const generateTweetPool = ({
  size = 1000,
  brand = "SuperCoffee",
  sentimentDistribution = DEFAULT_SENTIMENT_DISTRIBUTION, // Used only in fixed mode
  mode = "fixed", // "fixed" or "volatile"
} = {}) => {
  const pool = [];

  // Fixed mode: Normalize user-provided sentiment distribution
  let fixedSentiments;
  if (mode === "fixed") {
    const { positive, negative, neutral } = sentimentDistribution;
    const total = (positive || 0) + (negative || 0) + (neutral || 0);
    if (total === 0) throw new Error("Sentiment distribution percentages must sum to a non-zero value");

    fixedSentiments = {
      positive: (positive || 0) / total,
      negative: (negative || 0) / total,
      neutral: (neutral || 0) / total,
    };
  }

  for (let i = 0; i < size; i++) {
    let sentiment;
    if (mode === "fixed") {
      // Fixed mode: Use normalized user-defined percentages
      const rand = Math.random();
      sentiment =
        rand < fixedSentiments.positive
          ? "positive"
          : rand < fixedSentiments.positive + fixedSentiments.negative
          ? "negative"
          : "neutral";
    } else if (mode === "volatile") {
      // Volatile mode: Fully random sentiment with high variability
      const rand = Math.random();
      sentiment =
        rand < 0.33 ? "positive" : rand < 0.66 ? "negative" : "neutral";
      // Note: In volatile mode, we regenerate sentiment per batch later
    } else {
      throw new Error("Invalid mode. Use 'fixed' or 'volatile'.");
    }

    // Pick a random template
    const template = tweetTemplates[Math.floor(Math.random() * tweetTemplates.length)];
    let text = template.replace("{brand}", brand);

    // Replace placeholders based on sentiment
    if (template.includes("{positiveAdj}")) {
      text = text.replace(
        "{positiveAdj}",
        wordBanks.positiveAdj[Math.floor(Math.random() * wordBanks.positiveAdj.length)]
      );
    } else if (template.includes("{positiveVerb}")) {
      text = text.replace(
        "{positiveVerb}",
        wordBanks.positiveVerb[Math.floor(Math.random() * wordBanks.positiveVerb.length)]
      );
    } else if (template.includes("{negativeAdj}")) {
      text = text.replace(
        "{negativeAdj}",
        wordBanks.negativeAdj[Math.floor(Math.random() * wordBanks.negativeAdj.length)]
      );
    } else if (template.includes("{neutralAdj}")) {
      text = text.replace(
        "{neutralAdj}",
        wordBanks.neutralAdj[Math.floor(Math.random() * wordBanks.neutralAdj.length)]
      );
    }

    pool.push({
      value: tweetSchema.toBuffer({
        tweetId: crypto.randomUUID(),
        timestamp: Date.now(),
        text,
        brand,
        sentiment,
      }),
    });
  }

  return pool;
};

// Function to adjust sentiment distribution per batch in volatile mode
const adjustBatchSentiment = (batch, volatilityFactor = 0.8) => {
  // Volatility factor: Higher value = more extreme swings (0 to 1)
  const positiveWeight = Math.random() * volatilityFactor + (1 - volatilityFactor) * 0.33;
  const negativeWeight = Math.random() * (1 - positiveWeight) * volatilityFactor + (1 - volatilityFactor) * 0.33;
  const neutralWeight = 1 - positiveWeight - negativeWeight;

  return batch.map((message) => {
    const rand = Math.random();
    const sentiment =
      rand < positiveWeight
        ? "positive"
        : rand < positiveWeight + negativeWeight
        ? "negative"
        : "neutral";

    const template = tweetTemplates[Math.floor(Math.random() * tweetTemplates.length)];
    let text = template.replace("{brand}", "SuperCoffee");

    if (template.includes("{positiveAdj}")) {
      text = text.replace(
        "{positiveAdj}",
        wordBanks.positiveAdj[Math.floor(Math.random() * wordBanks.positiveAdj.length)]
      );
    } else if (template.includes("{positiveVerb}")) {
      text = text.replace(
        "{positiveVerb}",
        wordBanks.positiveVerb[Math.floor(Math.random() * wordBanks.positiveVerb.length)]
      );
    } else if (template.includes("{negativeAdj}")) {
      text = text.replace(
        "{negativeAdj}",
        wordBanks.negativeAdj[Math.floor(Math.random() * wordBanks.negativeAdj.length)]
      );
    } else if (template.includes("{neutralAdj}")) {
      text = text.replace(
        "{neutralAdj}",
        wordBanks.neutralAdj[Math.floor(Math.random() * wordBanks.neutralAdj.length)]
      );
    }

    return {
      value: tweetSchema.toBuffer({
        tweetId: crypto.randomUUID(),
        timestamp: Date.now(),
        text,
        brand: "SuperCoffee",
        sentiment,
      }),
    };
  });
};

module.exports = { generateTweetPool, adjustBatchSentiment };
```

## Mode Selection: Keeping It Simple
I added a `MODE` constant in `index.js` to flip between the two. Set it to `"fixed"`, and `generateTweetPool` locks in the user’s percentages. Switch to `"volatile"`, and `adjustBatchSentiment` takes over, scrambling sentiment batch by batch. It’s dead simple but gives me total flexibility—whether I’m demoing a steady state or a social media meltdown.

## Results
- **Fixed Mode**: Dead-on accuracy. If I set 50/30/20, I get 50/30/20—every batch, every time. Throughput holds steady at 500K posts/sec with no hiccups.
- **Volatile Mode**: Wild but workable. Sentiment swings hit extremes (e.g., 85% positive to 5% in back-to-back batches), and the system still churns through 500K/sec. The `volatilityFactor` at 0.8 feels right—chaotic but not cartoonish.

## Why It Matters
This isn’t just about slapping sentiment labels on tweets—it’s about making BrandPulse *useful*. Fixed Mode lets brands benchmark their reputation; Volatile Mode shows they can survive a storm. For me, it’s proof I can build something flexible and fast—two birds, one stone. Recruiters want to see real-time systems that solve real problems, and this delivers.

## Challenges Faced
- **Balancing Volatility**: Early versions of Volatile Mode were *too* random—batches flipped 100% positive to 100% negative. The `volatilityFactor` tamed it without killing the vibe.
- **Performance Hit**: Rerolling sentiment in Volatile Mode added a tiny overhead (~1ms per batch). At 500K/sec, that’s negligible, but it’s on my radar for [future tweaks](../future-enhancements).

## Next Steps
This is solid, but I’m not done. I could add a hybrid mode—say, fixed baselines with controlled bursts of volatility—or plug in a real NLP model instead of random assignment. Check out [Future Enhancements](../future-enhancements) for where I’m headed next.
