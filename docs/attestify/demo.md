---
layout: doc
title: Attestation SDK - Demo
---

# Attestation SDK

**Demo**  
*Experience secure attestations in action*

## Demo

Want to see the **Attestation SDK** at work? This demo walks you through a complete attestation lifecycle—from user registration to commitment discharge—using the Attestify CLI, Backend, and Core SDK. Follow along to witness how cryptographic signatures and state transitions secure a digital commitment, like a 100-gram gold trade. Let’s dive in!

---

## Prerequisites

Before starting, ensure you have:
- Node.js (v14+)
- npm (v6+)
- MongoDB (v4.4+) running locally
- Cloned and set up the backend and CLI (see [Implementation](./implementation.md))

---

## Quick Start: Automated Lifecycle

For a fast demo, run the CLI’s automated script to see the full flow in one go.

### Setup
1. Start the backend:
   ```bash
   cd attestify-backend
   npm install
   cp .env.example .env  # Edit .env with MONGODB_URI and JWT_SECRET
   npm start
   ```
2. Navigate to the CLI:
   ```bash
   cd attestify-cli
   npm install
   ```

### Run the Demo
Execute the lifecycle script:
```bash
npm run lifecycle
```

### What Happens
- **Registers** two users (committer and committee).  
- **Creates** a commitment (e.g., "Gold, 100 grams").  
- **Acknowledges**, **Accepts**, and **Discharges** it with signatures.  
- **Output**: Logs each step, showing IDs, states, and verification.

This script simulates the entire process—perfect for a quick taste of Attestify’s power!

---

## Manual Walkthrough: Step-by-Step

For a deeper dive, let’s manually execute the lifecycle, mirroring a real-world scenario.

### Step 1: Setup Environment
- Backend running at `http://localhost:3000` (from Quick Start).
- CLI installed and ready.

### Step 2: Register Users
Register the committer (Bob):
```bash
node index.js register \
  --username bob \
  --email bob@example.com \
  --password password123 \
  --mnemonic "fitness spider can adjust pencil system wide margin regular pencil prize eager"
```
Register the committee (Alice):
```bash
node index.js register \
  --username alice \
  --email alice@example.com \
  --password password123 \
  --mnemonic "kit novel carpet brief draft install mammal nation link fabric crouch boy"
```

### Step 3: Login
Login as Bob (save the token from the response):
```bash
node index.js login --email bob@example.com --password password123
```
Login as Alice (save her token too):
```bash
node index.js login --email alice@example.com --password password123
```

### Step 4: Create a Commitment
As Bob, create a commitment for 100 grams of gold (use Bob’s user ID from login):
```bash
node index.js create-commitment \
  --committer "677169348ac63afebc3bf5ee" \
  --assetName "Gold" \
  --quantity 100 \
  --unit "grams"
```
- **Output**: Returns a `commitmentId` (e.g., `67716a338ac63afebc3bf5f3`).

### Step 5: Acknowledge the Commitment
As Alice, acknowledge it with her mnemonic:
```bash
node index.js acknowledge-commitment \
  --commitmentId "67716a338ac63afebc3bf5f3" \
  --mnemonic "kit novel carpet brief draft install mammal nation link fabric crouch boy"
```
- **State**: Moves from `INITIATED` to `ACKNOWLEDGED`.

### Step 6: Accept the Commitment
As Bob, accept it:
```bash
node index.js accept-commitment \
  --commitmentId "67716a338ac63afebc3bf5f3" \
  --mnemonic "fitness spider can adjust pencil system wide margin regular pencil prize eager"
```
- **State**: Moves to `EFFECTIVE`.

### Step 7: Discharge the Commitment
As Bob, discharge it after fulfillment:
```bash
node index.js discharge-commitment \
  --commitmentId "67716a338ac63afebc3bf5f3" \
  --mnemonic "fitness spider can adjust pencil system wide margin regular pencil prize eager"
```
- **State**: Moves to `DISCHARGED`.

### What You’ll See
- Each command logs the updated state and signature verification.  
- The backend stores the commitment in MongoDB, viewable at `http://localhost:3000/api/commitments`.

---

## Behind the Scenes

- **Core SDK**: Generates signatures with secp256k1 and manages state transitions.  
- **Backend**: Validates signatures via REST APIs and persists data.  
- **CLI**: Orchestrates the flow, interacting with the backend over HTTPS.

The lifecycle (`INITIATED → ACKNOWLEDGED → EFFECTIVE → DISCHARGED`) ensures trust and non-repudiation at every step.

---

## Try It Yourself

Clone the repos and tweak the payload—say, “$10M USD” instead of gold. Check the source code:  
- [Attestify SDK](https://github.com/STarLo-rd/Attestify)  
- [Attestify Backend](https://github.com/STarLo-rd/attestify-backend)  
- [Attestify CLI](https://github.com/STarLo-rd/attestify-cli)

Revisit [Implementation](./implementation.md) for setup details or [Use Cases](./usecases.md) for more ideas.
