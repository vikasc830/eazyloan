import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";
import logo from "../images/EazyLoanLogo.png";
import axios from "../API/axios"

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

     try {
    await axios.post('https://localhost:7202/register', {
      name,
      email,
      password,
    });

    alert("Signup successful!");
    navigate("/");
    // You can redirect or reset form here
  } catch (error) {
         console.error('Signup error:', error.response?.data || error.message);
    alert("Signup failed. " + (error.response?.data || ""));
  }
    
   
  };

  return (

     <div className="login-page">
          <div className="logo-container">
            <img src={logo} alt="EazyLoan Logo" className="logo" />
          </div>
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSignup}>
        <h2>Signup</h2>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

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
  onChange={(e) => {
    const value = e.target.value;
    setPassword(value);

    // Only validate if both fields have values
    if (value && confirmPassword) {
      if (value === confirmPassword) {
        setPasswordError("");
      } else {
        setPasswordError("Passwords do not match");
      }
    } else {
      setPasswordError(""); // Clear error while typing
    }
  }}
  required
/>


      <input
  type="password"
  placeholder="Confirm Password"
  value={confirmPassword}
  onChange={(e) => {
    const value = e.target.value;
    setConfirmPassword(value);

    if (password && value) {
      if (password === value) {
        setPasswordError("");
      } else {
        setPasswordError("Passwords do not match");
      }
    } else {
      setPasswordError("");
    }
  }}
  required
/>


        {passwordError && <p className="error">{passwordError}</p>}

        <button type="submit">Signup</button>
      </form>
    </div>
     </div>
  );
}

export default Signup;
          }
