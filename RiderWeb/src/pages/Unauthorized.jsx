import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="container" style={{ textAlign: "center", marginTop: "100px" }}>
      <h1 style={{ color: "red", fontSize: "48px" }}>403</h1>
      <h2>Access Denied</h2>
      <p>You do not have permission to view this page.</p>
      
      <br />
      
      <button onClick={() => navigate(-1)} style={{ padding: "10px 20px" }}>
        Go Back
      </button>
    </div>
  );
}