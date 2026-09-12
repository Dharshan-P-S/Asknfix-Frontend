import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function RoomPage() {
  const { buildingId, floor } = useParams();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [building, setBuilding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const [buildingResponse, roomsResponse] = await Promise.all([
          api.get(`/buildings/${buildingId}`),
          api.get(
            `/rooms/building/${buildingId}/floor/${encodeURIComponent(floor)}`
          )
        ]);

        setBuilding(buildingResponse.data);
        setRooms(roomsResponse.data);
      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Unable to load rooms"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [buildingId, floor]);

  if (loading) {
    return (
      <div className="page">
        <div className="page-container">
          <div className="empty-state">
            <h2>Loading rooms...</h2>
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

          <button
            className="secondary-button"
            onClick={() =>
              navigate(`/student/building/${buildingId}`)
            }
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-container">

        <div className="page-header">
          <h1>{building?.name}</h1>
          <p>Floor: {floor}</p>
        </div>

        <div className="page-header">
          <h2>Rooms</h2>
        </div>

        {rooms.length === 0 ? (
          <div className="empty-state">
            <h2>No rooms found</h2>
          </div>
        ) : (
          <div className="building-grid">
            {rooms.map((room) => (
              <div
                key={room.roomId}
                className="building-card"
                onClick={() =>
                  navigate(
                    `/student/building/${buildingId}/floor/${encodeURIComponent(floor)}/room/${room.roomId}`
                  )
                }
              >
                <h2>Room {room.roomNumber}</h2>
                <p>
                  Select this room to view appliances
                </p>
              </div>
            ))}

            <div
              className="building-card"
              onClick={() =>
                navigate(
                  `/student/building/${buildingId}/floor/${encodeURIComponent(floor)}/common`
                )
              }
            >
              <h2>Common</h2>
              <p>
                Raise a query for common areas
              </p>
            </div>
          </div>
        )}

        <div style={{ marginTop: "30px" }}>
          <button
            className="secondary-button"
            onClick={() =>
              navigate(`/student/building/${buildingId}`)
            }
          >
            Back
          </button>
        </div>

      </div>
    </div>
  );
}

export default RoomPage;