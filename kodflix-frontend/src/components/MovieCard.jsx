const POSTER_BASE = "https://image.tmdb.org/t/p/w500";

export default function MovieCard({ item }) {
  if (!item?.poster_path) return null;

  const img = `${POSTER_BASE}${item.poster_path}`;

  return (
    <div className="movie-card">
      <img src={img} alt={item.title || item.name} loading="lazy" />
    </div>
  );
}

