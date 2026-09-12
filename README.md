# Clinical Trial Management System (CTMS)

GCP-compliant full-stack web application for managing clinical trials end-to-end.

## Tech Stack
- **Backend**: Spring Boot 3.x, Spring Security + JWT, Spring Data JPA, MySQL 8
- **Frontend**: React 18 (Vite), React Router v6, Axios, Recharts
- **Auth**: JWT RBAC with 8 roles

---

## Prerequisites
- Java 17+
- Maven 3.9+
- Node.js 18+
- MySQL 8 (local or via Docker)

---

## Quick Start

### Option A — Use your local MySQL (already installed)
MySQL is already running on your machine. The database `ctms_db` will be auto-created on first boot.

### Option B — Use Docker for MySQL
```bash
docker-compose up -d
```

---

### 1. Start the Backend
```bash
cd backend
mvn spring-boot:run
```
Backend starts on **http://localhost:8080**
Swagger UI: **http://localhost:8080/swagger-ui.html**

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```
Frontend starts on **http://localhost:8081**

---

## Demo Login Credentials

All users use password: **Demo@1234**

| Role | Username |
|------|----------|
| System Administrator | `admin` |
| Sponsor | `sponsor` |
| Principal Investigator | `pi_user` |
| Sub-Investigator | `subinv` |
| Site Coordinator | `coordinator` |
| Data Manager | `datamanager` |
| Regulatory Affairs | `regaffairs` |
| Participant | `participant1` |

---

## Key Features by Module

| Module | Endpoint Prefix | Notes |
|--------|----------------|-------|
| Auth | `/api/auth` | JWT login, register, lockout |
| Studies | `/api/studies` | Protocol setup, DB lock |
| Participants | `/api/participants` | Pseudonymized subject IDs |
| eCRF | `/api/ecrf` | e-signature, deviation detection |
| Adverse Events | `/api/adverse-events` | SAE 24h rule, SUSAR |
| IP Accountability | `/api/ip` | Balance enforcement |
| Regulatory Docs | `/api/documents` | TMF upload |
| Admin | `/api/admin` | Audit logs, analytics, health |

---

## GCP Compliance Features
- SHA-256 hash-chained audit logs (insert-only, tamper-evident)
- AES-256 encryption for blinded treatment assignments
- 21 CFR Part 11 electronic signatures on all critical actions
- Protocol deviation auto-detection on eCRF save
- SAE 24-hour reporting countdown
- Account lockout after 5 failed login attempts
- 8-hour JWT expiry for staff, 24-hour for participants
- Mandatory modification reason for all eCRF edits

---

## Notes
- TLS termination should be handled at the deployment layer (nginx/load balancer)
- MFA is stubbed — TOTP flag exists on Users entity, endpoint ready for integration
- Lab system / MedDRA / regulatory portal integrations are mocked with `// TODO` comments
