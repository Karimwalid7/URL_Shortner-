
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
1. Core: shorten URLs, redirect to original, track basic analytics.
2. Security: prevent malicious URLs, rate-limit abuse.
3. Performance: <100ms redirect latency under normal load.
4. Extensibility: API-first design for integration.
5. UX: simple web UI & optional user authentication for link management.

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

## 1.3 Task Assignment & Roles (example small team)

1. Project Manager / Team Lead — coordinate schedule, deliverables, presentation.
2. Backend Engineer — API, database, authentication, analytics ingestion.
3. Frontend Engineer / UX — web UI, wireframes, accessibility.
4. DevOps / QA — CI/CD, hosting, tests, performance tuning.
5. Documentation / Tester — user manual, test cases, video demo.
-----
## 1.4 Risk Assessment & Mitigation
| Risk | Impact |	Likelihood | Mitigation |
|------|--------|------------|------------|
| Abuse (spam) | High | Medium	| Rate-limiting |
| Malicious target URLs |	High | Medium |	Virus/malware/URL reputation checks (external API) or block-listing | 
| Data loss	| High | Low |	Backups, Persistent Database
| Performance under high load |	Medium | Low |	Caching, CDN for redirects, horizontal scaling |
---------
## 1.5 KPIs

1. Redirect latency: median < 100ms.
2. Error rate (4xx/5xx) during redirects: <0.5%.
3. User adoption: number of links created (semester target).
4. Daily active links / requests — baseline & growth.
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

## Final Grading Criteria (example)

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
3. User authentication & link management (create/read/delete).
4. Public REST API with API key / token auth.

## 3.4 Non-functional Requirements

1. Performance: redirect latency targets .
2. Security: input validation, Alerting .
3. Reliability: Perrsistent Volumes, backups.
4. Usability: accessible UI, simple flow, mobile responsive.
------

## Scope and Project Plan
**Scope:**  
- Functional URL shortening and redirection.  
- Local deployment of the entire stack using Docker.  
- Monitoring and visualization using Prometheus and Grafana.  
- Lightweight database integration (SQLite).

**Project Plan:**  
1. **Week 1:** Build URL Shortener app, DB, write Dockerfile & docker-compose.yml 
2. **Week 2:** Add Kubenetes, Add client metrics (URL count, redirects, 404s, latency), configure prometheus.yml.  
3. **Week 3:** Add Grafana, connect to Prometheus, build dashboard (URL stats, latency, 404s)  
4. **Week 4:** Configure alerts in Grafana, finalize documentation  
---

## Algorithm, Methods, and Techniques
**URL Shortening Algorithm:**  
1. Accept long URL via POST request.  
2. Generate a unique short code (e.g., hash-based or random string).  
3. Store mapping in SQLite database.  
4. On GET request with the short code, retrieve original URL and redirect.

**Monitoring Techniques:**  
- Instrumentation of service endpoints to collect metrics.  
- Use Prometheus exporters to scrape metrics.  
- Create Grafana dashboards for visualization.

**Development Methods:**  
- Agile approach with iterative development and testing.  
- Modular design for easy scaling and maintenance.

---

## Deliverables
1. Fully functional URL shortener webservice with REST API endpoints.  
2. PostgreSQL database for URL mappings.  
3. Prometheus configuration to scrape metrics.  
4. Grafana dashboards visualizing performance and usage metrics.  
5. Docker images for the webservice.
6. Kubernets Files for orchestration of all services.  
7. Project documentation (README, diagrams, and usage instructions).
