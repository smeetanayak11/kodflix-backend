import MovieCard from "./MovieCard";

export default function Row({ title, items, loading }) {
  return (
    <section className="row">
      <h2 className="row-title">{title}</h2>
      {loading ? (
        <div className="skeleton-row">
          {Array.from({ length: 7 }).map((_, idx) => (
            <div key={idx} className="skeleton-card" />
          ))}
        </div>
      ) : (
        <div className="row-scroll">
          {items?.results?.map((item) => (
            <MovieCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}

