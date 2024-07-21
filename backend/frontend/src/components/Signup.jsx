import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function Signup() {
  const [signupInfo, setSignupInfo] = useState({
    username: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupInfo((prevInfo) => ({
      ...prevInfo,
      [name]: value,
    }));
  };

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    const { username, email, password } = signupInfo;

    if (!username || !email || !password) {
      return handleError("All fields are required.");
    }

    try {
      const url = `${window.location.origin}/auth/signup`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupInfo),
      });
      const result = await response.json();

      if (response.ok) {
        handleSuccess(result.message);
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else {
        handleError(result.message || "Signup failed.");
      }
    } catch (error) {
      handleError("Please check your input and try again.");
    }
  };

  const handleSuccess = (message) => {
    toast.success(message);
  };

  const handleError = (message) => {
    toast.error(message);
  };

  return (
    <div className="cont">
      <h2 className="signup-heading">
        Sign <span>Up</span>
      </h2>
      <form onSubmit={handleSignup}>
        <div className="Input">
          <label htmlFor="username">Username</label>
          <input 
            type="text" 
            name="username" 
            onChange={handleChange} 
            value={signupInfo.username} 
          />
        </div>
        <div className="Input">
          <label htmlFor="email">Email</label>
          <input 
            type="email" 
            name="email" 
            onChange={handleChange} 
            value={signupInfo.email} 
          />
        </div>
        <div className="Input">
          <label htmlFor="password">Password</label>
          <input 
            type="password" 
            name="password" 
            onChange={handleChange} 
            value={signupInfo.password} 
          />
        </div>
        <div className="bottom">
          <button type="submit" className="signup">
            Signup
          </button>
          <span>
            Already have an account? <Link to="/login">Login</Link>
          </span>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
}

export default Signup;
