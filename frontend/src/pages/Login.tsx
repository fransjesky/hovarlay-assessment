import { useState, type FormEvent } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../hooks";
import { Input, Button } from "../components";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          <Input
            type="email"
            label="Email"
            value={email}
            onChange={setEmail}
            placeholder="Enter your email"
            required
          />
          <Input
            type="password"
            label="Password"
            value={password}
            onChange={setPassword}
            placeholder="Enter your password"
            required
          />
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            loadingText="Logging in..."
          >
            Login
          </Button>
        </form>
      </div>
    </div>
  );
};
