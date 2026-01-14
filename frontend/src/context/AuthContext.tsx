import { useState, type ReactNode } from "react";
import { apiClient } from "../api/client";
import type { LoginResponse } from "../types";
import { AuthContext } from "./auth";

interface User {
  id: number;
  email: string;
}

const getInitialUser = (): User | null => {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  if (token && storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }
  return null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(getInitialUser);

  const login = async (email: string, password: string) => {
    const response = await apiClient<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    const { token, id, email: userEmail } = response.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify({ id, email: userEmail }));
    setUser({ id, email: userEmail });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: !!user, user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
