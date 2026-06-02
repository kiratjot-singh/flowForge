# FlowForge Backend 🚀

A deployment platform backend inspired by Vercel and Railway.

FlowForge automates application deployments by receiving GitHub webhooks, cloning repositories, building projects inside Docker containers, storing deployment logs, and serving deployment metadata through APIs.

---

## Features

### Deployment Pipeline

* GitHub Webhook Integration
* Repository Cloning
* Docker-based Build Environment
* Dependency Installation
* Automated Builds
* Static Site Detection
* Build Output Detection

### Deployment Management

* Deployment Creation
* Deployment Status Tracking
* Deployment Logs
* Deployment Details API
* Deployment Serving

### Queue Processing

* Background Job Processing
* Redis Queue Management
* Build Isolation
* Asynchronous Deployments

---

## Architecture

```text
GitHub
   │
   ▼
Webhook Endpoint
   │
   ▼
Express API
   │
   ▼
PostgreSQL
   │
   ▼
BullMQ Queue
   │
   ▼
Deployment Worker
   │
   ▼
Docker Container
   │
   ▼
Build Output
```

---

## Tech Stack

### Backend

* Node.js
* Express.js

### Database

* PostgreSQL

### Queue System

* BullMQ
* Redis

### DevOps

* Docker
* GitHub Webhooks

---

## Deployment Flow

### 1. Webhook Received

```http
POST /api/v1/webhooks/github
```

GitHub sends repository information.

---

### 2. Deployment Created

A deployment record is created.

```text
PENDING
```

---

### 3. Queue Job Added

A BullMQ job is created.

```text
build-project
```

---

### 4. Worker Executes

The deployment worker:

* Clones repository
* Installs dependencies
* Runs build commands
* Detects output folder
* Saves logs

---

### 5. Status Updates

```text
PENDING
   ↓
RUNNING
   ↓
SUCCESS
```

or

```text
PENDING
   ↓
RUNNING
   ↓
FAILED
```

---

## API Endpoints

### Webhooks

```http
POST /api/v1/webhooks/github
```

### Deployments

```http
GET /api/v1/deployments
GET /api/v1/deployments/:id
GET /api/v1/deployments/:id/details
GET /api/v1/deployments/:id/logs
```

---

## Local Setup

### Install Dependencies

```bash
npm install
```

### Configure Environment

```env
DATABASE_URL=
REDIS_URL=
PORT=3000
```

### Start Redis

```bash
redis-server
```

### Start API

```bash
npm run dev
```

### Start Worker

```bash
node src/workers/deployment.worker.js
```

---

## Future Improvements

* Custom Domains
* Deployment Rollbacks
* WebSocket Logs
* Authentication
* Team Workspaces
* Build Caching

---

## Author

Built by Kiratjot Singh.

FlowForge Backend was created to understand how modern deployment platforms such as Vercel and Railway work internally.
