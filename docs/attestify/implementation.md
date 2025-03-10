---
layout: doc
title: Attestation SDK - Implementation
---

# Attestation SDK

**Implementation Guide**  
*Get started with secure attestation workflows*

## Implementation

Ready to build with the **Attestation SDK**? This guide walks you through installing and using the Core SDK, setting up the Attestify Backend, and leveraging the Attestify CLI. Whether you’re integrating it into a project or running a full attestation system, here’s how to get started with code examples and best practices. Check out the source code for each component below!

---

## Core SDK Setup

The Core SDK is the heart of Attestify, providing attestation and cryptographic functionality.

### Installation
Install via npm:
```bash
npm install attestation-sdk
```

### Basic Usage
Initialize an attestation with a custom derivation path:
```javascript
import { Attestation, Attest } from 'attestation-sdk';

const config = {
  ethereum: "m/44'/60'/0'/0",  // Ethereum standard
  cosmos: "m/44'/118'/0'/0",   // Cosmos standard
  custom: "m/44'/999'/0'/0"    // Custom path
};

const attestation = new Attestation(
  committerXpub,           // Extended public key of committer
  committeeXpub,           // Extended public key of committee
  config.ethereum,         // Derivation path
  "Payment of $10M",       // Payload
  "", "", "",              // Initial signatures (empty)
  Attest.INITIATED         // Starting state
);

attestation.initiateAttestation();
console.log(attestation.attestationId); // Unique UUID v4
```

### External Signing (e.g., MetaMask)
Integrate with Web3 wallets:
```javascript
async function signWithMetaMask(payload) {
  const accounts = await window.ethereum.request({ 
    method: 'eth_requestAccounts' 
  });
  const signature = await window.ethereum.request({
    method: 'personal_sign',
    params: [payload, accounts[0]]
  });
  return signature;
}

const signature = await signWithMetaMask(attestation.attestationPayload);
attestation.setCommitteeSignature(signature);
attestation.acknowledgeAttestation();
```

### Source Code
Explore the Core SDK:  
[**GitHub - Attestify SDK**](https://github.com/STarLo-rd/Attestify)

---

## Attestify Backend Setup

The backend extends the SDK with persistent storage and REST APIs.

### Prerequisites
- Node.js (v14+)
- npm (v6+)
- MongoDB (v4.4+)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/STarLo-rd/attestify-backend.git
   cd attestify-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment:
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/attestify
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRY=1h
   ```
4. Start the service:
   ```bash
   npm run dev  # Development mode
   npm start    # Production mode
   ```

### API Example
Create an attestation via Express:
```javascript
import express from 'express';
import { Attestation, Attest } from 'attestation-sdk';

const app = express();
app.use(express.json());

app.post('/create-attestation', async (req, res) => {
  const { committerXpub, committeeXpub, payload } = req.body;
  
  const attestation = new Attestation(
    committerXpub,
    committeeXpub,
    "m/44'/60'/0'/0",
    payload,
    "", "", "",
    Attest.INITIATED
  );
  
  attestation.initiateAttestation();
  
  // Store in database (pseudo-code)
  await db.attestations.create({
    id: attestation.attestationId,
    state: attestation.commitmentState,
    payload: attestation.attestationPayload
  });
  
  res.json({
    attestationId: attestation.attestationId,
    status: 'initiated'
  });
});

app.post('/acknowledge-attestation/:id', async (req, res) => {
  const { signature } = req.body;
  const attestation = await getAttestationFromDB(req.params.id); // Fetch from DB
  
  attestation.setCommitteeSignature(signature);
  attestation.acknowledgeAttestation();
  
  await updateAttestationInDB(attestation); // Update DB
  res.json({ status: 'acknowledged' });
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

### Verification Endpoint
Validate signatures:
```javascript
app.post('/verify-attestation', async (req, res) => {
  const { payload, signature, pubKey } = req.body;
  const isValid = SignatureService.verifySignature(payload, pubKey, signature);
  res.json({ isValid });
});
```

### Source Code
Explore the Backend:  
[**GitHub - Attestify Backend**](https://github.com/STarLo-rd/attestify-backend)

---

## Attestify CLI Setup

The CLI simplifies interaction with the backend and SDK.

### Prerequisites
- Node.js (v14+)
- npm (v6+)
- Running Attestify Backend

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/STarLo-rd/attestify-cli.git
   cd attestify-cli
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Usage
- **Quick Start**: Run the full lifecycle:
  ```bash
  npm run lifecycle
  ```
- **Manual Flow**:
  1. Register a user:
     ```bash
     node index.js register \
       --username alice \
       --email alice@example.com \
       --password password123 \
       --mnemonic "kit novel carpet brief draft install mammal nation link fabric crouch boy"
     ```
  2. Login:
     ```bash
     node index.js login --email alice@example.com --password password123
     ```
  3. Create a commitment:
     ```bash
     node index.js create-commitment \
       --committer "677169348ac63afebc3bf5ee" \
       --assetName "Gold" \
       --quantity 100 \
       --unit "grams"
     ```
  4. Acknowledge it:
     ```bash
     node index.js acknowledge-commitment \
       --commitmentId "67716a338ac63afebc3bf5f3" \
       --mnemonic "kit novel carpet brief draft install mammal nation link fabric crouch boy"
     ```

### Source Code
Explore the CLI:  
[**GitHub - Attestify CLI**](https://github.com/STarLo-rd/attestify-cli)