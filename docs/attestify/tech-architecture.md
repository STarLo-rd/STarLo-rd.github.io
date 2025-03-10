---
layout: doc
title: Attestation SDK - Technical Architecture
---

# Attestation SDK

**Technical Architecture**  
*Powering secure attestations with a robust, layered design*

## Technical Architecture

The **Attestation SDK** ecosystem is built to deliver secure, scalable, and developer-friendly attestation management. Its architecture spans three key layers: the **Core SDK** (TypeScript library), the **Attestify Backend** (Node.js service), and the **Attestify CLI** (command-line interface). Together, they form a cohesive system for handling digital payment commitments and mutual attestations, leveraging HD wallets, cryptographic signatures, and RESTful APIs.

Below, we break down each component and how they interconnect to power the Attestify experience.

---

## Core SDK

The foundation of Attestify, written in TypeScript, provides the logic for attestation lifecycle management and cryptographic operations.

### Key Components

- **Attestation Class**  
  *Manages the attestation lifecycle*  
  - Derives deterministic keys from extended public keys (xpubs) using BIP32/BIP39.  
  - Tracks state transitions: Initiated → Acknowledged → Effective → Discharged.  
  - Creates and verifies signatures with secure payload handling.  
  - Generates unique attestation IDs with UUID v4.

- **SignatureService**  
  *Handles cryptographic operations*  
  - Hashes payloads using SHA-256.  
  - Signs data with secp256k1 elliptic curve cryptography.  
  - Verifies signatures against public keys.  
  - Uses BN.js for big-number calculations.

### Technical Stack
- **tiny-secp256k1**: Elliptic curve operations for signatures.  
- **bip32/bip39**: HD wallet functionality.  
- **elliptic**: Additional signature operations.  
- **UUID v4**: Unique identifier generation.

The Core SDK is lightweight yet powerful, designed to integrate seamlessly with external signing services (e.g., MetaMask, WalletConnect) and custom derivation paths (e.g., Ethereum’s `m/44'/60'/0'/0`).

---

## Attestify Backend

A Node.js-based service that extends the Core SDK with persistent storage and API-driven workflows.

### Architecture Diagram
```
┌──────────────┐     ┌─────────────┐     ┌────────────┐
│    Client    │ ←─→ │   Express   │ ←─→ │  MongoDB   │
│    (CLI)     │     │   Server    │     │ Database   │
└──────────────┘     └─────────────┘     └────────────┘
                           ↓
                    ┌─────────────┐
                    │  Attestify  │
                    │    SDK      │
                    └─────────────┘
                           ↓
                    ┌─────────────┐
                    │ Crypto & HD │
                    │   Wallet    │
                    └─────────────┘
```

### Key Features
- **RESTful APIs**: Endpoints for user management and commitment lifecycle (e.g., `/create-attestation`, `/acknowledge-attestation`).  
- **MongoDB Integration**: Stores attestation data and user profiles.  
- **JWT Authentication**: Secures API access with token-based auth.  
- **Signature Verification**: Validates cryptographic signatures at each state transition.

### Technical Stack
- **Node.js**: Runtime environment.  
- **Express**: Web framework for APIs.  
- **MongoDB**: NoSQL database for persistence.  
- **Core SDK**: Embedded for attestation logic and crypto operations.

The backend bridges the Core SDK’s functionality with real-world applications, ensuring data durability and secure access.

---

## Attestify CLI

A command-line tool that interacts with the backend, providing a user-friendly interface for attestation workflows.

### Role in the Architecture
- **Client Layer**: Communicates with the backend via HTTPS/REST.  
- **Automation**: Executes the full commitment lifecycle (e.g., `npm run lifecycle`).  
- **User Interaction**: Simplifies tasks like registration, commitment creation, and state updates.

### Technical Stack
- **Node.js**: Powers the CLI runtime.  
- **Core SDK**: Embedded for local cryptographic operations (e.g., mnemonic-based key derivation).  
- **HTTPS Client**: Connects to the backend’s REST APIs.

The CLI acts as both a testing tool and a practical interface, making attestation management accessible without a GUI.

---

## How It All Fits Together

1. **Core SDK**: Provides the cryptographic and attestation logic, usable standalone or integrated into other systems.  
2. **Backend**: Wraps the SDK with a persistent layer, exposing APIs for broader application use.  
3. **CLI**: Ties it all together, offering a hands-on way to interact with the backend and test the SDK’s capabilities.

This layered approach ensures flexibility—use the SDK alone for lightweight projects, or pair it with the backend and CLI for a full-featured attestation system.

---

## Security Foundations

- **Cryptography**: secp256k1 and SHA-256 ensure signature integrity.  
- **HD Wallets**: BIP32/BIP39 provide secure, hierarchical key management.  
- **State Validation**: Enforces valid transitions with signature checks.  
- **Backend Security**: JWT, bcrypt hashing, and input validation protect the API.

---

## Next Steps

Explore the [Use Cases](./usecases.md) to see how this architecture solves real problems, or jump to [Implementation](./implementation.md) for setup and code examples.
