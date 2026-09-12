import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import StudentLogin from "./pages/StudentLogin";
import StaffLogin from "./pages/StaffLogin";
import StudentDashboard from "./pages/StudentDashboard";
import BuildingPage from "./pages/BuildingPage";
import RoomPage from "./pages/RoomPage";
import RoomQueryPage from "./pages/RoomQueryPage";
import MyQueriesPage from "./pages/MyQueriesPage";
import CompletedQueries from "./pages/CompletedQueriesPage";
import StaffDashboard from "./pages/StaffDashboard";
import AssignWorker from "./pages/AssignWorker";
import StaffAssigned from "./pages/StaffAssigned";
import StaffCompleted from "./pages/StaffCompleted";
import WorkerDashboard from "./pages/WorkerDashboard";
import WorkerCompleted from "./pages/WorkerCompleted";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StudentLogin />} />

        <Route path="/staff/login" element={<StaffLogin />} />

        <Route
          path="/student/dashboard"
          element={<StudentDashboard />}
        />

        <Route
          path="/student/building/:buildingId"
          element={<BuildingPage />}
        />

        <Route
          path="/student/building/:buildingId/floor/:floor"
          element={<RoomPage />}
        />

        <Route
          path="/student/building/:buildingId/floor/:floor/room/:roomId"
          element={<RoomQueryPage />}
        />

        <Route
          path="/student/my-queries"
          element={<MyQueriesPage />}
        />

        <Route
          path="/student/completed-queries"
          element={<CompletedQueries />}
        />

        <Route
          path="/staff/dashboard"
          element={<StaffDashboard />}
        />

        <Route
          path="/staff/query/:queryId/assign"
          element={<AssignWorker />}
        />

        <Route
          path="/staff/assigned"
          element={<StaffAssigned />}
        />

        <Route
          path="/staff/completed"
          element={<StaffCompleted />}
        />

        <Route
          path="/worker/dashboard"
          element={<WorkerDashboard />}
        />

        <Route
          path="/worker/completed"
          element={<WorkerCompleted />}
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;