import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import logo from "../images/EazyLoanLogo.png";
import axios from "../API/axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("https://localhost:7202/login", {
        email,
        password,
      });

      // Store token
      localStorage.setItem("token", response.data.token);

      alert("Login successful!");
      navigate("/Dashboard");
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      alert("Login failed. " + (error.response?.data?.message || "Please try again."));
    }
  };

  return (
    <div className="login-page">
      <div className="logo-container">
        <img src={logo} alt="EazyLoan Logo" className="logo" />
      </div>

      <div className="login-container">
        <form className="login-form" onSubmit={handleLogin}>
          <h2>Login</h2>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>

          <div className="signup-redirect">
            <p>Don't have an account?</p>
            <Link to="/signup" className="signup-link">Sign up</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
