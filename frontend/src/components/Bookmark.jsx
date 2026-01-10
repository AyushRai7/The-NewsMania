import { useState, useEffect } from "react";
import logo from "../assets/logo.png";
import news_img from "../assets/default-news-img.webp";
import blackFilledBookmark from "../assets/blackFilledBookmark.png";
import whiteFilledBookmark from "../assets/whiteFilledBookmark.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Home.css";

const Bookmark = () => {
  const [bookmarkedArticles, setBookmarkedArticles] = useState([]);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
    fetchBookmarkedArticles();
  }, []);

  const fetchBookmarkedArticles = async () => {
  try {
    const res = await fetch("http://localhost:5001/auth/bookmark", {
      method: "GET",
      credentials: "include", 
    });

    if (res.status === 401 || res.status === 403) {
      toast.error("Please login first");
      return;
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    setBookmarkedArticles(data);
  } catch (err) {
    toast.error(err.message || "Failed to load bookmarks");
  }
};


  const handleRemoveBookmark = async (article) => {
  try {
    const res = await fetch("http://localhost:5001/auth/removeBookmark", {
      method: "POST",
      credentials: "include", 
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ articleUrl: article.url }),
    });

    if (res.status === 401 || res.status === 403) {
      toast.error("Please login first");
      return;
    }

    if (!res.ok) throw new Error();

    setBookmarkedArticles((prev) =>
      prev.filter((a) => a.url !== article.url)
    );

    toast.success("Removed from bookmarks");
  } catch {
    toast.error("Failed to remove bookmark");
  }
};


  const toggleTheme = () => {
    const t = theme === "light" ? "dark" : "light";
    setTheme(t);
    localStorage.setItem("theme", t);
    document.documentElement.setAttribute("data-theme", t);
  };


  return (
    <div className="page-wrapper">
      {/* NAVBAR */}
      <nav className="bookmark-nav">
        <div className="logo-area">
          <img src={logo} alt="logo" />
          <h2>
            The News<span>Mania</span>
          </h2>
        </div>

        <div className="nav-center">
          <h3>Bookmarks</h3>
        </div>

        <div className="nav-right">
          <button className={`theme-toggle ${theme}`} onClick={toggleTheme}>
            <div className="toggle-circle"></div>
          </button>
        </div>
      </nav>

      {/* CARDS */}
      <div className="news-cont">
        {bookmarkedArticles.length === 0 ? (
          <p>No bookmarked articles.</p>
        ) : (
          bookmarkedArticles.map((article, index) => (
            <div className="card" key={index}>
              <img
                src={theme === "dark" ? whiteFilledBookmark : blackFilledBookmark}
                className="bookmark"
                onClick={() => handleRemoveBookmark(article)}
                alt="bookmark"
              />
              <img
                src={article.image || news_img}
                className="news-img"
                alt="news"
              />

              <h2 className="head">{article.title}</h2>

              <button>
                <a href={article.url} target="_blank" rel="noreferrer">
                  Read more
                </a>
              </button>
            </div>
          ))
        )}
      </div>

      <footer>
        <p>© 2025 The NewsMania. All rights reserved.</p>
      </footer>

      <ToastContainer />
    </div>
  );
};

export default Bookmark;
