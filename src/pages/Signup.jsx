import { supabase, AuthContext } from "../AuthProvider";
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
      .insert([{ id: userId, first_name, last_name, username }]);
  
    if (profileError) {
      alert("Error inserting profile: " + profileError.message);
      return;
    }
  
    alert("Sign up successful!");
    navigate("/home");
  };
  

  return (
    <div className="min-h-screen flex justify-center items-center flex-col gap-y-10 py-20">
      {/* Logo and Title */}
      <img src="/logo.png" alt="Logo" className="w-32 h-32" />
      <div className="flex justify-center flex-col items-center gap-y-3 text-[#D75600]">
        <h1 className="text-5xl bevan-regular">TimeSync</h1>
        <span className="text-md abhaya-libre-extrabold">
        Connection Across the Globe
        </span>
      </div>
      <form
        className="flex flex-col space-y-5 w-full max-w-sm"
        onSubmit={handleSubmit}
      >
        {/* First Name and Last Name Inputs */}
        <div className="flex space-x-4">
          <span className="flex flex-col space-y-0.5 w-1/2">
            <p className="abhaya-libre-regular text-xl mb-0">First Name</p>
            <input
              type="text"
              name="firstName"
              placeholder="Johnny"
              className="abhaya-libre-regular p-2 border-2 rounded-lg border-black placeholder-gray-400"
              required
            />
          </span>

          <span className="flex flex-col space-y-0.5 w-1/2">
            <p className="abhaya-libre-regular text-xl mb-0">Last Name</p>
            <input
              type="text"
              name="lastName"
              placeholder="Appleseed"
              className="abhaya-libre-regular p-2 border-2 rounded-lg border-black placeholder-gray-400"
              required
            />
          </span>
        </div>

        {/* Email Input */}
        <span className="flex flex-col space-y-0.5">
          <p className="abhaya-libre-regular text-xl mb-0">Email</p>
          <input
            type="text"
            name="email"
            placeholder="johnnyapple@gmail.com"
            className="abhaya-libre-regular p-2 border-2 rounded-lg border-black placeholder-gray-400"
            required
          />
        </span>

        {/* Username Input */}
        <span className="flex flex-col space-y-0.5">
          <p className="abhaya-libre-regular text-xl mb-0">Create Username</p>
          <input
            type="text"
            name="username"
            placeholder="johnnyappleseed234"
            className="abhaya-libre-regular p-2 border-2 rounded-lg border-black placeholder-gray-400"
            required
          />
        </span>

        {/* Password Input */}
        <span className="flex flex-col space-y-0.5">
          <p className="abhaya-libre-regular text-xl mb-0">Create Password</p>
          <input
            type="password"
            name="password"
            placeholder="Appleseed0!"
            className="abhaya-libre-regular p-2 border-2 rounded-lg border-black placeholder-gray-400"
            onChange={handlePasswordChange}
            required
          />
        </span>

        {/* Password Requirements */}
        <ul
          className="list-none abhaya-libre-regular text-[#767575]"
          style={{ lineHeight: "1.2" }}
        >
          {[
            { text: "At least 8 characters", check: passwordChecks.length },
            { text: "1 lowercase", check: passwordChecks.lowercase },
            { text: "1 uppercase", check: passwordChecks.uppercase },
            { text: "1 number", check: passwordChecks.number },
            { text: "1 special character", check: passwordChecks.special },
          ].map((req, index) => (
            <li key={index} className="flex items-center gap-2">
              {req.check ? "✔" : "•"}
              {req.text}
            </li>
          ))}
        </ul>

        <span className="flex flex-col space-y-0.5">
          <p className="abhaya-libre-regular text-xl mb-0">Confirm Password</p>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Appleseed0!"
            className="abhaya-libre-regular p-2 border-2 rounded-lg border-black placeholder-gray-400"
            onChange={handleConfirmPasswordChange}
            required
          />
          {passwordError && <p className="text-red-500">{passwordError}</p>}
        </span>

        <button
          type="submit"
          className="p-2 rounded-xl bg-[#D75600] text-white abhaya-libre-extrabold text-lg hover:opacity-80 transition"
        >
          Create Account
        </button>
        <span className="abhaya-libre-regular flex flex-row gap-x-1 justify-center">
          Already have an account?
          <a
            className="abhaya-libre-regular text-blue-500 underline"
            href="/login"
          >
            Log In!
          </a>
        </span>
      </form>
    </div>
  );
}