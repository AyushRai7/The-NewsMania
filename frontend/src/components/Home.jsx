import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import blackBookmark from "../assets/blackBookmark.png";
import blackFilledBookmark from "../assets/blackFilledBookmark.png";
import whiteBookmark from "../assets/whiteBookmark.png";
import whiteFilledBookmark from "../assets/whiteFilledBookmark.png";
import news_img from "../assets/default-news-img.webp";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Home.css";

const Home = () => {
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [bookmarked, setBookmarked] = useState({});
  const [category, setCategory] = useState("general");
  const [expandedArticle, setExpandedArticle] = useState(null);
  const [theme, setTheme] = useState("light");

  const [summaries, setSummaries] = useState({});
  const [translatedSummaries, setTranslatedSummaries] = useState({});
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
    fetchNews();
  }, [category, isSearching]);

  const fetchNews = async () => {
    try {
      const apiKey = "c42b8f8e384178ebd1be2ded1512767d";
      const endpoint = isSearching
        ? `http://api.mediastack.com/v1/news?access_key=${apiKey}&keywords=${searchTerm}&languages=en`
        : `http://api.mediastack.com/v1/news?access_key=${apiKey}&categories=${category}&countries=in&languages=en`;

      const response = await fetch(endpoint);
      if (!response.ok)
        throw new Error(`Error fetching news: ${response.statusText}`);
      const data = await response.json();
      setArticles(data.data || []);
    } catch (error) {
      console.error("Error fetching news:", error);
      toast.error("Failed to fetch news. Please try again later.");
    }
  };

  const fetchSummary = async (articleUrl, index) => {
    if (!articleUrl) {
      setSummaries((prev) => ({ ...prev, [index]: "Invalid article URL." }));
      return;
    }
    try {
      const res = await fetch("http://localhost:5001/summarizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: articleUrl }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setSummaries((prev) => ({
        ...prev,
        [index]: data.summary || "Summary unavailable",
      }));
    } catch (err) {
      console.error("Summary fetch error:", err);
      setSummaries((prev) => ({ ...prev, [index]: "Failed to load summary." }));
    }
  };

  const handleTranslate = async (article, lang) => {
    const index = articles.findIndex((a) => a.url === article.url);
    try {
      const res = await fetch("http://localhost:5001/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: article.title,
          text: article.content || summaries[index],
          targetLang: lang,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setTranslatedSummaries((prev) => ({
          ...prev,
          [index]: {
            title: data.translatedTitle,
            summary: data.translatedText,
          },
        }));
      } else {
        toast.error("Translation failed");
      }
    } catch (err) {
      console.error("Translation failed:", err);
      toast.error("Error while translating");
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    await fetchNews();
  };

  const handleBookmark = async (index, article) => {
    const isBookmarked = !bookmarked[index];
    setBookmarked((prev) => ({ ...prev, [index]: isBookmarked }));

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
        toast.error(result.message || "Failed to bookmark");
      }
    } catch (error) {
      console.error("Bookmark error:", error);
      toast.error("An error occurred while bookmarking");
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

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const toggleExpand = (article, index) => {
  // 🧩 If called with null → close expanded card
  if (!article) {
    setExpandedArticle(null);
    return;
  }

  // Otherwise, open or toggle specific article
  setExpandedArticle(expandedArticle === article ? null : article);

  if (!summaries[index]) fetchSummary(article.url, index);
};

  const languageOptions = [
    { code: "hi", name: "Hindi" },
    { code: "fr", name: "French" },
    { code: "es", name: "Spanish" },
    { code: "de", name: "German" },
    { code: "zh", name: "Chinese" },
    { code: "ar", name: "Arabic" },
    { code: "ru", name: "Russian" },
  ];

  return (
    <div className={`container ${expandedArticle ? "blurred" : ""}`}>
      {/* Navbar */}
      <nav>
        <div className="logo-area">
          <img src={logo} alt="logo" />
          <h2>
            The News<span>Mania</span>
          </h2>
        </div>

        <div className="nav-links">
          <Link to="/home" onClick={() => handleCategoryChange("general")}>
            Home
          </Link>
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
                  onClick={() => handleCategoryChange(cat)}
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

      {/* News Grid */}
      <div className="main">
        <div className="news-cont">
          {articles.map((article, index) => (
            <div className="card" key={index}>
              <img
                src={
                  theme === "dark"
                    ? bookmarked[index]
                      ? whiteFilledBookmark
                      : whiteBookmark
                    : bookmarked[index]
                    ? blackFilledBookmark
                    : blackBookmark
                }
                className="bookmark"
                onClick={() => handleBookmark(index, article)}
                alt="bookmark"
              />
              <div
                className="expand-icon"
                onClick={() => toggleExpand(article, index)}
              >
                {expandedArticle === article ? "✕" : "⤢"}
              </div>
              <img
                src={article.image || news_img}
                className="news-img"
                alt="news"
              />
              <h2 className="head">
                {translatedSummaries[index]?.title || article.title}
              </h2>
              <button>
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  Read more
                </a>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Expanded View */}
      {expandedArticle && (
        <div className="expanded-overlay" onClick={() => toggleExpand(null)}>
          <div className="expanded-card" onClick={(e) => e.stopPropagation()}>
            <div className="expand-icon" onClick={() => toggleExpand(null)}>
              ✕
            </div>
            <img
              src={expandedArticle.image || news_img}
              alt="news"
              className="expanded-img"
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "14px",
                color: "gray",
              }}
            >
              <span>
                {expandedArticle.published_at
                  ? new Date(expandedArticle.published_at).toLocaleDateString()
                  : "Unknown Date"}
              </span>
              <span>{expandedArticle.source || "Unknown Source"}</span>
            </div>

            <h2>
              {
                translatedSummaries[
                  articles.findIndex((a) => a.url === expandedArticle.url)
                ]?.title || expandedArticle.title
              }
            </h2>

            <div style={{ textAlign: "right" }}>
              <button
                onClick={() => setShowLanguageSelect(!showLanguageSelect)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "20px",
                }}
              >
                🌐
              </button>

              {showLanguageSelect && (
                <select
                  onChange={(e) =>
                    handleTranslate(expandedArticle, e.target.value)
                  }
                >
                  <option value="">Select Language</option>
                  {languageOptions.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <p style={{ marginTop: "10px", lineHeight: "1.5" }}>
              {
                translatedSummaries[
                  articles.findIndex((a) => a.url === expandedArticle.url)
                ]?.summary ||
                  summaries[
                    articles.findIndex((a) => a.url === expandedArticle.url)
                  ] ||
                  "Loading summary..."
              }
            </p>

            <button className="readmore-btn">
              <a
                href={expandedArticle.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Read full article
              </a>
            </button>
          </div>
        </div>
      )}

      <footer>
        <p>© 2025 The NewsMania. All rights reserved.</p>
      </footer>
      <ToastContainer />
    </div>
  );
};

export default Home;
