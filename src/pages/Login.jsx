import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { supabase, AuthContext } from "../AuthProvider";

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

  //if (session) navigate("/");

  return (
    <div className="h-screen flex justify-center items-center flex-col gap-y-10">
      <div className="flex justify-center flex-col items-center gap-y-3 text-[#D75600]">
        <h1 className="text-5xl bevan-regular">TimeSync</h1>
        <span className="text-md abhaya-libre-extrabold">
          Connection Across the Globe
        </span>
      </div>
      <form
        className="flex flex-col space-y-5 w-full max-w-sm text-left"
        onSubmit={handleSubmit}
      >
        <span className="flex flex-col space-y-0.5">
          <p className="abhaya-libre-regular text-xl mb-0">Email</p>
          <input
            type="text"
            name="email"
            className="p-2 border-2 rounded-lg border-black"
            required
          />
        </span>
        <span className="flex flex-col space-y-0.5">
          <p className="abhaya-libre-regular text-xl mb-0">Password</p>
          <input
            type="password"
            name="password"
            className="p-2 border-2 rounded-lg border-black"
            required
          />
        </span>
        <button
          type="submit"
          className="p-2 rounded-xl bg-[#D75600] text-white abhaya-libre-extrabold text-lg hover:opacity-80 transition"
        >
          Log In
        </button>
        <span className="flex flex-row gap-x-1 justify-center">
          Don't have an account?
          <a className="text-blue-500 underline" href="/signup">
            Sign Up!
          </a>
        </span>
      </form>
    </div>
  );
}