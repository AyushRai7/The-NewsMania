import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Refreshhandle({ setisAuthenticated }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Instead of localStorage, check if user is authenticated via API
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:5001/auth/checkAuth", {
          method: "GET",
          credentials: "include", // ✅ send HttpOnly cookie
        });

        if (res.ok) {
          setisAuthenticated(true);

          if (
            location.pathname === "/" ||
            location.pathname === "/login" ||
            location.pathname === "/signup"
          ) {
            navigate("/home", { replace: true });
          }
        } else {
          setisAuthenticated(false);
        }
      } catch (err) {
        setisAuthenticated(false);
      }
    };

    checkAuth();
  }, [location, navigate, setisAuthenticated]);
}

export default Refreshhandle;
