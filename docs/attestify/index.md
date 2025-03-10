---
layout: doc
title: Attestation SDK - Overview
---

# Attestation SDK

**Managing digital payment commitments with cryptographic precision**  
*A TypeScript toolkit for secure, scalable attestation workflows*

## Overview

The **Attestation SDK** is a powerful TypeScript library designed to manage digital payment commitments using hierarchical deterministic (HD) wallets and cryptographic attestations, adhering to the BAFT Digital Ledger Payment Commitment protocol. Whether you’re building decentralized finance applications, securing mutual agreements, or automating commitment lifecycles, this SDK provides the tools to handle it all—securely and at scale.

This project goes beyond a single library. It’s a complete ecosystem featuring:
- **Core SDK**: The foundation for attestation lifecycle management and cryptographic operations.
- **Attestify Backend**: A RESTful service for user management, commitment persistence, and signature verification.
- **Attestify CLI**: A command-line interface for seamless interaction with the system.

Together, they form **Attestify**—a robust solution for cryptographically secure mutual attestations.

---

## Key Features

- **HD Wallet Integration**: Supports BIP32/BIP39 standards for secure key derivation.  
- **Cryptographic Security**: Uses secp256k1 for signature creation and verification.  
- **Flexible Signing**: Compatible with external services like MetaMask and WalletConnect.  
- **Lifecycle Management**: Handles attestation states—Initiated, Acknowledged, Effective, Discharged.  
- **Developer-Friendly**: Offers configurable derivation paths, state validation, and detailed error handling.  
- **Backend Support**: Integrates with a MongoDB-backed REST API for persistent workflows.  
- **CLI Automation**: Simplifies attestation management with command-line tools.

---

## Why Attestify?

In a world where digital agreements need trust and speed, Attestify solves critical challenges:
- **Trust**: Multi-signature verification ensures non-repudiation and integrity.  
- **Scale**: Lightweight design scales from small projects to enterprise systems.  
- **Simplicity**: Abstracts complex cryptography into an easy-to-use API and CLI.

Whether it’s securing payment commitments or proving agreement between parties, Attestify empowers developers to build reliable, tamper-proof systems.

---

## Components

### Core SDK
The heart of Attestify, built in TypeScript:
- Manages attestation lifecycles with state transitions.  
- Generates and verifies signatures using industry-standard cryptography.  
- Integrates HD wallets for secure key management.  

### Attestify Backend
A Node.js service with Express and MongoDB:
- Exposes REST APIs for user and commitment management.  
- Stores attestation data securely with JWT authentication.  
- Validates signatures and tracks commitment states.  

### Attestify CLI
A user-friendly interface:
- Automates the full attestation lifecycle via commands.  
- Interacts with the backend for real-world workflows.  
- Perfect for testing, scripting, or manual operation.  

---

## Get Started

Ready to dive in? Install the SDK with:
```bash
npm install attestation-sdk
```
Explore the [Implementation Guide](./implementation.md) for setup details, or check out the [Demo](./demo.md) for a hands-on example.


