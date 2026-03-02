const BACKDROP_BASE = "https://image.tmdb.org/t/p/original";

export default function Hero({ movie }) {
  if (!movie) return null;

  const bgUrl = movie.backdrop_path
    ? `${BACKDROP_BASE}${movie.backdrop_path}`
    : null;

  return (
    <section className="hero">
      {bgUrl && (
        <div
          className="hero-bg"
          style={{ backgroundImage: `url(${bgUrl})` }}
        />
      )}
      <div className="hero-overlay" />
      <div className="hero-content">
        <h1 className="hero-title">{movie.title || movie.name}</h1>
        <div className="hero-meta">
          <span>{Math.round(movie.vote_average * 10)}% Match</span>{" "}
          <span> | Rating {movie.vote_average}</span>
        </div>
        <p className="hero-overview">{movie.overview}</p>
        <div className="hero-actions">
          <button className="hero-btn-primary">Play</button>
          <button className="hero-btn-secondary">My List</button>
        </div>
      </div>
    </section>
  );
}

