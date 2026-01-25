import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import SkeletonCard from "./SkeletonCard";
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
  const [loading, setLoading] = useState(false);
  const [summaries, setSummaries] = useState({});
  const [translatedSummaries, setTranslatedSummaries] = useState({});
  const [originalSummaries, setOriginalSummaries] = useState({}); // store original summaries

  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  useEffect(() => {
    fetchNews();
  }, [category, isSearching]);

  const fetchNews = async () => {
  try {
    if (loading) return;
    setLoading(true);

    const BASE_URL = import.meta.env.VITE_BACKEND_URL;

    const endpoint = isSearching
      ? `${BASE_URL}/api/news?search=${encodeURIComponent(searchTerm)}`
      : `${BASE_URL}/api/news?category=${category}`;

    const response = await fetch(endpoint);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch news");
    }

    setArticles(data?.articles || []);
  } catch (error) {
    toast.error("Error fetching news");
    console.error(error);
  } finally {
    setLoading(false);
  }
};


  const fetchSummary = async (url, index) => {
  if (!url) return;

  setSummaries(prev => ({ ...prev, [index]: "Generating summary..." }));

  try {
    const res = await fetch("http://localhost:5001/summarizer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    }); 

    const data = await res.json();

    const summaryText = data.summary || "Summary unavailable";

    setSummaries(prev => ({ ...prev, [index]: summaryText }));
    setOriginalSummaries(prev => ({ ...prev, [index]: summaryText })); // save original
  } catch (err) {
    setSummaries(prev => ({ ...prev, [index]: err.message || "Failed to load summary" }));
  }
};
  const handleTranslate = async (article, lang) => {
  const index = articles.findIndex(a => a.url === article.url);

  if (lang === "en") {
    setTranslatedSummaries(prev => ({ ...prev, [index]: { title: article.title, summary: originalSummaries[index] } }));
    return;
  }

  try {
    const res = await fetch("http://localhost:5001/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: article.title,
        text: originalSummaries[index], 
        targetLang: lang,
      }),
    });

    const data = await res.json();

    setTranslatedSummaries(prev => ({
      ...prev,
      [index]: {
        title: data.translatedTitle,
        summary: data.translatedText,
      },
    }));
  } catch {
    toast.error("Translation error");
  }
};

  const handleSearch = () => {
  if (searchTerm.trim() === "") return;

  setIsSearching(true);
  fetchNews();
};


  const handleBookmark = async (index, article) => {
  const newStatus = !bookmarked[index];
  setBookmarked((prev) => ({ ...prev, [index]: newStatus }));

  try {
    const endpoint = newStatus
      ? "http://localhost:5001/auth/bookmark"
      : "http://localhost:5001/auth/removeBookmark";

    const payload = newStatus
      ? {
          article: {
            url: article.url,
            image: article.image,
            title: article.title,
          },
        }
      : {
          articleUrl: article.url,
        };

    const res = await fetch(endpoint, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 401 || res.status === 403) {
      toast.error("Please login first");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
      return;
    }

    const data = await res.json();
    res.ok ? toast.success(data.message) : toast.error(data.message);
  } catch (err) {
    toast.error("Network error");
  }
};



  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setIsSearching(false);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    setTheme(newTheme);
  };

  const toggleExpand = (article, index) => {
    if (!article) return setExpandedArticle(null);

    setExpandedArticle((prev) => (prev?.url === article.url ? null : article));

    if (!summaries[index]) fetchSummary(article.url, index);
  };

  const languageOptions = useMemo(
    () => [
      { code: "en", name: "English" },
      { code: "hi", name: "Hindi" },
      { code: "fr", name: "French" },
      { code: "es", name: "Spanish" },
      { code: "de", name: "German" },
      { code: "zh", name: "Chinese" },
      { code: "ar", name: "Arabic" },
      { code: "ru", name: "Russian" },
    ],
    []
  );

  return (
    <div className={`container ${expandedArticle ? "blurred" : ""}`}>
      {/* NAVBAR */}
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
                <a key={cat} onClick={() => handleCategoryChange(cat)}>
                  {cat[0].toUpperCase() + cat.slice(1)}
                </a>
              ))}
            </div>
          </div>

          <Link to="/bookmark">Bookmarks</Link>
        </div>

        <div className="log-cont">
          <button className={`theme-toggle ${theme}`} onClick={toggleTheme}>
            <div className="toggle-circle"></div>
          </button>

          <input
            type="text"
            value={searchTerm}
            placeholder="Search..."
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />

          <button className="search-btn" onClick={handleSearch}>
            Search
          </button>
        </div>
      </nav>

      {/* NEWS GRID */}
      <div className="news-cont">
        {loading
          ? [...Array(9)].map((_, i) => <SkeletonCard key={i} />)
          : articles.map((article, index) => (
              <div className="card" key={index}>
                {/* bookmark */}
                <img
                  loading="lazy"
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
                  {expandedArticle?.url === article.url ? "✕" : "⤢"}
                </div>

                <img
                  loading="lazy"
                  src={article.image || news_img}
                  className="news-img"
                  alt="news"
                />

                <h2 className="head">
                  {translatedSummaries[index]?.title || article.title}
                </h2>

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
            ))}
      </div>

      {/* EXPANDED CARD */}
      {expandedArticle && (
        <div className="expanded-overlay" onClick={() => toggleExpand(null)}>
          <div className="expanded-card" onClick={(e) => e.stopPropagation()}>
            <div className="expand-icon" onClick={() => toggleExpand(null)}>
              ✕
            </div>

            <img
              loading="lazy"
              src={expandedArticle.image || news_img}
              className="expanded-img"
              alt="expanded"
            />

            <div className="date-source">
              <span>
                {expandedArticle.published_at
                  ? new Date(expandedArticle.published_at).toLocaleDateString()
                  : "Unknown"}
              </span>
              <span>{expandedArticle.source || "Unknown"}</span>
            </div>

            <h2>
              {translatedSummaries[
                articles.findIndex((a) => a.url === expandedArticle.url)
              ]?.title || expandedArticle.title}
            </h2>

            <div className="lang-select">
  <select
    defaultValue=""
    onChange={(e) =>
      handleTranslate(expandedArticle, e.target.value)
    }
  >
    <option value="" disabled>
      Select language
    </option>
    {languageOptions.map((l) => (
      <option key={l.code} value={l.code}>
        {l.name}
      </option>
    ))}
  </select>
</div>


            <p className="summary">
              {translatedSummaries[
                articles.findIndex((a) => a.url === expandedArticle.url)
              ]?.summary ||
                summaries[
                  articles.findIndex((a) => a.url === expandedArticle.url)
                ] ||
                "Loading summary..."}
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
