import React, { useState, useEffect } from "react";
import news_img from "../assets/default-news-img.webp";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Bookmark() {
  const [bookmarkedArticles, setBookmarkedArticles] = useState([]);

  useEffect(() => {
    fetchBookmarkedArticles();
  }, []);

  const fetchBookmarkedArticles = async () => {
    try {
      const response = await fetch(`${window.location.origin}/auth/bookmark`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        setBookmarkedArticles(data);
      } else {
        const result = await response.json();
        toast.error(result.message || "Failed to fetch bookmarked articles");
      }
    } catch (error) {
      console.error("Error fetching bookmarked articles:", error);
      toast.error("An error occurred while fetching bookmarked articles");
    }
  };
  
  
  const handleRemoveBookmark = async (article) => {
    try {
      const response = await fetch(`${window.location.origin}/auth/removeBookmark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          id: localStorage.getItem("userId"), // Ensure you're using _id here
          articleUrl: article.url,
        }),
      });
  
      if (response.ok) {
        setBookmarkedArticles((prevArticles) =>
          prevArticles.filter((a) => a.url !== article.url)
        );
        toast.success("Article unbookmarked successfully");
      } else {
        const result = await response.json();
        toast.error(result.message || "Failed to unbookmark the article");
      }
    } catch (error) {
      console.error("Error unbookmarking the article:", error);
      toast.error("An error occurred while unbookmarking the article");
    }
  };
  

  return (
    <div className="bookmark-cont">
      <h2 className="bookmark-head">
        Book<span>marks</span>
      </h2>
      <div className="bookmark-list">
        {bookmarkedArticles.length === 0 ? (
          <p>No bookmarks yet.</p>
        ) : (
          bookmarkedArticles.map((article, index) => (
            <div className="card" key={index}>
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
              <button
                className="remove-bookmark-btn"
                onClick={() => handleRemoveBookmark(article)}
              >
                Remove Bookmark
              </button>
            </div>
          ))
        )}
      </div>
      <ToastContainer />
    </div>
  );
}

export default Bookmark;
