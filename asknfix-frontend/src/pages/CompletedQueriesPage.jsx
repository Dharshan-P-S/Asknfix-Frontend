import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function MyQueriesPage() {
  const navigate = useNavigate();

  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedQueryId, setExpandedQueryId] = useState(null);

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const response = await api.get("/queries/student");

        setQueries(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Unable to load your queries"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQueries();
  }, []);

  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return "status status-pending";

      case "ASSIGNED":
        return "status status-assigned";

      case "IN_PROGRESS":
        return "status status-progress";

      case "COMPLETED":
        return "status status-completed";

      default:
        return "status";
    }
  };

  const formatStatus = (status) => {
    if (!status) return "";

    return status
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString();
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

            <h2>Loading your queries...</h2>

            <p>
              Please wait while we load your maintenance queries.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-container">

        <div className="page-header">
          <div>
            <h1>My Queries</h1>

            <p>
              View the maintenance queries you have raised.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={() => navigate("/student/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {queries.length === 0 ? (
          <div className="empty-state">
            <h2>No queries yet</h2>

            <p>
              You have not raised any maintenance queries.
            </p>

            <button
              className="primary-button empty-action-button"
              onClick={() => navigate("/student/dashboard")}
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="query-list">

            {queries.map((query) => {
              const appliances = getAppliances(query);
              const isExpanded =
                expandedQueryId === query.queryId;

              return (
                <div
                  className={`query-item query-clickable ${
                    isExpanded ? "query-expanded" : ""
                  }`}
                  key={query.queryId}
                  onClick={() => toggleQuery(query.queryId)}
                >

                  <div className="query-item-header">
                    <div>
                      <h3>
                        Query #{query.queryId}
                      </h3>

                      <p className="query-location">
                        {query.building?.name || "Unknown Building"}
                        {" • "}
                        {query.room
                          ? `Room ${query.room.roomNumber}`
                          : "Common Area"}
                      </p>
                    </div>

                    <span className={getStatusClass(query.status)}>
                      {formatStatus(query.status)}
                    </span>
                  </div>

                  <div className="query-description">
                    <p>{query.description}</p>
                  </div>

                  <div className="query-meta">
                    <div>
                      <span>Raised</span>

                      <strong>
                        {formatDate(query.raisedAt)}
                      </strong>
                    </div>

                    <div>
                      <span>Assigned Staff</span>

                      <strong>
                        {query.assignedStaff?.name ||
                          "Not assigned"}
                      </strong>
                    </div>

                    {query.completedAt && (
                      <div>
                        <span>Completed</span>

                        <strong>
                          {formatDate(query.completedAt)}
                        </strong>
                      </div>
                    )}
                  </div>

                  {/* APPLIANCES */}
                  {appliances.length > 0 && (
                    <div className="query-appliances">
                      <div className="query-appliances-header">
                        <strong>Appliances</strong>
                        <span>
                          {appliances.length}
                        </span>
                      </div>

                      <div className="appliance-list">
                        {appliances.map((appliance, index) => (
                          <span
                            className="appliance-tag"
                            key={
                              appliance?.applianceId ||
                              appliance?.id ||
                              index
                            }
                          >
                            {getApplianceName(appliance)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* EXPANDED DETAILS */}
                  {isExpanded && (
                    <div className="query-expanded-details">

                      <div className="query-expanded-row">
                        <span>Query ID</span>
                        <strong>#{query.queryId}</strong>
                      </div>

                      <div className="query-expanded-row">
                        <span>Status</span>
                        <strong>
                          {formatStatus(query.status)}
                        </strong>
                      </div>

                      <div className="query-expanded-row">
                        <span>Student</span>
                        <strong>
                          {query.student?.name ||
                            "You"}
                        </strong>
                      </div>

                      {query.completionDescription && (
                        <div className="completion-box">
                          <span>Completion Details</span>

                          <p>
                            {query.completionDescription}
                          </p>
                        </div>
                      )}

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

export default MyQueriesPage;