
<img width="1920" height="1080" alt="Screenshot 2025-11-15 134554" src="https://github.com/user-attachments/assets/959d898a-cbc6-48ae-b864-d4a9b96052db" />

# URL_Shortener
# Monitoring a Containerized URL Shortener Webservice

A DevOps project to build, containerize, and monitor a functional URL shortener webservice using Docker, Prometheus, and Grafana. The project is designed to demonstrate containerization, service monitoring, metrics visualization, and alerting.
---

## Team Members
- Karim Walid Sayed Zaki 
- Mariam Mahmoud Khairy 
- Yusuf Salah Nafea Hassan 
- Ahmed Mohamed Hassan Khodary 
- Adham Emad Elrefaie 
---

# 1. Project Planning & Management
## 1.1 Project Proposal — Overview, Objectives & Scope**

Overview: Build a scalable, secure, and user-friendly URL shortening service that accepts long URLs and returns short, memorable aliases (with redirect), analytics, optional user accounts, and API access.

**Objectives**

1. Reduce long URLs into short, manageable links.
2. Provide high performance (fast redirect times, minimal latency).
3. Ensure data integrity and persistence using PostgreSQL.
4. Collect system metrics for monitoring (Prometheus).
5. Provide an intuitive front-end experience.

**Scope (MVP vs. Future)**

1. MVP: shorten, redirect, analytics (click count, referrer, timestamp), basic web UI, REST API.

2. v1+: custom aliases, auth & user dashboard, QR code, expiration, link tags, CSV import/export.

---

## 1.2 Project Plan (Timeline & Milestones)

| Steps | Feature |
|--------|-------------|
| Week 1 | Project kickoff, requirements gathering, stakeholder analysis, Use cases, DB design  |
| Week 2 | Backend skeleton + DB migrations + API endpoints  |
| Week 3 | Frontend basic UI + tests for endpoints |
| Week 4 | Containiraztion using Docker  |
| Week 5 | Orchestration using Kubernets |
| Week 6 | Monitoring/Alerting + Bug Fixes |

<img width="1082" height="694" alt="Gantt Chart Whiteboard 0png" src="https://github.com/user-attachments/assets/b9a5ed2c-b18f-4d83-bde3-657b64824d07" />

## 1.3 Task Assignment & Roles

1. Team Lead — coordinate schedule, deliverables, presentation.
2. Backend Engineer — API, database, authentication, analytics ingestion.
3. Frontend Engineer / UX — web UI, wireframes, accessibility.
4. DevOps / QA — CI/CD, hosting, tests, performance tuning.
5. Documentation / Tester — user manual, test cases, video demo.
-----
## 1.4 Risk Assessment & Mitigation
| Risk | Impact |	Likelihood | Mitigation |
|------|--------|------------|------------|
| DB connection failure | High | Medium	| Retry logic implemented |
| API downtime |	Medium | Low |	Health checks, monitoring | 
| Incorrect redirects	| Low | Medium |	Validation + DB constraints |
| System overload |	Medium | Low | horizontal scaling |
---------
## 1.5 KPIs

1. API response time < 200ms
2. System uptime > 99%
3. Redirect success rate > 98%
4. Error count (tracked via Prometheus)
----------

# 2. Literature Review / Feedback & Evaluation

## Lecturer’s feedback items to collect

1. Quality of documentation
2. Code cleanliness & comments
3. Test coverage
4. Security considerations
5. UX accessibility

## Suggested improvements to include after feedback:

1. Add automated malware checking for target URLs
2. Add separate analytics retention policy
3. Add rate-limiting & token quotas for public API

## Final Grading Criteria (Expected)

1. Documentation & report: 25%
2. Implementation & functionality: 35%
3. Testing & QA: 15%
4. Presentation & demo: 15%
5. Innovation & extras: 10%
---
# 3. Requirements Gathering 

## 3.1 Stakeholder Analysis

1. End users — want quick, reliable shortening, link management.
2. Developers — API to integrate with apps.
3. Lecturer/examiner — evaluate technical design, tests, documentation.

## 3.2 User Stories & Use Cases 

As a user, I can submit a long URL and receive a short URL.

## 3.3 Functional Requirements

1. Create short URLs (auto-generated).
2. Redirect short URL to original URL.
3. Public REST API with API key / token auth.

## 3.4 Non-functional Requirements

1. Performance: redirect latency targets .
2. Security: input validation, Alerting .
3. Reliability: Perrsistent Volumes, backups.
4. Usability: accessible UI, simple flow, mobile responsive.
------
# 4. System Analysis & Design
##  Problem Statement & Objectives
### Problem Statement

In today's digital landscape, users often need to share long, cumbersome URLs (e.g., from articles, videos, or e-commerce pages) via social media, emails, or messaging apps. These long URLs can be unwieldy, prone to breakage when copied, and aesthetically unappealing. Additionally, tracking usage and ensuring reliability in a distributed environment (e.g., containerized deployments) is challenging without proper monitoring. The provided code implements a URL shortener service that integrates with deployment tools like Docker and Kubernetes (K8s). The system must handle URL shortening, redirection, and metrics collection while being deployable in containerized environments with Prometheus for observability.

### objectives
1. Primary Goals: Develop a reliable URL shortener that converts long URLs to short, unique codes; redirects users from short codes to original URLs; and provides a simple web interface for users to interact with the service.
2. Secondary Goals: Ensure scalability and fault tolerance through containerization (Docker/K8s), monitor system performance with Prometheus (e.g., tracking shortened URLs, redirects, and latencies), and maintain data persistence using PostgreSQL.
3. Project Scope: Focus on core functionality (shorten, redirect, health check, metrics) with a React-based frontend. Exclude advanced features like user authentication, analytics dashboards, or custom domains unless specified.
4. Constraints: The system must handle high traffic, prevent duplicate shortenings, and support hybrid secret management (file-based for Docker Compose, env vars for K8s).

##  Use Case Diagram & Descriptions

The system involves primary actors: End User (who shortens and accesses URLs) and Monitoring System (Prometheus, which scrapes metrics). Use cases include shortening URLs, redirecting, checking health, and exposing metrics.

![Screenshot_26-11-2025_16726_](https://github.com/user-attachments/assets/985b823d-923a-41b8-8474-3b2b26ce5f32)

1. Shorten URL: Actor - End User. Preconditions - Valid long URL provided. Steps: User submits long URL via frontend; backend checks for duplicates; generates short code if new; stores in DB; returns short URL.
2. Postconditions - Short URL created or existing one returned.
3. Access Short URL (Redirect): Actor - End User. Preconditions - Valid short code. Steps: User navigates to short URL; backend queries DB; redirects to long URL if found. Postconditions - User redirected or 404 error.
4. View Health: Actor - End User or Admin. Steps: GET /api/health; returns status "ok".
5. Scrape Metrics: Actor - Monitoring System (Prometheus). Steps: GET /metrics; returns Prometheus-formatted metrics (e.g., counters for shortens, redirects).

------
## Functional & Non-Functional Requirements
### Functional Requirements

1. URL Shortening: Accept a long URL via POST /api/shorten; check for duplicates; generate a unique 6-character short code using nanoid; store in PostgreSQL; return the short URL (e.g., BASE_URL/s/shortCode).
2. URL Redirection: Handle GET /s/:shortCode; query DB for matching long URL; redirect (301) to it if found; return 404 if not.
3. Health Check: Provide GET /api/health endpoint returning { status: "ok" } for liveness probes.
4. Metrics Exposure: Expose Prometheus metrics at GET /metrics, including counters (shortened_urls_total, successful_redirects_total, failed_lookups_total) and histogram (http_request_duration_seconds).
5. Frontend Interaction: React app allows users to input long URL, submit to backend, display short URL, and copy to clipboard.
6. Database Initialization: Automatically create 'urls' table on startup with retry logic for container environments.


### Non-Functional Requirements

1. Performance: Handle up to 1000 requests/min; latency < 500ms for redirects (monitored via histogram).
2. Scalability: Support horizontal scaling in K8s; use connection pooling in PostgreSQL.
3. Reliability: Retry DB connections (up to 5 attempts); handle errors gracefully (e.g., 500 for DB failures).
4. Security: Use CORS; validate URLs; secrets via env vars or files; no user input in SQL (use parameterized queries).
5. Usability: Intuitive frontend with loading states and error alerts.
6. Maintainability: Modular code; logging for errors.
7. Observability: Prometheus integration for metrics; compatible with Grafana for dashboards.
8. Deployment: Run in Docker containers; deployable to K8s with persistent volumes for DB.

----------
## Software Architecture

The system follows a client-server architecture with a monolithic backend (Express.js) separated from the frontend (React).

It uses a layered style: Presentation (React UI), Application (Express API), Data (PostgreSQL).

Interactions: 
1. Frontend communicates via HTTP/JSON to backend
2. backend queries DB
3. Prometheus scrapes metrics endpoint. No microservices, but scalable via container orchestration.

High-level components:

1. Frontend: React app served statically (from build folder).
2. Backend: Node.js/Express handling API routes, DB interactions, and metrics.
3. Database: PostgreSQL for persistent storage.
4. Monitoring: Prometheus for scraping and alerting.

------
## Database Design & Data Modeling
### ER Diagram
The database has a single entity: URL, with attributes short_code (PK), long_url, created_at. No relationships beyond self (e.g., no users or analytics).

![Screenshot_26-11-2025_161249_](https://github.com/user-attachments/assets/4530abed-f8eb-4750-a0e0-766e7d14114c)

### Logical & Physical Schema

Logical Schema: Entity URL with primary key short_code (unique identifier).

Attributes:
1. long_url (text, not null)
2. created_at (timestamp, default now())
3. Normalized to 3NF (no transitive dependencies; short_code uniquely identifies long_url).

Physical Schema:
1. Table 'urls' in PostgreSQL.
2. Columns: short_code VARCHAR(32), PRIMARY KEY, long_url TEXT NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT now().
3. Indexes: Implicit on PK; potential index on long_url for duplicate checks.
4. Constraints: Unique short_code; no foreign keys.
5. Normalization: Atomic attributes; no redundancy (duplicates checked via query).

----
## Data Flow & System Behavior
### DFD (Data Flow Diagram)
Context-Level DFD: External entities (User, Prometheus) interact with the URL Shortener process, which uses DB as data store.
![Screenshot_26-11-2025_161434_](https://github.com/user-attachments/assets/9452c7c9-fd8b-42b8-bfa6-1741151ce6bd)

----
## Sequence Diagrams 
### Shorten URL Sequence
![Screenshot_26-11-2025_161724_](https://github.com/user-attachments/assets/3cee0e27-8c8d-4260-ac4d-0fc461d6e214)

### Redirect Sequence 
![Screenshot_26-11-2025_161751_](https://github.com/user-attachments/assets/5e39ea31-1f5b-4843-a54c-9a04f46f93a9)

-----
## Activity Diagram 
![Screenshot_26-11-2025_163024_](https://github.com/user-attachments/assets/dfd4ef40-3618-49b6-943e-18f6ecf5db34)

----

## State Diagram 
![Screenshot_26-11-2025_163032_](https://github.com/user-attachments/assets/38667068-d509-4b38-97a3-03b38d844bd7)

---

## Class Diagram
![Screenshot_26-11-2025_163045_](https://github.com/user-attachments/assets/dad76fe4-bacb-42c2-879e-6cd07ff477a3)

----
## UI/UX Design & Prototyping

### WireFrames And Mockups 

The frontend is a single-page React app with:
1. Header: Icon (🔗), Title ("URL Shortener"), Subtitle.
2. Input Form: Label, URL input field, "Shorten URL" button.
3. Result Section: Displays short URL as link, "Copy" button (appears after shortening).
4. Footer: "Fast, simple, and secure URL shortening".

## UI/UX Guidelines

1. Design Principles: Minimalist, responsive (mobile-first), intuitive flow (input -> submit -> result).
2. Color Scheme: Primary blue (#007bff) for buttons/links; neutral grays/whites for background; green for success alerts.
3. Typography: Sans-serif fonts (e.g., Arial); headings bold, sizes: h1 2em, p 1em.
4. Accessibility: ARIA labels (e.g., htmlFor on label); keyboard navigation; high contrast; alt text for icons (though none in code).
5. User Experience: Loading spinner during API calls; error handling with alerts; copy-to-clipboard feedback.
--------
## System Deployment & Integration
### Technology Stack

1. Frontend: React.js, Axios for API calls.
2. Backend: Node.js, Express.js, pg (PostgreSQL client), nanoid, cors, prom-client (Prometheus).
3. Database: PostgreSQL.
4. Monitoring: Prometheus.
5. Visualization: Grafana
6. Deployment: Docker for containerization; Kubernetes (K8s) for orchestration; Docker Compose for local dev.

### Deployment Diagram 
![Screenshot_26-11-2025_163744_](https://github.com/user-attachments/assets/4488400d-a24c-4bab-a855-a412d4623109)

### Component Diagram 
![Screenshot_26-11-2025_163754_](https://github.com/user-attachments/assets/5d44377b-09fb-4af9-9fd9-3872a98bb717)

-----------------------
## Aditional Deliverables 
### API Documentation

Endpoints:
1. ```GET /api/health: ```   Returns { status: "ok" }. No auth. Response: 200 JSON.
2. ```POST /api/shorten:``` Body { longUrl: string }. Returns { shortUrl: string }. Errors: 400 (missing), 500 (DB error).
3. ```GET /s/:shortCode:```   Redirects to long URL (301) or 404.
4. ```GET /metrics:```   Prometheus text format (e.g., counters and histograms).

Usage: Use JSON content-type; BASE_URL configurable via env.

-------
# 5. Implemenation 
## Source code includes:
1. Express server
2. URL shortening logic
3. DB retry logic
4. React interface
5. Prometheus metrics
-------
# 6. Testing & Quality Assurance
## Test Cases

| Test Case | Input	| Expected Output|
|-----------|-------|--------------|
|Valid URL	|https://google.com|	Short URL|
|Invalid URL|	abc |	Error |
| Redirect |	/s/abc123	| Redirect to stored URL| 

Automated Testing
(To be added if required)

------

# 7. Final Presentation & Reports
## Deliverables

1. Fully functional URL shortener webservice with REST API endpoints.  
2. PostgreSQL database for URL mappings.  
3. Prometheus configuration to scrape metrics.  
4. Grafana dashboards visualizing performance and usage metrics.  
5. Docker images for the webservice.
6. Kubernets Files for orchestration of all services.  
7. Project documentation (README, diagrams, and usage instructions).
