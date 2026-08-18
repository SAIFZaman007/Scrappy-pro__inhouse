import { Navigate, Route, Routes } from "react-router-dom";
import Shell from "./components/Shell";
import ConsolePage from "./pages/ConsolePage";
import HistoryPage from "./pages/HistoryPage";
import RunPage from "./pages/RunPage";
import SignInPage from "./pages/SignInPage";
import { token } from "./lib/api";

function Protected({ children }: { children: React.ReactNode }) {
  return token.get() ? <>{children}</> : <Navigate to="/sign-in" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/sign-in" element={<SignInPage />} />
      <Route
        path="/"
        element={
          <Protected>
            <Shell />
          </Protected>
        }
      >
        <Route index element={<ConsolePage />} />
        <Route path="runs" element={<HistoryPage />} />
        <Route path="runs/:jobId" element={<RunPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
