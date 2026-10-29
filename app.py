
from flask import Flask, jsonify, request, send_from_directory
import sqlite3
from pathlib import Path
from datetime import datetime

app = Flask(__name__)
BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "incidents.db"


# Create database and table
def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS incidents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                incident_type TEXT NOT NULL,
                description TEXT NOT NULL,
                source TEXT NOT NULL,
                risk_level TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'Open',
                created_at TEXT NOT NULL
            )
        """)


# Basic rule-based risk assessment
def assess_risk(incident_type, description):
    kind = incident_type.lower()
    details = description.lower()
    text = kind + " " + details

    if any(word in text for word in [
        "ransomware", "malware", "data breach",
        "unauthorized access", "data theft"
    ]):
        return "Critical"

    if any(word in text for word in [
        "phishing", "suspicious login", "password attack",
        "brute force", "credential theft"
    ]):
        return "High"

    return "Medium"


# Serve the existing frontend
@app.route("/")
def home():
    return send_from_directory(str(BASE_DIR), "login.html")


@app.route("/<path:filename>")
def frontend_files(filename):
    allowed_files = {
        "login.html", "index.html", "style.css", "script.js"
    }

    if filename not in allowed_files:
        return jsonify({"error": "File not found"}), 404

    return send_from_directory(str(BASE_DIR), filename)


# Get all incidents
@app.route("/api/incidents", methods=["GET"])
def get_incidents():
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            "SELECT * FROM incidents ORDER BY id DESC"
        ).fetchall()

    return jsonify([dict(row) for row in rows])


# Add an incident
@app.route("/api/incidents", methods=["POST"])
def add_incident():
    data = request.get_json(silent=True) or {}

    incident_type = str(data.get("incident_type", "")).strip()
    description = str(data.get("description", "")).strip()
    source = str(data.get("source", "")).strip()

    if not incident_type or not description or not source:
        return jsonify({
            "error": "Incident type, description and source are required"
        }), 400

    risk_level = assess_risk(incident_type, description)
    created_at = datetime.now().astimezone().isoformat(
        timespec="seconds"
    )

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.execute("""
            INSERT INTO incidents
            (incident_type, description, source, risk_level,
             status, created_at)
            VALUES (?, ?, ?, ?, 'Open', ?)
        """, (
            incident_type, description, source,
            risk_level, created_at
        ))
        incident_id = cursor.lastrowid

    return jsonify({
        "message": "Incident recorded successfully",
        "id": incident_id,
        "risk_level": risk_level
    }), 201


# Resolve an incident
@app.route("/api/incidents/<int:incident_id>/resolve", methods=["PATCH"])
def resolve_incident(incident_id):
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.execute(
            "UPDATE incidents SET status = 'Resolved' WHERE id = ?",
            (incident_id,)
        )

    if cursor.rowcount == 0:
        return jsonify({"error": "Incident not found"}), 404

    return jsonify({"message": "Incident resolved"})


# Delete an incident
@app.route("/api/incidents/<int:incident_id>", methods=["DELETE"])
def delete_incident(incident_id):
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.execute(
            "DELETE FROM incidents WHERE id = ?",
            (incident_id,)
        )

    if cursor.rowcount == 0:
        return jsonify({"error": "Incident not found"}), 404

    return jsonify({"message": "Incident deleted"})


if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)
