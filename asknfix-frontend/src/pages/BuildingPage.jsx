import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function BuildingPage() {
  const { buildingId } = useParams();
  const navigate = useNavigate();

  const [building, setBuilding] = useState(null);
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBuilding = async () => {
      try {
        const buildingResponse = await api.get(
          `/buildings/${buildingId}`
        );

        const buildingData = buildingResponse.data;
        setBuilding(buildingData);

        if (!buildingData.isHostel) {
          const roomsResponse = await api.get(
            `/rooms/building/${buildingId}`
          );

          const uniqueFloors = [
            ...new Set(
              roomsResponse.data.map((room) => room.floor)
            )
          ];

          setFloors(uniqueFloors);
        }
      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Unable to load building"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBuilding();
  }, [buildingId]);

  if (loading) {
    return (
      <div className="page">
        <div className="page-container">
          <div className="empty-state">
            <h2>Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="page-container">
          <div className="error-message">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!building) {
    return null;
  }

  const isHostel = Boolean(building.isHostel);

  return (
    <div className="page">
      <div className="page-container">

        <div className="page-header">
          <h1>{building.name}</h1>
          <p>
            {isHostel
              ? "Select a query type"
              : "Select a floor"}
          </p>
        </div>

        {isHostel ? (
          <div className="building-grid">

            <div
              className="building-card"
              onClick={() =>
                navigate(
                  `/student/building/${buildingId}/rooms`
                )
              }
            >
              <h2>Your Room</h2>
              <p>Raise a query related to a hostel room</p>
            </div>

            <div
              className="building-card"
              onClick={() =>
                navigate(
                  `/student/building/${buildingId}/common`
                )
              }
            >
              <h2>Common</h2>
              <p>Raise a query related to common areas</p>
            </div>

          </div>
        ) : (
          <div className="building-grid">
            {floors.map((floor) => (
              <div
                key={floor}
                className="building-card"
                onClick={() =>
                  navigate(
                    `/student/building/${buildingId}/floor/${encodeURIComponent(floor)}`
                  )
                }
              >
                <h2>{floor}</h2>
                <p>View rooms on this floor</p>
              </div>
            ))}

            <div
              className="building-card"
              onClick={() =>
                navigate(
                  `/student/building/${buildingId}/common`
                )
              }
            >
              <h2>Common</h2>
              <p>Raise a query for common areas</p>
            </div>
          </div>
        )}

        <div style={{ marginTop: "30px" }}>
          <button
            className="secondary-button"
            onClick={() => navigate("/student/dashboard")}
          >
            Back
          </button>
        </div>

      </div>
    </div>
  );
}

export default BuildingPage;