import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function StaffAssigned() {
    const navigate = useNavigate();

    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedQueryId, setExpandedQueryId] = useState(null);

    useEffect(() => {
        fetchAssignedQueries();
    }, []);

    const fetchAssignedQueries = async () => {
        try {
            const response = await api.get("/queries/assigned");

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
                    : "") ||
                err.message ||
                "Unable to load assigned queries"
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

    const getAppliances = (query) => {
        if (Array.isArray(query.appliances)) {
            return query.appliances;
        }

        if (query.appliance) {
            return [query.appliance];
        }

        return [];
    };

    const getApplianceName = (appliance) => {
        if (typeof appliance === "string") {
            return appliance;
        }

        return (
            appliance?.name ||
            appliance?.applianceName ||
            appliance?.type ||
            appliance?.applianceType ||
            "Appliance"
        );
    };

    const toggleQuery = (queryId) => {
        setExpandedQueryId((current) =>
            current === queryId ? null : queryId
        );
    };

    if (loading) {
        return (
            <div className="page">
                <div className="page-container">
                    <div className="loading-card">
                        <div className="loading-spinner"></div>

                        <h2>Loading assigned queries...</h2>

                        <p>
                            Please wait while we fetch assigned maintenance
                            requests.
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
                            STAFF PORTAL
                        </p>

                        <h1>
                            Assigned Queries
                        </h1>

                        <p>
                            View maintenance requests that have been assigned
                            to staff members.
                        </p>
                    </div>

                    <button
                        className="secondary-button"
                        onClick={logout}
                    >
                        Logout
                    </button>
                </div>

                <div className="staff-page-navigation">

                    <button
                        className="secondary-button"
                        onClick={() =>
                            navigate("/staff/dashboard")
                        }
                    >
                        Dashboard
                    </button>

                    <button
                        className="primary-button"
                        onClick={() =>
                            navigate("/staff/assigned")
                        }
                    >
                        Assigned Queries
                    </button>

                    <button
                        className="secondary-button"
                        onClick={() =>
                            navigate("/staff/completed")
                        }
                    >
                        Completed Queries
                    </button>

                </div>

                {error && (
                    <div className="error-message">
                        <span>!</span>
                        <div>{error}</div>
                    </div>
                )}

                <div className="staff-section-header">

                    <div>
                        <h2>Assigned Queries</h2>

                        <p>
                            Maintenance requests currently assigned to
                            workers.
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
                            There are currently no maintenance requests
                            assigned to workers.
                        </p>

                    </div>
                ) : (

                    <div className="staff-query-list">

                        {queries.map((query) => {
                            const appliances = getAppliances(query);
                            const isExpanded =
                                expandedQueryId === query.queryId;

                            return (
                                <div
                                    className={`staff-query-card staff-query-clickable ${
                                        isExpanded
                                            ? "query-expanded"
                                            : ""
                                    }`}
                                    key={query.queryId}
                                    onClick={() =>
                                        toggleQuery(query.queryId)
                                    }
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

                                            {query.raisedAt
                                                ? new Date(
                                                    query.raisedAt
                                                ).toLocaleString()
                                                : "-"}
                                        </span>

                                        <span>
                                            <strong>
                                                Status
                                            </strong>

                                            {query.status ||
                                                "ASSIGNED"}
                                        </span>

                                    </div>

                                    {/* APPLIANCES */}
                                    {appliances.length > 0 && (
                                        <div className="query-appliances">

                                            <div className="query-appliances-header">
                                                <strong>
                                                    Appliances
                                                </strong>

                                                <span>
                                                    {appliances.length}
                                                </span>
                                            </div>

                                            <div className="appliance-list">
                                                {appliances.map(
                                                    (appliance, index) => (
                                                        <span
                                                            className="appliance-tag"
                                                            key={
                                                                appliance?.applianceId ||
                                                                appliance?.id ||
                                                                index
                                                            }
                                                        >
                                                            {getApplianceName(
                                                                appliance
                                                            )}
                                                        </span>
                                                    )
                                                )}
                                            </div>

                                        </div>
                                    )}

                                    <div className="assigned-worker-box">

                                        <div className="assigned-worker-icon">
                                            👤
                                        </div>

                                        <div className="assigned-worker-info">

                                            <span className="assigned-worker-label">
                                                Assigned Worker:
                                            </span>{" "}

                                            <strong>
                                                {query.assignedStaff?.name ||
                                                    query.staff?.name ||
                                                    query.assignedWorker?.name ||
                                                    "Worker assigned"}
                                            </strong>

                                        </div>

                                    </div>

                                    {isExpanded && (
                                        <div className="query-expanded-details">

                                            <div className="query-expanded-row">
                                                <span>
                                                    Query ID
                                                </span>

                                                <strong>
                                                    #{query.queryId}
                                                </strong>
                                            </div>

                                            <div className="query-expanded-row">
                                                <span>
                                                    Student
                                                </span>

                                                <strong>
                                                    {query.student?.name ||
                                                        "Unknown"}
                                                </strong>
                                            </div>

                                        </div>
                                    )}

                                    <div className="query-expand-hint">
                                        {isExpanded
                                            ? "Click to collapse ↑"
                                            : "Click to view details ↓"}
                                    </div>

                                </div>
                            );
                        })}

                    </div>
                )}

            </div>
        </div>
    );
}

export default StaffAssigned;