import React from "react";
import PropTypes from "prop-types";
import blackBookmark from "../assets/blackBookmark.png";
import blackFilledBookmark from "../assets/blackFilledBookmark.png";
import whiteBookmark from "../assets/whiteBookmark.png";
import whiteFilledBookmark from "../assets/whiteFilledBookmark.png";
import news_img from "../assets/default-news-img.webp";

const NewsCard = React.memo(
  ({ article, theme, bookmarked, onBookmark, onExpand, expanded, translated }) => {
    const bookmarkIcon =
      theme === "dark"
        ? bookmarked ? whiteFilledBookmark : whiteBookmark
        : bookmarked ? blackFilledBookmark : blackBookmark;

    return (
      <div className="card">
        <img
          src={bookmarkIcon}
          className="bookmark"
          onClick={() => onBookmark(article)}
          alt="bookmark"
        />

        <div className="expand-icon" onClick={() => onExpand(article)}>
          {expanded ? "✕" : "⤢"}
        </div>

        <img
          loading="lazy"
          src={article.image || news_img}
          className="news-img"
          alt="news"
        />

        <h2 className="head">
          {translated?.title || article.title}
        </h2>

        <button>
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            Read more
          </a>
        </button>
      </div>
    );
  }
);

NewsCard.displayName = "NewsCard";

NewsCard.propTypes = {
  theme: PropTypes.oneOf(["light", "dark"]).isRequired,
  article: PropTypes.object.isRequired,
  bookmarked: PropTypes.bool,
  onBookmark: PropTypes.func.isRequired,
  onExpand: PropTypes.func.isRequired,
  expanded: PropTypes.bool,
  translated: PropTypes.object,
};

export default NewsCard;
