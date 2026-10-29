# 🛡️ CyberShield AI
### AI-Based Cybersecurity Incident Analyzer

CyberShield AI is a web-based cybersecurity incident reporting and analysis system designed to record, classify, and manage security incidents through a simple dashboard.

## 📌 Project Overview

The system allows users to report cybersecurity incidents, automatically assign a risk level based on predefined keywords, and track incidents from one dashboard. It uses Flask for backend operations and SQLite to store incident records.

## ✨ Features

- **Security Dashboard:** View total, high-risk, and resolved incidents.
- **Incident Reporting:** Report incidents with a type, description, and source/device.
- **Risk Assessment:** Classify incidents as Critical, High, or Medium using keyword-based rules.
- **Risk Analytics:** View incident counts by risk level.
- **Incident History:** Search and filter reported incidents.
- **Incident Management:** Mark incidents as resolved or delete records.
- **Persistent Storage:** Store incident data in an SQLite database.
- **Responsive Interface:** Dark-themed dashboard built with HTML, CSS, and JavaScript.

## 🧰 Technologies Used

- **Frontend:** HTML5, CSS3, JavaScript
- **Backend:** Python, Flask
- **Database:** SQLite
- **Version Control:** Git and GitHub

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/vaishnavijoshi215/cybershield-ai.git
cd cybershield-ai
```

### 2. Install Flask

Make sure Python is installed, then run:

```bash
python -m pip install flask
```

### 3. Start the application

```bash
python app.py
```

### 4. Open the application

Open this address in your browser:

http://127.0.0.1:5000/

## 🚀 How to Use

1. Open the application in your browser.
2. Navigate to the dashboard.
3. Select an incident type.
4. Enter the incident description and source/device.
5. Click **Analyze Incident**.
6. Review the assigned risk level and dashboard analytics.
7. Resolve or delete incidents from the incident history.

## 🧠 Risk Assessment

The current version uses predefined keyword-based rules to assign risk levels.

- **Critical:** Keywords such as ransomware, malware, data breach, and unauthorized access.
- **High:** Keywords such as phishing, suspicious login, password attack, and brute force.
- **Medium:** Incidents that do not match the configured Critical or High keywords.

This is a rule-based demonstration and does not currently use a trained machine-learning model.

## 🔮 Future Enhancements

- Secure user authentication and role-based access.
- Machine-learning-based incident classification.
- Improved input validation and security controls.
- Advanced analytics and incident reports.
- Deployment to a cloud hosting platform.

## ⚠️ Disclaimer

CyberShield AI is an academic demonstration project. Its risk assessment is rule-based and should not be used as a replacement for professional cybersecurity monitoring or incident response systems.

## 👩‍💻 Author

**Vaishnavi Joshi**

GitHub: https://github.com/vaishnavijoshi215

---

*CyberShield AI © 2026 — Academic Project Demonstration*
