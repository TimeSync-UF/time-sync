import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { supabase, AuthContext } from "../../AuthProvider";
import "./Onboarding.css"; // We will use the same CSS file as before

export default function Login() {
  const navigate = useNavigate();
  const { session } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (session) navigate("/");

    const email = e.target.email.value;
    const password = e.target.password.value;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      alert("Error logging in: " + error.message);
    } else {
      alert("Log in successful!");
    }
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <h1 className="login-title">TimeSync</h1>
        <span className="login-subtitle">Connection Across the Globe</span>
      </div>
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="text"
            name="email"
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            name="password"
            className="form-input"
            required
          />
        </div>
        <button type="submit" className="submit-button">
          Log In
        </button>
        <span className="signup-link">
          Don't have an account? 
          <a className="signup-link-text" href="/signup">Sign Up!</a>
        </span>
      </form>
    </div>
  );
}
