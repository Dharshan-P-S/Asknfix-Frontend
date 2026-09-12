import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function StudentDashboard() {
  const navigate = useNavigate();

  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const studentId = localStorage.getItem("userId");
  const studentName = localStorage.getItem("name");

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const response = await api.get(
          `/buildings/student/${studentId}`
        );

        setBuildings(response.data);
      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Unable to load buildings"
        );
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchBuildings();
    } else {
      setError("Student information not found");
      setLoading(false);
    }
  }, [studentId]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="page">
      <div className="page-container">

        <div className="page-header">
          <h1>Welcome, {studentName}</h1>
          <p>Select a building to raise a maintenance query</p>
        </div>

        <div className="page-header">
          <h2>Available Buildings</h2>
        </div>

        {loading && (
          <div className="empty-state">
            <h2>Loading buildings...</h2>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {!loading && !error && buildings.length === 0 && (
          <div className="empty-state">
            <h2>No buildings available</h2>
            <p>
              There are no buildings available for your account.
            </p>
          </div>
        )}

        {!loading && !error && buildings.length > 0 && (
          <div className="building-grid">
            {buildings.map((building) => (
              <div
                key={building.buildingId}
                className="building-card"
                onClick={() =>
                  navigate(
                    `/student/building/${building.buildingId}`
                  )
                }
              >
                <h2>{building.name}</h2>
                <p>{building.description}</p>
              </div>
            ))}
          </div>
        )}

        <div
          className="dashboard-grid"
          style={{ marginTop: "30px" }}
        >
          <div className="dashboard-card">
            <h2>My Queries</h2>
            <p>
              View all the maintenance queries you have raised.
            </p>

            <button
              className="primary-button"
              onClick={() => navigate("/student/my-queries")}
            >
              My Queries
            </button>
          </div>

          <div className="dashboard-card">
            <h2>Completed Queries</h2>
            <p>
              View your completed maintenance queries.
            </p>

            <button
              className="primary-button"
              onClick={() => navigate("/student/completed-queries")}
            >
              Completed Queries
            </button>
          </div>
        </div>

        <div style={{ marginTop: "30px" }}>
          <button
            className="danger-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

      </div>
    </div>
  );
}

export default StudentDashboard;