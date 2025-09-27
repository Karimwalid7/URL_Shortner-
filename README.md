# URL_Shortner
# Monitoring a Containerized URL Shortener Webservice

A DevOps project to build, containerize, and monitor a functional URL shortener webservice using Docker, Prometheus, and Grafana. The project is designed to demonstrate containerization, service monitoring, metrics visualization, and alerting.
---

## 👥 Team Members
- Karim Walid Sayed Zaki 
- Mariam Mahmoud Khairy 
- Yusuf Salah Nafea Hassan 
- Ahmed Mohamed Hassan Khodary 
- Adham Emad Elrefaie 

---
## 📌 Project Overview
The project involves creating a simple URL shortener application that maps long URLs into short codes and handles redirection requests. The service will be containerized using Docker and orchestrated with Docker Compose.  
To monitor and analyze the system, *Prometheus* will be used to scrape custom application metrics, while *Grafana* will visualize these metrics and provide alerts on system health and performance.
---

## 🎯 Project Objectives
- Build a functional URL shortener webservice with core features (shorten & redirect).  
- Containerize the application using Docker and manage with Docker Compose.  
- Instrument the service to expose custom metrics (URL count, latency, 404 errors).  
- Collect metrics using Prometheus and visualize them with Grafana dashboards.  
- Configure alerts for error thresholds and latency spikes.  
- Enable persistence to ensure data is not lost after container restarts.  
- Deliver complete documentation and a tested final project.  
---

## 📂 Project Scope
- *Application*: Develop a simple URL shortener using Flask (Python) or Express (Node.js).  
- *Database*: Use relational database to store mappings between short and long URLs.  
- *Containerization*: Create Dockerfile & docker-compose.yml to run the service.  
- *Monitoring*: Integrate Prometheus for metrics collection and Grafana for visualization.  
- *Alerting & Persistence*: Configure Grafana alerts and use Docker volumes to persist data.  
- *Documentation*: Provide project documentation including API usage and deployment steps.  

---

## 🗂 Project Plan (Timeline)

| Week | Tasks | Deliverables |
|------|-------|--------------|
| *Week 1* | Build URL Shortener app,  DB, write Dockerfile & docker-compose.yml | Functional service running locally in Docker |
| *Week 2* | Add Prometheus client metrics (URL count, redirects, 404s, latency), configure prometheus.yml | Metrics exposed at /metrics and visible in Prometheus |
| *Week 3* | Add Grafana to Docker Compose, connect to Prometheus, build dashboard (URL stats, latency, 404s) | Working Grafana dashboard with real-time metrics |
| *Week 4* | Configure alerts in Grafana, add Docker volumes for persistence, finalize documentation | Persistent and fully documented monitoring stack |

---

## 🚀 Deliverables
- Source code of the URL shortener service.  
- Dockerfile & docker-compose.yml.  
- Prometheus and Grafana configuration files.  
- Grafana dashboard JSON export.  
- Alerts configuration.  
- README.md (project documentation).
