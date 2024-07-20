import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import bookmark from "../assets/bookmark.png";
import filledbookmark from "../assets/filled-bookmark.png";
import news_img from "../assets/default-news-img.webp";
import "./Home.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Home = () => {
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [bookmarked, setBookmarked] = useState({});
  const [category, setCategory] = useState("general");
  const navigate = useNavigate();

  useEffect(() => {
    fetchNews();
  }, [category, isSearching]);

  const fetchNews = async () => {
    try {
      const apiKey = "d7cd0a4a640f4ec0ad86512b42dad260"; // Make sure this is valid
      const endpoint = isSearching
        ? `https://newsapi.org/v2/everything?q=${searchTerm}&language=en&apiKey=${apiKey}`
        : `https://newsapi.org/v2/top-headlines?country=in&category=${category}&language=en&apiKey=${apiKey}`;

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Error fetching news: ${response.statusText}`);
      }
      const data = await response.json();
      setArticles(data.articles);
    } catch (error) {
      console.error("Error fetching news:", error);
      toast.error("Failed to fetch news. Please try again later.");
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    await fetchNews();
  };

  const handleBookmark = async (index, article) => {
    const isBookmarked = !bookmarked[index];
  
    setBookmarked((prevState) => ({
      ...prevState,
      [index]: isBookmarked,
    }));
  
    try {
      const endpoint = isBookmarked
        ? "http://localhost:5001/auth/bookmark"
        : "http://localhost:5001/auth/removeBookmark";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          article: isBookmarked ? article : { url: article.url },
        }),
      });
  
      if (response.ok) {
        toast.success(
          `Article ${isBookmarked ? "bookmarked" : "unbookmarked"} successfully`
        );
      } else {
        const result = await response.json();
        toast.error(
          result.message ||
            `Failed to ${isBookmarked ? "bookmark" : "unbookmark"} the article`
        );
      }
    } catch (error) {
      console.error(
        `Error ${isBookmarked ? "bookmarking" : "unbookmarking"} the article:`,
        error
      );
      toast.error(
        `An error occurred while ${
          isBookmarked ? "bookmarking" : "unbookmarking"
        } the article`
      );
    }
  };
  
  

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setIsSearching(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="container">
      <nav>
        <div className="logo-area">
          <img src={logo} alt="logo" />
          <h2>
            The News<span>Mania</span>
          </h2>
        </div>
        <div className="nav-links">
          <Link
            to="/home"
            className="home"
            onClick={() => handleCategoryChange("general")}
          >
            Home
          </Link>
          <div className="categories">
            <a href="#categories">Categories</a>
            <div className="dropdown-menu">
              <a href="#home" onClick={() => handleCategoryChange("general")}>
                General
              </a>
              <a href="#sports" onClick={() => handleCategoryChange("sports")}>
                Sports
              </a>
              <a href="#health" onClick={() => handleCategoryChange("health")}>
                Health
              </a>
              <a
                href="#technology"
                onClick={() => handleCategoryChange("technology")}
              >
                Technology
              </a>
              <a
                href="#business"
                onClick={() => handleCategoryChange("business")}
              >
                Business
              </a>
              <a
                href="#entertainment"
                onClick={() => handleCategoryChange("entertainment")}
              >
                Entertainment
              </a>
              <a
                href="#science"
                onClick={() => handleCategoryChange("science")}
              >
                Science
              </a>
            </div>
          </div>
          <Link to="/bookmark" className="bookmarks">
            Bookmarks
          </Link>
        </div>
        <div className="log-cont">
          <Link to="/login">
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </Link>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search here..."
          />
          <button className="search-btn" onClick={handleSearch}>
            Search
          </button>
        </div>
      </nav>
      <div className="main">
        <div className="news-cont">
          {articles.map((article, index) => (
            <div className="card" key={index}>
              <img
                src={bookmarked[index] ? filledbookmark : bookmark}
                className="bookmark"
                onClick={() => handleBookmark(index, article)}
                alt="bookmark"
              />
              <img
                src={article.urlToImage || news_img}
                className="news-img"
                alt="news"
              />
              <h2 className="head">{article.title}</h2>
              <p>
                {article.description}
                <a
                  className="read-more"
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ...more
                </a>
              </p>
              <button>
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  Read more
                </a>
              </button>
            </div>
          ))}
        </div>
      </div>
      <footer>
        <p>© 2024 The NewsMania. All rights reserved.</p>
      </footer>
      <ToastContainer />
    </div>
  );
};

export default Home;
