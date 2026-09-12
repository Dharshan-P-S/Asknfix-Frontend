import { useEffect, useState } from "react";
import api from "../services/api";

function StaffDashboard() {
    const name = localStorage.getItem("name");

    const [queries, setQueries] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [selectedWorkers, setSelectedWorkers] = useState({});

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [confirmData, setConfirmData] = useState(null);
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError("");

            const [queryResponse, staffResponse] = await Promise.all([
                api.get("/queries/pending"),
                api.get("/staff")
            ]);

            setQueries(queryResponse.data);

            const availableWorkers = staffResponse.data.filter(
                (staff) =>
                    staff.role?.toUpperCase() === "WORKER"
            );

            setWorkers(availableWorkers);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                (typeof err.response?.data === "string"
                    ? err.response.data
                    : err.message) ||
                "Unable to load dashboard"
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

    const handleWorkerChange = (queryId, staffId) => {
        setSelectedWorkers((current) => ({
            ...current,
            [queryId]: staffId
        }));

        setError("");
    };

    const openAssignConfirmation = (query) => {
        const staffId = selectedWorkers[query.queryId];

        if (!staffId) {
            setError("Please select a worker first.");
            return;
        }

        const worker = workers.find(
            (staff) =>
                String(staff.staffId) === String(staffId)
        );

        if (!worker) {
            setError("Selected worker could not be found.");
            return;
        }

        setConfirmData({
            query,
            worker
        });

        setError("");
    };

    const confirmAssignment = async () => {
        if (!confirmData) {
            return;
        }

        try {
            setAssigning(true);

            await api.put(
                `/queries/${confirmData.query.queryId}/assign/${confirmData.worker.staffId}`
            );

            setQueries((current) =>
                current.filter(
                    (query) =>
                        query.queryId !==
                        confirmData.query.queryId
                )
            );

            setSelectedWorkers((current) => {
                const updated = { ...current };

                delete updated[
                    confirmData.query.queryId
                ];

                return updated;
            });

            setConfirmData(null);
            setError("");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                (typeof err.response?.data === "string"
                    ? err.response.data
                    : "Unable to assign worker")
            );
        } finally {
            setAssigning(false);
        }
    };

    if (loading) {
        return (
            <div className="page">
                <div className="page-container">
                    <div className="loading-card">
                        <div className="loading-spinner"></div>

                        <h2>Loading dashboard...</h2>

                        <p>
                            Please wait while we load the queries.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-container">

                {/* HEADER */}
                <div className="staff-dashboard-header">
                    <div>
                        <p className="dashboard-label">
                            ADMIN PORTAL
                        </p>

                        <h1>
                            Welcome, {name}
                        </h1>

                        <p>
                            Manage student maintenance requests
                            and assign them to workers.
                        </p>
                    </div>

                    <button
                        className="secondary-button"
                        onClick={logout}
                    >
                        Logout
                    </button>
                </div>

                {/* ERROR */}
                {error && (
                    <div className="error-message">
                        <span>!</span>
                        {error}
                    </div>
                )}

                {/* NAVIGATION */}
                <div className="staff-stat-grid">

                    <div
                        className="staff-stat-card clickable"
                        onClick={() =>
                            window.location.href =
                                "/staff/assigned"
                        }
                    >
                        <span>
                            Assigned Queries
                        </span>

                        <strong>
                            View
                        </strong>
                    </div>

                    <div
                        className="staff-stat-card clickable"
                        onClick={() =>
                            window.location.href =
                                "/staff/completed"
                        }
                    >
                        <span>
                            Completed Queries
                        </span>

                        <strong>
                            View
                        </strong>
                    </div>

                </div>

                {/* PENDING SECTION */}
                <div className="staff-section-header">
                    <div>
                        <h2>
                            Pending Queries
                        </h2>

                        <p>
                            Review student requests and
                            assign them to available workers.
                        </p>
                    </div>

                    <div className="staff-query-count">
                        {queries.length}{" "}
                        {queries.length === 1
                            ? "Query"
                            : "Queries"}
                    </div>
                </div>

                {/* EMPTY STATE */}
                {queries.length === 0 ? (
                    <div className="empty-state">

                        <div className="empty-icon">
                            ✓
                        </div>

                        <h2>
                            No Pending Queries
                        </h2>

                        <p>
                            There are no pending student
                            maintenance requests.
                        </p>

                    </div>
                ) : (

                    /* QUERY LIST */
                    <div className="query-list">

                        {queries.map((query) => (
                            <div
                                className="staff-query-card"
                                key={query.queryId}
                            >

                                {/* QUERY HEADER */}
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

                                    <span className="status status-pending">
                                        PENDING
                                    </span>

                                </div>

                                {/* DESCRIPTION */}
                                <div className="staff-query-description">

                                    <strong>
                                        Problem
                                    </strong>

                                    <p>
                                        {query.description}
                                    </p>

                                </div>

                                {/* META */}
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

                                </div>

                                {/* ASSIGNMENT */}
                                <div className="staff-assignment">

                                    <div className="staff-assignment-select">

                                        <label>
                                            Assign Worker
                                        </label>

                                        <select
                                            className="form-select"
                                            value={
                                                selectedWorkers[
                                                    query.queryId
                                                ] || ""
                                            }
                                            onChange={(event) =>
                                                handleWorkerChange(
                                                    query.queryId,
                                                    event.target.value
                                                )
                                            }
                                        >

                                            <option value="">
                                                Select a worker
                                            </option>

                                            {workers.map(
                                                (worker) => (
                                                    <option
                                                        key={
                                                            worker.staffId
                                                        }
                                                        value={
                                                            worker.staffId
                                                        }
                                                    >
                                                        {worker.name}
                                                    </option>
                                                )
                                            )}

                                        </select>

                                    </div>

                                    <button
                                        className="primary-button assign-button"
                                        onClick={() =>
                                            openAssignConfirmation(
                                                query
                                            )
                                        }
                                    >
                                        Assign Worker
                                    </button>

                                </div>

                            </div>
                        ))}

                    </div>
                )}

            </div>

            {/* CONFIRMATION MODAL */}
            {confirmData && (
                <div className="modal-overlay">

                    <div className="confirmation-modal">

                        <div className="confirmation-icon">
                            ?
                        </div>

                        <h2>
                            Assign Worker?
                        </h2>

                        <p>
                            Are you sure you want to assign{" "}
                            <strong>
                                {confirmData.worker?.name}
                            </strong>{" "}
                            to Query #
                            {confirmData.query.queryId}?
                        </p>

                        <div className="confirmation-actions">

                            <button
                                className="secondary-button"
                                onClick={() =>
                                    setConfirmData(null)
                                }
                                disabled={assigning}
                            >
                                Cancel
                            </button>

                            <button
                                className="primary-button"
                                onClick={confirmAssignment}
                                disabled={assigning}
                            >
                                {assigning
                                    ? "Assigning..."
                                    : "Yes, Assign"}
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

export default StaffDashboard;