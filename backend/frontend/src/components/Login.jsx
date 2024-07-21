import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function Login() {
  const [loginInfo, setLoginInfo] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo((prevInfo) => ({
      ...prevInfo,
      [name]: value,
    }));
  };

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const { username, password } = loginInfo;

    if (!username || !password) {
      return handleError("Fields are required.");
    }

    try {
      const url = `${window.location.origin}/auth/login`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginInfo),
      });
      const result = await response.json();
      const { success, message, jwtToken, username, error } = result;

      if (success) {
        handleSuccess(message);
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('loggedInUser', username);
        setTimeout(() => {
          navigate("/home");
        }, 1000);
      } else if (error) {
        const details = error?.details[0]?.message || "Login failed";
        handleError(details);
      } else {
        handleError(message);
      }
    } catch {
      handleError("Username or password are incorrect");
    }
  };

  const handleSuccess = (message) => {
    toast.success(message);
  };

  const handleError = (message) => {
    toast.error(message);
  };

  return (
    <div className="cont-login">
      <h2 className="login-heading">
        Log<span>In</span>
      </h2>
      <form onSubmit={handleLogin}>
        <div className="Input">
          <label htmlFor="username">Username</label>
          <input type="text" name="username"
            onChange={handleChange}
            value={loginInfo.username} />
        </div>
        <div className="Input">
          <label htmlFor="password">Password</label>
          <input type="password" name="password"
            onChange={handleChange}
            value={loginInfo.password} />
        </div>
        <div className="bottom">
          <button type="submit" className="login">
            Login
          </button>
          <span>
            Create a new account <Link to="/signup">Signup</Link>
          </span>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
}

export default Login;
