import "./Home.css";

const SkeletonCard = () => {
  return (
    <div className="card skeleton-card">
      <div className="skeleton-img" />
      <div className="skeleton-title" />
      <div className="skeleton-btn" />
    </div>
  );
};

export default SkeletonCard;
