// AuthProvider.jsx
import React, { createContext, useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://xlekrcmowvjjtpfdzajf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsZWtyY21vd3ZqanRwZmR6YWpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5NTk2NjQsImV4cCI6MjA1ODUzNTY2NH0.Kj-yneoIz-PKosCbGrKnRKrc7OQAG_9G9jUjyXi6Y0w"
);

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    const login = (userData) => {
      setUser(userData);
      navigate("/home"); // Redirect to home after login
    };
  
    const logout = () => {
      setUser(null);
      navigate("/login"); // Redirect to login after logout
    };
    
    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session }}>{children}</AuthContext.Provider>
  );
};