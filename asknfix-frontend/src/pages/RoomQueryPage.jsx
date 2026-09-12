import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function RoomQueryPage() {
  const { buildingId, floor, roomId } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [appliances, setAppliances] = useState([]);
  const [queriedQuantities, setQueriedQuantities] = useState({});
  const [quantities, setQuantities] = useState({});
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomResponse, applianceResponse, queryApplianceResponse] =
          await Promise.all([
            api.get(`/rooms/${roomId}`),
            api.get(`/room-appliances/room/${roomId}`),
            api.get(`/queries/room/${roomId}/active`)
          ]);

        setRoom(roomResponse.data);
        setAppliances(applianceResponse.data);

        const currentlyQueried = {};

        queryApplianceResponse.data.forEach((item) => {
          const status = item.query?.status?.toUpperCase();

          if (status === "COMPLETED") {
            return;
          }

          const applianceId = item.appliance.applianceId;

          currentlyQueried[applianceId] =
            (currentlyQueried[applianceId] || 0) +
            item.quantity;
        });

        setQueriedQuantities(currentlyQueried);

        const initialQuantities = {};

        applianceResponse.data.forEach((item) => {
          initialQuantities[item.appliance.applianceId] = 0;
        });

        setQuantities(initialQuantities);

      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Unable to load room details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [roomId]);

 
  const getRemainingQuantity = (item) => {
    const applianceId = item.appliance.applianceId;

    const alreadyQueried =
      queriedQuantities[applianceId] || 0;

    return Math.max(
      item.quantity - alreadyQueried,
      0
    );
  };

  const increaseQuantity = (applianceId, maximum) => {
    setQuantities((current) => ({
      ...current,
      [applianceId]: Math.min(
        (current[applianceId] || 0) + 1,
        maximum
      )
    }));
  };

  const decreaseQuantity = (applianceId) => {
    setQuantities((current) => ({
      ...current,
      [applianceId]: Math.max(
        (current[applianceId] || 0) - 1,
        0
      )
    }));
  };

  const submitQuery = async () => {
    if (!description.trim()) {
      setError("Please enter a description");
      return;
    }

    const selectedAppliances = appliances
      .filter((item) => {
        const applianceId = item.appliance.applianceId;

        return (
          (quantities[applianceId] || 0) > 0
        );
      })
      .map((item) => ({
        applianceId: item.appliance.applianceId,
        quantity:
          quantities[item.appliance.applianceId]
      }));

    if (selectedAppliances.length === 0) {
      setError("Please select at least one appliance");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to raise this query?"
    );

    if (!confirmed) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await api.post("/queries", {
        buildingId: Number(buildingId),
        roomId: Number(roomId),
        description: description.trim(),
        appliances: selectedAppliances
      });

      navigate("/student/dashboard");

    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to raise query"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="page-container">

          <div className="empty-state">

            <h2>
              Loading room...
            </h2>

            <p>
              Please wait while we load the room details.
            </p>

          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="page">

      <div className="page-container">

        {/* PAGE HEADER */}

        <div className="page-header">

          <h1>
            Room {room?.roomNumber}
          </h1>

          <p>
            Select the appliances that require attention
            and specify the quantity.
          </p>

        </div>



        {error && (
          <div className="error-message">
            {error}
          </div>
        )}



        <div className="appliance-list">

          {appliances.length === 0 ? (

            <div className="empty-state">

              <h2>
                No appliances found
              </h2>

              <p>
                There are no appliances registered for this room.
              </p>

            </div>

          ) : (

            appliances.map((item) => {

              const applianceId =
                item.appliance.applianceId;

              const alreadyQueried =
                queriedQuantities[applianceId] || 0;

              const remaining =
                getRemainingQuantity(item);

              const selected =
                quantities[applianceId] || 0;

              return (
                <div
                  className="appliance-card"
                  key={item.roomApplianceId}
                >

                  {/* APPLIANCE INFORMATION */}

                  <div className="appliance-info">

                    <h3>
                      {item.appliance.name}
                    </h3>

                    <p>
                      Total available: {item.quantity}
                    </p>

                    {alreadyQueried > 0 && (
                      <p className="already-queried">
                        Currently queried: {alreadyQueried}
                      </p>
                    )}

                    <p className="remaining-quantity">
                      Remaining: {remaining}
                    </p>

                  </div>


                  {/* QUANTITY CONTROL */}

                  <div className="quantity-control">

                    <button
                      type="button"
                      onClick={() =>
                        decreaseQuantity(applianceId)
                      }
                      disabled={selected === 0}
                    >
                      −
                    </button>

                    <span>
                      {selected}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        increaseQuantity(
                          applianceId,
                          remaining
                        )
                      }
                      disabled={
                        selected >= remaining ||
                        remaining === 0
                      }
                    >
                      +
                    </button>

                  </div>

                </div>
              );
            })
          )}

        </div>


        {/* DESCRIPTION */}

        <div className="form-group">

          <label>
            Description
          </label>

          <textarea
            className="form-textarea"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="Describe the problem..."
            rows="6"
          />

        </div>


        {/* ACTIONS */}

        <div className="form-actions">

          <button
            className="secondary-button"
            type="button"
            onClick={() =>
              navigate(
                `/student/building/${buildingId}/floor/${encodeURIComponent(floor)}`
              )
            }
          >
            Back
          </button>

          <button
            className="primary-button"
            type="button"
            onClick={submitQuery}
            disabled={submitting}
          >
            {submitting
              ? "Submitting..."
              : "Raise Query"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default RoomQueryPage;