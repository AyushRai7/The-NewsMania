import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import SkeletonCard from "./SkeletonCard";
import NewsCard from "./NewsCard";
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
  const [originalSummaries, setOriginalSummaries] = useState({});

  const navigate = useNavigate();

  /* ---------------- THEME ---------------- */
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  /* ---------------- FETCH NEWS (with abort + no duplicates) ---------------- */
  useEffect(() => {
    const controller = new AbortController();

    const fetchNews = async () => {
      try {
        if (loading) return;
        setLoading(true);

        const BASE_URL = import.meta.env.VITE_BACKEND_URL;
        const endpoint = isSearching
          ? `${BASE_URL}/api/news?search=${encodeURIComponent(searchTerm)}`
          : `${BASE_URL}/api/news?category=${category}`;

        const response = await fetch(endpoint, {
          signal: controller.signal,
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        setArticles(data?.articles || []);
      } catch (err) {
        if (err.name !== "AbortError") {
          toast.error("Error fetching news");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    return () => controller.abort();
  }, [category, isSearching]);

  /* ---------------- SUMMARY ---------------- */
  const fetchSummary = useCallback(
    async (url) => {
      if (!url || summaries[url]) return;

      setSummaries((p) => ({ ...p, [url]: "Generating summary..." }));

      try {
        const res = await fetch("http://localhost:5001/summarizer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        const data = await res.json();
        const text = data.summary || "Summary unavailable";

        setSummaries((p) => ({ ...p, [url]: text }));
        setOriginalSummaries((p) => ({ ...p, [url]: text }));
      } catch {
        setSummaries((p) => ({ ...p, [url]: "Failed to load summary" }));
      }
    },
    [summaries],
  );

  /* ---------------- TRANSLATE ---------------- */
  const handleTranslate = useCallback(
    async (article, lang) => {
      const key = article.url;

      if (lang === "en") {
        setTranslatedSummaries((p) => ({
          ...p,
          [key]: { title: article.title, summary: originalSummaries[key] },
        }));
        return;
      }

      try {
        const res = await fetch("http://localhost:5001/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: article.title,
            text: originalSummaries[key],
            targetLang: lang,
          }),
        });

        const data = await res.json();

        setTranslatedSummaries((p) => ({
          ...p,
          [key]: {
            title: data.translatedTitle,
            summary: data.translatedText,
          },
        }));
      } catch {
        toast.error("Translation error");
      }
    },
    [originalSummaries],
  );

  /* ---------------- SEARCH ---------------- */
  const handleSearch = () => {
    if (searchTerm.trim() === "") return;
    setIsSearching(true); // fetch handled by effect
  };

  /* ---------------- BOOKMARK ---------------- */
  const handleBookmark = useCallback(
    async (article) => {
      const key = article.url;
      const newStatus = !bookmarked[key];

      setBookmarked((p) => ({ ...p, [key]: newStatus }));

      try {
        const endpoint = newStatus
          ? "http://localhost:5001/auth/bookmark"
          : "http://localhost:5001/auth/removeBookmark";

        const payload = newStatus
          ? {
              article: { url: key, image: article.image, title: article.title },
            }
          : { articleUrl: key };

        const res = await fetch(endpoint, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.status === 401 || res.status === 403) {
          toast.error("Please login first");
          navigate("/login");
          return;
        }

        const data = await res.json();
        res.ok ? toast.success(data.message) : toast.error(data.message);
      } catch {
        toast.error("Network error");
      }
    },
    [bookmarked, navigate],
  );

  /* ---------------- CATEGORY ---------------- */
  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setIsSearching(false);
  };

  /* ---------------- THEME ---------------- */
  const toggleTheme = useCallback(() => {
    const newTheme = theme === "light" ? "dark" : "light";
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    setTheme(newTheme);
  }, [theme]);

  /* ---------------- EXPAND ---------------- */
  const toggleExpand = useCallback(
    (article) => {
      if (!article) return setExpandedArticle(null);

      setExpandedArticle((p) => (p?.url === article.url ? null : article));

      fetchSummary(article.url);
    },
    [fetchSummary],
  );

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
    [],
  );

  /* ---------------- UI (UNCHANGED) ---------------- */
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

      {/* GRID */}
      <div className="news-cont">
        {loading
          ? [...Array(9)].map((_, i) => <SkeletonCard key={i} />)
          : articles.map((article) => (
              <NewsCard
                key={article.url}
                article={article}
                theme={theme}
                bookmarked={bookmarked[article.url]}
                onBookmark={handleBookmark}
                onExpand={toggleExpand}
                expanded={expandedArticle?.url === article.url}
                translated={translatedSummaries[article.url]}
              />
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
              src={expandedArticle.image || news_img}
              className="expanded-img"
              alt="expanded"
            />

            <h2>
              {translatedSummaries[expandedArticle.url]?.title ||
                expandedArticle.title}
            </h2>

            <select
              onChange={(e) => handleTranslate(expandedArticle, e.target.value)}
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

            <p className="summary">
              {translatedSummaries[expandedArticle.url]?.summary ||
                summaries[expandedArticle.url] ||
                "Loading summary..."}
            </p>

            <button className="readmore-btn">
              {" "}
              <a
                href={expandedArticle.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {" "}
                Read full article{" "}
              </a>{" "}
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
