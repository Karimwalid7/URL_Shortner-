# URL_Shortner
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
## Idea and Objectives
**Idea:**  
To create a lightweight, containerized URL shortener service with built-in monitoring for performance and usage metrics.

**Objectives:**  
1. Develop a webservice capable of shortening URLs and redirecting users.  
2. Persist URL mappings in a simple database (SQLite).  
3. Expose custom performance metrics from the webservice.  
4. Use Prometheus to scrape metrics and Grafana to visualize system health and usage patterns.  
5. Containerize the entire stack using Docker and orchestrate with Docker Compose.

---

## System Analysis and Design
**System Components:**  
- **Webservice:** Node.js with Express framework to handle URL shortening and redirects.  
- **Database:** SQLite to store URL mappings.  
- **Monitoring Tools:** Prometheus for metric collection, Grafana for dashboard visualization.  
- **Containerization:** Docker for each service and Docker Compose for orchestration.

**Design Approach:**  
- The webservice exposes RESTful APIs: one for shortening URLs and another for redirection.  
- Custom metrics (e.g., total requests, redirects, error rates) are exposed via an endpoint for Prometheus scraping.  
- Grafana dashboards provide real-time visualization of these metrics, showing system performance and usage patterns.  
- Docker ensures portability and isolation of services.

---

## Scope and Project Plan
**Scope:**  
- Functional URL shortening and redirection.  
- Local deployment of the entire stack using Docker.  
- Monitoring and visualization using Prometheus and Grafana.  
- Lightweight database integration (SQLite).

**Project Plan:**  
1. **Week 1:** Build URL Shortener app, DB, write Dockerfile & docker-compose.yml 
2. **Week 2:** Add Prometheus client metrics (URL count, redirects, 404s, latency), configure prometheus.yml.  
3. **Week 3:** Add Grafana to Docker Compose, connect to Prometheus, build dashboard (URL stats, latency, 404s)  
4. **Week 4:** Configure alerts in Grafana, add Docker volumes for persistence, finalize documentation  
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
2. SQLite database for URL mappings.  
3. Prometheus configuration to scrape metrics.  
4. Grafana dashboards visualizing performance and usage metrics.  
5. Docker images for the webservice, Prometheus, and Grafana.  
6. Docker Compose file for orchestration of all services.  
7. Project documentation (README, diagrams, and usage instructions).