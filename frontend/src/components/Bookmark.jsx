import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import news_img from "../assets/default-news-img.webp";
import blackBookmark from "../assets/blackBookmark.png";
import blackFilledBookmark from "../assets/blackFilledBookmark.png";
import whiteBookmark from "../assets/whiteBookmark.png";
import whiteFilledBookmark from "../assets/whiteFilledBookmark.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Home.css"; // same css file for consistent styling

const Bookmark = () => {
  const [bookmarkedArticles, setBookmarkedArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [category, setCategory] = useState("general");
  const [expandedArticle, setExpandedArticle] = useState(null);
  const [theme, setTheme] = useState("light");
  const navigate = useNavigate();

  // Load theme + bookmarks on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
    fetchBookmarkedArticles();
  }, []);

  // Scroll navbar effect
  useEffect(() => {
    const handleScroll = () => {
      const nav = document.querySelector("nav");
      if (window.scrollY > 20) nav.classList.add("scrolled");
      else nav.classList.remove("scrolled");
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchBookmarkedArticles = async () => {
    try {
      const response = await fetch("http://localhost:5001/auth/bookmark", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBookmarkedArticles(data);
        setFilteredArticles(data);
      } else {
        const result = await response.json();
        toast.error(result.message || "Failed to fetch bookmarked articles");
      }
    } catch (error) {
      console.error("Error fetching bookmarked articles:", error);
      toast.error("An error occurred while fetching bookmarked articles");
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim() === "") {
      setFilteredArticles(bookmarkedArticles);
      return;
    }
    const filtered = bookmarkedArticles.filter(
      (article) =>
        article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredArticles(filtered);
  };

  const handleRemoveBookmark = async (article) => {
    try {
      const response = await fetch("http://localhost:5001/auth/removeBookmark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          articleUrl: article.url,
        }),
      });

      if (response.ok) {
        setBookmarkedArticles((prev) =>
          prev.filter((a) => a.url !== article.url)
        );
        setFilteredArticles((prev) =>
          prev.filter((a) => a.url !== article.url)
        );
        toast.success("Article unbookmarked successfully");
      } else {
        const result = await response.json();
        toast.error(result.message || "Failed to unbookmark");
      }
    } catch (error) {
      console.error("Error unbookmarking:", error);
      toast.error("An error occurred while unbookmarking");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const toggleExpand = (article) => {
    setExpandedArticle(expandedArticle === article ? null : article);
  };

  return (
    <div className={`container ${expandedArticle ? "blurred-root" : ""}`}>
      {/* Navbar */}
      <nav>
        <div className="logo-area">
          <img src={logo} alt="logo" />
          <h2>
            The News<span>Mania</span>
          </h2>
        </div>

        <div className="nav-links">
          <Link to="/home">Home</Link>
          <div className="categories">
            <a href="#categories">Categories</a>
            <div className="dropdown-menu">
              {[
                "general",
                "sports",
                "health",
                "technology",
                "business",
                "entertainment",
                "science",
              ].map((cat) => (
                <a
                  key={cat}
                  href={`#${cat}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </a>
              ))}
            </div>
          </div>
          <Link to="/bookmark">Bookmarks</Link>
        </div>

        <div className="log-cont">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
          <button className={`theme-toggle ${theme}`} onClick={toggleTheme}>
            <div className="toggle-circle"></div>
          </button>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search here..."
          />
          <button className="search-btn" onClick={handleSearch}>
            Search
          </button>
        </div>
      </nav>

      {/* Main Section */}
      <div className="main">
        <div className="news-cont">
          {filteredArticles.length === 0 ? (
            <p>No bookmarked articles found.</p>
          ) : (
            filteredArticles.map((article, index) => (
              <div className="card" key={index}>
                <img
                  src={
                    theme === "dark"
                      ? whiteFilledBookmark
                      : blackFilledBookmark
                  }
                  className="bookmark"
                  onClick={() => handleRemoveBookmark(article)}
                  alt="bookmark"
                />
                <div
                  className="expand-icon"
                  onClick={() => toggleExpand(article)}
                >
                  {expandedArticle === article ? "✕" : "⤢"}
                </div>
                <img
                  src={article.image || news_img}
                  className="news-img"
                  alt="news"
                />
                <h2 className="head">{article.title}</h2>
                <button>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Read more
                  </a>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Expanded Card Overlay */}
      {expandedArticle && (
        <div className="overlay" onClick={() => toggleExpand(null)}>
          <div
            className="expanded-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="expanded-close"
              onClick={() => toggleExpand(null)}
            >
              ✕
            </button>
            <div className="expanded-body">
              <img
                src={expandedArticle.image || news_img}
                alt="news"
                className="expanded-img"
              />
              <div className="expanded-text">
                <h2>{expandedArticle.title}</h2>
                <p className="desc">
                  {expandedArticle.description ||
                    "No description available."}
                </p>
                <button>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Read more
                  </a>
                </button>
                <details className="json-details">
                  <summary>View JSON</summary>
                  <pre>
                    {JSON.stringify(expandedArticle, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer>
        <p>© 2024 The NewsMania. All rights reserved.</p>
      </footer>

      <ToastContainer />
    </div>
  );
};

export default Bookmark;
