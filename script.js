
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("incidentForm");
    const message = document.getElementById("message");
    const tableBody = document.getElementById("incidentTableBody");
    const searchInput = document.getElementById("searchIncident");
    const riskFilter = document.getElementById("riskFilter");
    const statusFilter = document.getElementById("statusFilter");

    let incidents = [];
    let loading = false;

    // Connect to Flask backend
    const API_URL = "/api/incidents";

    function showMessage(text, isError = false) {
        message.textContent = text;
        message.style.color = isError ? "#f87171" : "#86efac";
    }

    // Convert database records into frontend format
    function formatIncident(record) {
        let date = record.created_at || "";

        if (date) {
            const parsedDate = new Date(date);

            if (!Number.isNaN(parsedDate.getTime())) {
                date = parsedDate.toLocaleString();
            }
        }

        return {
            id: record.id,
            type: record.incident_type,
            description: record.description,
            source: record.source,
            risk: record.risk_level,
            status: record.status,
            date: date
        };
    }

    // Load incidents from SQLite through Flask
    async function loadIncidents() {
        loading = true;

        try {
            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error("Could not load incidents.");
            }

            const data = await response.json();
            incidents = data.map(formatIncident);

            refreshDashboard();
            renderIncidents();
        } catch (error) {
            console.error(error);
            showMessage(
                "Unable to load incidents. Check that the Flask server is running.",
                true
            );
        } finally {
            loading = false;
        }
    }

    // Update dashboard counters
    function updateDashboard() {
        document.getElementById("totalIncidents").textContent =
            incidents.length;

        document.getElementById("highRisk").textContent =
            incidents.filter(function (item) {
                return item.risk === "High" ||
                       item.risk === "Critical";
            }).length;

        document.getElementById("resolved").textContent =
            incidents.filter(function (item) {
                return item.status === "Resolved";
            }).length;
    }

    // Update risk analytics
    function updateChart() {
        const critical = incidents.filter(
            item => item.risk === "Critical"
        ).length;

        const high = incidents.filter(
            item => item.risk === "High"
        ).length;

        const medium = incidents.filter(
            item => item.risk === "Medium"
        ).length;

        const maxCount = Math.max(critical, high, medium, 1);

        document.getElementById("criticalCount").textContent = critical;
        document.getElementById("highCount").textContent = high;
        document.getElementById("mediumCount").textContent = medium;

        document.getElementById("criticalBar").style.width =
            (critical / maxCount * 100) + "%";

        document.getElementById("highBar").style.width =
            (high / maxCount * 100) + "%";

        document.getElementById("mediumBar").style.width =
            (medium / maxCount * 100) + "%";

        document.getElementById("chartMessage").textContent =
            incidents.length === 0
                ? "No incident data available yet. Submit an incident to view analytics."
                : "Chart based on " + incidents.length +
                  " reported incident(s).";
    }

    function refreshDashboard() {
        updateDashboard();
        updateChart();
    }

    // Render incidents and apply search and filters
    function renderIncidents() {
        tableBody.replaceChildren();

        const searchText = searchInput.value.trim().toLowerCase();
        const selectedRisk = riskFilter.value;
        const selectedStatus = statusFilter.value;

        const filteredIncidents = incidents.filter(function (item) {
            const searchableText = [
                item.type,
                item.description,
                item.source
            ].join(" ").toLowerCase();

            return searchableText.includes(searchText) &&
                (selectedRisk === "All" ||
                 item.risk === selectedRisk) &&
                (selectedStatus === "All" ||
                 item.status === selectedStatus);
        });

        if (filteredIncidents.length === 0) {
            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 7;
            cell.textContent = incidents.length === 0
                ? (loading ? "Loading incidents..." : "No incidents to display.")
                : "No matching incidents found.";

            row.appendChild(cell);
            tableBody.appendChild(row);
            return;
        }

        filteredIncidents.forEach(function (item) {
            const row = document.createElement("tr");

            [
                item.type,
                item.description,
                item.source || "Not specified",
                item.risk,
                item.status,
                item.date
            ].forEach(function (value) {
                const cell = document.createElement("td");
                cell.textContent = value || "-";
                row.appendChild(cell);
            });

            const actionCell = document.createElement("td");

            if (item.status === "Resolved") {
                const label = document.createElement("span");
                label.textContent = "Resolved";
                label.style.color = "#86efac";
                label.style.marginRight = "8px";
                actionCell.appendChild(label);
            } else {
                const resolveButton = document.createElement("button");
                resolveButton.textContent = "Resolve";
                resolveButton.style.margin = "0 5px 5px 0";
                resolveButton.style.padding = "8px 12px";

                resolveButton.addEventListener("click", async function () {
                    resolveButton.disabled = true;

                    try {
                        const response = await fetch(
                            API_URL + "/" + item.id + "/resolve",
                            { method: "PATCH" }
                        );

                        const result = await response.json();

                        if (!response.ok) {
                            throw new Error(
                                result.error || "Could not resolve incident."
                            );
                        }

                        await loadIncidents();
                        showMessage("Incident marked as Resolved.");
                    } catch (error) {
                        console.error(error);
                        showMessage(error.message, true);
                    } finally {
                        resolveButton.disabled = false;
                    }
                });

                actionCell.appendChild(resolveButton);
            }

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.style.padding = "8px 12px";
            deleteButton.style.backgroundColor = "#dc2626";

            deleteButton.addEventListener("click", async function () {
                const confirmed = window.confirm(
                    "Are you sure you want to delete this incident?"
                );

                if (!confirmed) return;

                deleteButton.disabled = true;

                try {
                    const response = await fetch(
                        API_URL + "/" + item.id,
                        { method: "DELETE" }
                    );

                    const result = await response.json();

                    if (!response.ok) {
                        throw new Error(
                            result.error || "Could not delete incident."
                        );
                    }

                    await loadIncidents();
                    showMessage("Incident deleted successfully.");
                } catch (error) {
                    console.error(error);
                    showMessage(error.message, true);
                } finally {
                    deleteButton.disabled = false;
                }
            });

            actionCell.appendChild(deleteButton);
            row.appendChild(actionCell);
            tableBody.appendChild(row);
        });
    }

    // Submit a new incident to the Flask API
    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (loading) return;

        const type = document.getElementById("incidentType").value;
        const description =
            document.getElementById("description").value.trim();

        const source =
            document.getElementById("source").value.trim() ||
            "Not specified";

        if (!type || !description) {
            showMessage("Please fill in all required fields.", true);
            return;
        }

        const submitButton = form.querySelector(
            'button[type="submit"], input[type="submit"]'
        );

        if (submitButton) submitButton.disabled = true;

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    incident_type: type,
                    description: description,
                    source: source
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error || "Unable to submit incident."
                );
            }

            form.reset();

            await loadIncidents();

            showMessage(
                "Incident saved to database! Risk Level: " +
                result.risk_level
            );
        } catch (error) {
            console.error(error);
            showMessage(error.message, true);
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    });

    searchInput.addEventListener("input", renderIncidents);
    riskFilter.addEventListener("change", renderIncidents);
    statusFilter.addEventListener("change", renderIncidents);

    // Load database records when dashboard opens
    loadIncidents();
});
