import { supabase, AuthContext } from "../../AuthProvider";
import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";

export default function Signup() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { session } = useContext(AuthContext);

  // Handle password change
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  // Handle confirm password change
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  // Validate password through regex
  const validatePassword = (password) => {
    return {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  };

  // Check password requirements
  const passwordChecks = validatePassword(password);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setPasswordError(""); // Clear error if passwords match

    const email = e.target.email.value;
    const first_name = e.target.firstName.value;
    const last_name = e.target.lastName.value;
    const username = e.target.username.value;

    // Step 1: Sign up user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert("Error signing up: " + error.message);
      return;
    }

    const userId = data?.user?.id;
    if (!userId) {
      alert("Error: User ID not returned.");
      return;
    }

    // Step 2: Insert into Profiles table
    const { data: profileData, error: profileError } = await supabase
      .from("Profiles")
      .insert([{ id: userId, first_name, last_name, username, email }]);

    if (profileError) {
      alert("Error inserting profile: " + profileError.message);
      return;
    }

    alert("Sign up successful!");
    navigate("/onboarding");
  };

  return (
    <div className="onboarding-container">
      {/* Logo and Title */}
      <img src="/logo.png" alt="Logo" className="w-32 h-32" />
      <div className="onboarding-header">
        <h1>TimeSync</h1>
        <h4>Connection Across the Globe</h4>
      </div>
      <form
        className="onboarding-form"
        onSubmit={handleSubmit}
      >
        {/* First Name and Last Name Inputs */}
        <div className="form-group name-fields">
          <div className="name-container">
            <div className="name-input">
              <p className="form-label">First Name</p>
              <input
                type="text"
                name="firstName"
                placeholder="Johnny"
                className="form-input"
                required
              />
            </div>
            <div className="name-input">
              <p className="form-label">Last Name</p>
              <input
                type="text"
                name="lastName"
                placeholder="Appleseed"
                className="form-input"
                required
              />
            </div>
          </div>
        </div>

        {/* Email Input */}
        <div className="form-group">
          <p className="form-label">Email</p>
          <input
            type="text"
            name="email"
            placeholder="johnnyapple@gmail.com"
            className="form-input"
            required
          />
        </div>

        {/* Username Input */}
        <div className="form-group">
          <p className="form-label">Create Username</p>
          <input
            type="text"
            name="username"
            placeholder="johnnyappleseed234"
            className="form-input"
            required
          />
        </div>

        {/* Password Input */}
        <div className="form-group">
          <p className="form-label">Create Password</p>
          <input
            type="password"
            name="password"
            placeholder="Appleseed0!"
            className="form-input"
            onChange={handlePasswordChange}
            required
          />
        </div>

        {/* Password Requirements */}
        <ul className="password-requirements">
          {[
            { text: "At least 8 characters", check: passwordChecks.length },
            { text: "1 lowercase", check: passwordChecks.lowercase },
            { text: "1 uppercase", check: passwordChecks.uppercase },
            { text: "1 number", check: passwordChecks.number },
            { text: "1 special character", check: passwordChecks.special },
          ].map((req, index) => (
            <li key={index} className="password-requirement">
              {req.check ? "✔" : "•"} {req.text}
            </li>
          ))}
        </ul>

        {/* Confirm Password Input */}
        <div className="form-group">
          <p className="form-label">Confirm Password</p>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Appleseed0!"
            className="form-input"
            onChange={handleConfirmPasswordChange}
            required
          />
          {passwordError && <p className="password-error">{passwordError}</p>}
        </div>

        <button
          type="submit"
          className="submit-button"
        >
          Create Account
        </button>
        <div className="signup-link">
          Already have an account?
          <a
            className="signup-link-text"
            href="/login"
          >
            Log In!
          </a>
        </div>
      </form>
    </div>
  );
}
