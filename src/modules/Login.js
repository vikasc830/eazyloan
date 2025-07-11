import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import logo from "../images/EazyLoanLogo.png";

function Login() {
  const[email,setemail]=useState("");
  const[password,setPassword]=useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (email === "vikas.septa@hexagon.com" && password === "Oneplus13@12345") {
      navigate("/dashboard");
    } else {
      alert("Invalid email or password");
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
            onChange={(e) => setemail(e.target.value)}
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
  <p  >Don't have an account?</p>
  <button
    type="button"
    className="signup-link"
    onClick={() => navigate("/signup")}
  >
    Sign up
  </button>
</div>
        </form>
      </div>
    </div>
  );
}

export default Login;