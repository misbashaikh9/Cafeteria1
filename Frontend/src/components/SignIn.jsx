import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import eyeIcon from "/menu-images/eye-close.png";
import eyeOffIcon from "/menu-images/eye-open.png";
import { useAuth } from './AuthContext.jsx';

const SignIn = () => {
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:3001/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (res.ok && data.token) {
        setToken(data.token);
        localStorage.setItem('username', data.username || 'User');
        localStorage.setItem('userId', data.userId || '');
        Swal.fire({
          icon: 'success',
          title: `Welcome back${data.username ? ', ' + data.username : ''} ☕`,
          text: "You're signed in successfully!",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => navigate("/"));
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: data.error || 'Invalid email or password',
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: 'Could not connect to server',
      });
    }
  };



  return (
    <div
      style={{
        backgroundColor: "#fefcf9",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "40px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#6f4e37",
            marginBottom: "24px",
            fontWeight: "600",
          }}
        >
          Sign In
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #d2b48c",
              backgroundColor: "#fffaf5",
              fontSize: "14px",
              color: "#3b2f2f", // Ensure input text is visible
            }}
          />

          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: "12px",
                paddingRight: "40px",
                borderRadius: "8px",
                border: "1px solid #d2b48c",
                backgroundColor: "#fffaf5",
                fontSize: "14px",
                width: "100%",
                color: "#3b2f2f", // Ensure input text is visible
              }}
            />
            <img
              src={showPassword ? eyeOffIcon : eyeIcon}
              alt="toggle"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                top: "50%",
                right: "12px",
                transform: "translateY(-50%)",
                width: "20px",
                height: "20px",
                cursor: "pointer",
                opacity: 0.7,
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: "12px",
              backgroundColor: "#a47148",
              color: "white",
              fontWeight: "bold",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "15px",
              marginTop: "8px",
            }}
          >
            Sign In
          </button>

          <div
            style={{
              textAlign: "center",
              marginTop: "12px",
              fontSize: "14px",
            }}
          >
            <span style={{ color: "#6f4e37" }}>Don't have an account? </span>
            <span
              onClick={() => navigate("/signup")}
              style={{
                color: "#a47148",
                fontWeight: "bold",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Sign Up
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
