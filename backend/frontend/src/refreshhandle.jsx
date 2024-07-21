import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Refreshhandle({setisAuthenticated}){
   const location=useLocation();
   const navigate=useNavigate();

   useEffect(()=>{
    if(localStorage.getItem('token')){
        setisAuthenticated(true);
        if(location.pathname==='/' || location.pathname==='/login' || location.pathname==='/signup'){
            navigate('/home', {replace: false});
        }
    }
   }, [location, navigate, setisAuthenticated]);
}

export default Refreshhandle;