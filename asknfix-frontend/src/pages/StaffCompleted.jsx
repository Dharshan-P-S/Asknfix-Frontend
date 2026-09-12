import { useEffect, useState } from "react";

import api from "../services/api";

function StaffCompleted() {
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchCompletedQueries();
    }, []);

    const fetchCompletedQueries = async () => {
        try {
            const response = await api.get("/queries/completed");

            setQueries(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (err) {
            const responseData = err.response?.data;

            setError(
                responseData?.message ||
                (typeof responseData === "string"
                    ? responseData
                    : err.message) ||
                "Unable to load completed queries"
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

        window.location.href = "/staff/login";
    };

    if (loading) {
        return (
            <div className="page">
                <div className="page-container">

                    <div className="loading-card">

                        <div className="loading-spinner"></div>

                        <h2>
                            Loading completed queries...
                        </h2>

                        <p>
                            Please wait while we fetch
                            completed requests.
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
                            ADMIN PORTAL
                        </p>

                        <h1>
                            Completed Queries
                        </h1>

                        <p>
                            View all previously completed
                            maintenance requests.
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
                            window.location.href =
                                "/staff/dashboard"
                        }
                    >
                        Dashboard
                    </button>

                    <button
                        className="secondary-button"
                        onClick={() =>
                            window.location.href =
                                "/staff/assigned"
                        }
                    >
                        Assigned Queries
                    </button>

                    <button
                        className="primary-button"
                        onClick={() =>
                            window.location.href =
                                "/staff/completed"
                        }
                    >
                        Completed Queries
                    </button>

                </div>

                {error && (
                    <div className="error-message">
                        <span>!</span>

                        <div>
                            {error}
                        </div>
                    </div>
                )}

                <div className="staff-section-header">

                    <div>

                        <h2>
                            Completed Queries
                        </h2>

                        <p>
                            Maintenance requests that have
                            been successfully completed.
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
                            No Completed Queries
                        </h2>

                        <p>
                            There are no completed maintenance
                            requests yet.
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

                                    <span className="status status-completed">
                                        COMPLETED
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

                                        {query.raisedAt
                                            ? new Date(
                                                query.raisedAt
                                            ).toLocaleString()
                                            : "-"}
                                    </span>

                                    <span>
                                        <strong>
                                            Completed
                                        </strong>

                                        {query.completedAt
                                            ? new Date(
                                                query.completedAt
                                            ).toLocaleString()
                                            : "-"}
                                    </span>

                                </div>

                                {query.completionDescription && (
                                    <div className="completion-box">

                                        <span>
                                            Completion Details
                                        </span>

                                        <p>
                                            {query.completionDescription}
                                        </p>

                                    </div>
                                )}

                            </div>

                        ))}

                    </div>

                )}

            </div>
        </div>
    );
}

export default StaffCompleted;