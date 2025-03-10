---
layout: doc
title: Attestation SDK - Use Cases
---

# Attestation SDK

**Use Cases**  
*Real-world applications of secure attestation management*

## Use Cases

The **Attestation SDK**—with its Core SDK, Backend, and CLI—powers a range of scenarios requiring trust, verifiability, and scalability. Built for digital payment commitments and mutual attestations, it leverages HD wallets, cryptographic signatures, and a robust lifecycle to tackle challenges in finance, agreements, and beyond. Below are key use cases where Attestify shines, showing how it delivers value in practical settings.

---

## 1. Securing Digital Payment Commitments

*Ensuring trust in financial agreements*

### Scenario
A bank and a corporate client need to agree on a digital payment commitment—say, a $10M trade settlement. Traditional systems rely on slow, centralized verification, risking delays or disputes.

### How Attestify Helps
- **Initiation**: The bank (committer) creates a commitment via the SDK, specifying asset details (e.g., `$10M, USD`) and signs it with their HD wallet-derived key.  
- **Acknowledgment**: The client (committee) verifies and countersigns using the CLI or backend API, moving the state to Acknowledged.  
- **Effectiveness**: Both parties confirm the terms, transitioning to Effective with dual signatures.  
- **Discharge**: Upon settlement, the bank discharges the commitment, cryptographically proving fulfillment.

### Benefits
- **Speed**: Instant state transitions replace days-long processes.  
- **Trust**: Multi-signature verification ensures non-repudiation.  
- **Auditability**: MongoDB logs every step for compliance (e.g., BAFT protocol).

---

## 2. Mutual Attestations for Business Agreements

*Proving agreement between parties*

### Scenario
Two companies negotiate a supply chain contract—e.g., delivering 100 tons of steel. They need a tamper-proof way to confirm terms without intermediaries.

### How Attestify Helps
- **CLI Workflow**: Company A initiates the attestation (e.g., `node index.js create-commitment --assetName "Steel" --quantity 100`), storing it via the backend.  
- **Acknowledgment**: Company B acknowledges it with their signature (`acknowledge-commitment`), verified by the SDK’s SignatureService.  
- **Acceptance**: Company A accepts, locking in the deal.  
- **Discharge**: After delivery, both sign to discharge, completing the cycle.

### Benefits
- **Simplicity**: The CLI abstracts complexity for non-technical users.  
- **Security**: secp256k1 signatures prevent tampering.  
- **Flexibility**: Custom derivation paths support multi-blockchain environments.

---

## 3. Decentralized Finance (DeFi) Workflows

*Powering trustless financial operations*

### Scenario
A DeFi platform needs to manage collateral commitments between lenders and borrowers, integrating with wallets like MetaMask.

### How Attestify Helps
- **External Signing**: The borrower initiates a commitment via the SDK, signing with MetaMask (`signWithMetaMask`).  
- **Backend Storage**: The lender acknowledges it through the `/acknowledge-attestation` API, persisted in MongoDB.  
- **State Management**: The SDK validates transitions (Initiated → Effective), ensuring collateral is locked.  
- **Release**: After repayment, the discharge phase unlocks funds.

### Benefits
- **Compatibility**: Works with Web3 wallets out of the box.  
- **Scale**: Handles high transaction volumes with lightweight design.  
- **Reliability**: State validation prevents invalid transitions.

---

## 4. Supply Chain Provenance

*Tracking goods with verifiable commitments*

### Scenario
A retailer wants to prove the origin of organic coffee beans to consumers, ensuring suppliers meet sustainability commitments.

### How Attestify Helps
- **Commitment Creation**: The supplier attests to sourcing details (e.g., 500kg from Farm X) using the CLI.  
- **Verification**: The retailer acknowledges via the backend, confirming receipt.  
- **Public Proof**: The Effective state, signed by both, is shared as a QR code for consumer trust.  
- **Completion**: Discharge occurs upon sale, closing the loop.

### Benefits
- **Transparency**: Cryptographic proof builds consumer confidence.  
- **Efficiency**: Automates multi-party verification.  
- **Persistence**: Backend logs ensure traceability.

---

## Why These Matter

These use cases highlight Attestify’s versatility:
- **Financial Trust**: Secures payments and agreements with cryptographic rigor.  
- **Operational Efficiency**: Automates workflows across industries.  
- **Developer Enablement**: Simplifies integration into diverse systems.

From banks to DeFi platforms to supply chains, Attestify turns complex attestation needs into streamlined, secure solutions.

---

## See It in Action

Check out the [Demo](./demo.md) for a live example, or dive into [Implementation](./implementation.md) to start building with Attestify.
