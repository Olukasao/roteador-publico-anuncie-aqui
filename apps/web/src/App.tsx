import { Navigate, Route, Routes } from "react-router-dom";
import { PortalFlow } from "./features/portal/PortalFlow";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/wifi" replace />} />
      <Route path="/wifi" element={<PortalFlow />} />
      <Route path="*" element={<Navigate to="/wifi" replace />} />
    </Routes>
  );
}
