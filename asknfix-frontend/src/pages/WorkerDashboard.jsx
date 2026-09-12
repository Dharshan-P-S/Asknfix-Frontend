import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function WorkerDashboard() {
    const navigate = useNavigate();

    const name = localStorage.getItem("name");

    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedQuery, setSelectedQuery] = useState(null);
    const [completionDescription, setCompletionDescription] = useState("");
    const [completing, setCompleting] = useState(false);

    useEffect(() => {
        fetchAssignedQueries();
    }, []);

    const fetchAssignedQueries = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/queries/staff");

            setQueries(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (err) {
            setError(
                err.response?.data?.message ||
                (typeof err.response?.data === "string"
                    ? err.response.data
                    : "Unable to load assigned queries")
            );
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
        localStorage.removeItem("name");
        localStorage.removeItem("email");

        navigate("/staff/login");
    };

    const openCompletionPopup = (query) => {
        setSelectedQuery(query);
        setCompletionDescription("");
        setError("");
    };

    const closeCompletionPopup = () => {
        if (completing) return;

        setSelectedQuery(null);
        setCompletionDescription("");
    };

    const completeQuery = async () => {
        if (!selectedQuery) return;

        if (!completionDescription.trim()) {
            setError("Please enter a completion description.");
            return;
        }

        try {
            setCompleting(true);
            setError("");

            if (selectedQuery.status === "ASSIGNED") {
                await api.put(
                    `/queries/${selectedQuery.queryId}/start`
                );
            }

            await api.put(
                `/queries/${selectedQuery.queryId}/complete`,
                null,
                {
                    params: {
                        completionDescription:
                            completionDescription.trim()
                    }
                }
            );

            setQueries((current) =>
                current.filter(
                    (query) =>
                        query.queryId !== selectedQuery.queryId
                )
            );

            setSelectedQuery(null);
            setCompletionDescription("");

        } catch (err) {
            setError(
                err.response?.data?.message ||
                (typeof err.response?.data === "string"
                    ? err.response.data
                    : "Unable to complete query")
            );
        } finally {
            setCompleting(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleString();
    };

    if (loading) {
        return (
            <div className="page">
                <div className="page-container">

                    <div className="loading-card">

                        <div className="loading-spinner"></div>

                        <h2>
                            Loading assigned queries...
                        </h2>

                        <p>
                            Please wait while we fetch your assigned requests.
                        </p>

                    </div>

                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-container">

                <div className="staff-dashboard-header">

                    <div>

                        <p className="dashboard-label">
                            WORKER PORTAL
                        </p>

                        <h1>
                            Welcome, {name || "Worker"}
                        </h1>

                        <p>
                            View and complete maintenance requests
                            assigned to you.
                        </p>

                    </div>

                    <button
                        className="secondary-button"
                        onClick={logout}
                    >
                        Logout
                    </button>

                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <div className="staff-page-navigation">

                    <button
                        className="primary-button"
                        onClick={() =>
                            navigate("/worker/dashboard")
                        }
                    >
                        Assigned Queries
                    </button>

                    <button
                        className="secondary-button"
                        onClick={() =>
                            navigate("/worker/completed")
                        }
                    >
                        Completed Queries
                    </button>

                </div>

                <div className="staff-stat-grid">

                    <div className="staff-stat-card">

                        <span>
                            Assigned Queries
                        </span>

                        <strong>
                            {queries.length}
                        </strong>

                    </div>

                </div>

                <div className="staff-section-header">

                    <div>

                        <h2>
                            Assigned Queries
                        </h2>

                        <p>
                            Maintenance requests currently assigned
                            to you.
                        </p>

                    </div>

                    <div className="staff-query-count">
                        {queries.length}{" "}
                        {queries.length === 1
                            ? "Query"
                            : "Queries"}
                    </div>

                </div>

                {queries.length === 0 ? (

                    <div className="empty-state">

                        <div className="empty-icon">
                            ✓
                        </div>

                        <h2>
                            No assigned queries
                        </h2>

                        <p>
                            You currently have no maintenance
                            requests assigned to you.
                        </p>

                    </div>

                ) : (

                    <div className="staff-query-list">

                        {queries.map((query) => (

                            <div
                                className="staff-query-card"
                                key={query.queryId}
                            >

                                <div className="staff-query-top">

                                    <div>

                                        <span className="query-number">
                                            QUERY #{query.queryId}
                                        </span>

                                        <h3>
                                            {query.building?.name ||
                                                "Building"}

                                            {query.room &&
                                                ` • Room ${query.room.roomNumber}`}
                                        </h3>

                                    </div>

                                    <span
                                        className={`status status-${query.status?.toLowerCase()}`}
                                    >
                                        {query.status}
                                    </span>

                                </div>

                                <div className="staff-query-description">

                                    <strong>
                                        Problem
                                    </strong>

                                    <p>
                                        {query.description}
                                    </p>

                                </div>

                                {/* APPLIANCES */}
                                {query.appliances?.length > 0 && (
                                    <div className="query-appliances">

                                        <strong>
                                            Appliances
                                        </strong>

                                        <div className="appliance-list">

                                            {query.appliances.map(
                                                (appliance, index) => (
                                                    <span
                                                        className="appliance-tag"
                                                        key={
                                                            appliance.applianceId ||
                                                            appliance.id ||
                                                            index
                                                        }
                                                    >
                                                        {typeof appliance === "string"
                                                            ? appliance
                                                            : appliance.name ||
                                                              appliance.applianceName ||
                                                              "Appliance"}
                                                    </span>
                                                )
                                            )}

                                        </div>

                                    </div>
                                )}

                                <div className="staff-query-meta">

                                    <span>

                                        <strong>
                                            Student
                                        </strong>

                                        {query.student?.name ||
                                            "Unknown"}

                                    </span>

                                    <span>

                                        <strong>
                                            Raised
                                        </strong>

                                        {formatDate(
                                            query.raisedAt
                                        )}

                                    </span>

                                    {query.assignedStaff && (
                                        <span>

                                            <strong>
                                                Assigned To
                                            </strong>

                                            {query.assignedStaff.name ||
                                                "You"}

                                        </span>
                                    )}

                                </div>

                                <div className="staff-query-actions">

                                    <button
                                        className="primary-button"
                                        onClick={() =>
                                            openCompletionPopup(query)
                                        }
                                    >
                                        Mark as Completed
                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>

            {selectedQuery && (

                <div className="modal-overlay">

                    <div className="confirmation-modal">

                        <div className="confirmation-icon">
                            ✓
                        </div>

                        <h2>
                            Mark Query as Completed?
                        </h2>

                        <p>
                            Query #{selectedQuery.queryId} will
                            be marked as completed.
                        </p>

                        <div className="form-group">

                            <label>
                                Completion Description
                            </label>

                            <textarea
                                className="form-input completion-textarea"
                                value={completionDescription}
                                onChange={(event) =>
                                    setCompletionDescription(
                                        event.target.value
                                    )
                                }
                                placeholder="Describe how the issue was resolved..."
                                rows="5"
                                disabled={completing}
                            />

                        </div>

                        <div className="confirmation-actions">

                            <button
                                className="secondary-button"
                                onClick={closeCompletionPopup}
                                disabled={completing}
                            >
                                Cancel
                            </button>

                            <button
                                className="primary-button"
                                onClick={completeQuery}
                                disabled={
                                    completing ||
                                    !completionDescription.trim()
                                }
                            >
                                {completing
                                    ? "Completing..."
                                    : "Confirm Completion"}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default WorkerDashboard;