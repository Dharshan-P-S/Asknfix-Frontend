import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function AssignWorker() {
  const { queryId } = useParams();
  const navigate = useNavigate();

  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [query, setQuery] = useState(null);

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");

  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [staffResponse, queryResponse] = await Promise.all([
          api.get("/staff"),
          api.get(`/queries/${queryId}`)
        ]);

        const workerList = staffResponse.data.filter(
          (staff) => staff.role?.toUpperCase() === "WORKER"
        );

        setWorkers(workerList);
        setQuery(queryResponse.data);
      } catch (error) {
        setError(
          error.response?.data?.message ||
          error.response?.data ||
          error.message ||
          "Unable to load assignment details"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [queryId]);

  const handleAssignClick = () => {
    if (!selectedWorker) {
      setError("Please select a worker first.");
      return;
    }

    setError("");
    setShowConfirm(true);
  };

  const confirmAssignment = async () => {
    if (!selectedWorker) return;

    try {
      setAssigning(true);
      setError("");

      await api.put(
        `/queries/${queryId}/assign/${selectedWorker.staffId}`
      );

      setShowConfirm(false);

      navigate("/staff/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message ||
        error.response?.data ||
        "Unable to assign worker"
      );
      setShowConfirm(false);
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
            <h2>Loading workers...</h2>
            <p>Please wait.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-container">
        <div className="assign-page">

          <button
            className="back-button"
            onClick={() => navigate("/staff/dashboard")}
          >
            ← Back to Dashboard
          </button>

          <div className="assign-header">
            <div>
              <span className="dashboard-label">WORKER ASSIGNMENT</span>

              <h1>Assign Worker</h1>

              <p>
                Select a worker to handle this maintenance request.
              </p>
            </div>

            <div className="assign-query-number">
              QUERY #{queryId}
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span>!</span>
              {error}
            </div>
          )}

          {query && (
            <div className="assign-query-card">
              <div className="assign-query-heading">
                <div>
                  <span>REQUEST DETAILS</span>

                  <h2>
                    {query.building?.name || "Building"}
                    {query.room &&
                      ` • Room ${query.room.roomNumber}`}
                  </h2>
                </div>

                <span
                  className={`status status-${query.status?.toLowerCase()}`}
                >
                  {query.status}
                </span>
              </div>

              <div className="assign-query-description">
                <span>Problem</span>
                <p>{query.description}</p>
              </div>

              <div className="assign-query-meta">
                <div>
                  <span>Student</span>
                  <strong>
                    {query.student?.name || "Unknown"}
                  </strong>
                </div>

                <div>
                  <span>Raised</span>
                  <strong>
                    {query.raisedAt
                      ? new Date(query.raisedAt).toLocaleString()
                      : "-"}
                  </strong>
                </div>
              </div>
            </div>
          )}

          <div className="workers-section">
            <div className="workers-section-heading">
              <div>
                <h2>Available Workers</h2>
                <p>
                  Select one worker to assign this query.
                </p>
              </div>

              <span className="worker-count">
                {workers.length}{" "}
                {workers.length === 1 ? "Worker" : "Workers"}
              </span>
            </div>

            {workers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">!</div>
                <h2>No workers available</h2>
                <p>
                  There are currently no workers available for assignment.
                </p>
              </div>
            ) : (
              <div className="worker-grid">
                {workers.map((worker) => (
                  <div
                    key={worker.staffId}
                    className={`worker-card ${
                      selectedWorker?.staffId === worker.staffId
                        ? "worker-selected"
                        : ""
                    }`}
                    onClick={() => setSelectedWorker(worker)}
                  >
                    <div className="worker-avatar">
                      {worker.name?.charAt(0)?.toUpperCase() || "W"}
                    </div>

                    <div className="worker-info">
                      <h3>{worker.name}</h3>

                      <p>{worker.email}</p>

                      {worker.phoneNumber && (
                        <span>{worker.phoneNumber}</span>
                      )}
                    </div>

                    <div className="worker-radio">
                      {selectedWorker?.staffId === worker.staffId
                        ? "✓"
                        : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {workers.length > 0 && (
            <div className="assign-actions">
              <button
                className="secondary-button"
                onClick={() => navigate("/staff/dashboard")}
                disabled={assigning}
              >
                Cancel
              </button>

              <button
                className="primary-button"
                onClick={handleAssignClick}
                disabled={!selectedWorker || assigning}
              >
                Assign Worker
              </button>
            </div>
          )}
        </div>
      </div>

      {showConfirm && selectedWorker && (
        <div className="modal-overlay">
          <div className="confirmation-modal">

            <div className="confirmation-icon">
              ?
            </div>

            <h2>Confirm Assignment</h2>

            <p>
              Are you sure you want to assign
              <strong> {selectedWorker.name}</strong> to
              Query #{queryId}?
            </p>

            <div className="confirmation-actions">
              <button
                className="secondary-button"
                onClick={() => setShowConfirm(false)}
                disabled={assigning}
              >
                Cancel
              </button>

              <button
                className="primary-button"
                onClick={confirmAssignment}
                disabled={assigning}
              >
                {assigning ? "Assigning..." : "Yes, Assign"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default AssignWorker;