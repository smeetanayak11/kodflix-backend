import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Row from "../components/Row";
import { fetchCategory } from "../services/tmdb";
import ErrorMessage from "../components/ErrorMessage";

export default function Dashboard() {
  const [heroMovie, setHeroMovie] = useState(null);
  const [rows, setRows] = useState({
    trending: { data: null, loading: true },
    popular: { data: null, loading: true },
    topRated: { data: null, loading: true },
    upcoming: { data: null, loading: true },
    action: { data: null, loading: true },
    comedy: { data: null, loading: true },
    tv: { data: null, loading: true }
  });
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [
          trending,
          popular,
          topRated,
          upcoming,
          action,
          comedy,
          tv
        ] = await Promise.all([
          fetchCategory("trending-movies"),
          fetchCategory("popular"),
          fetchCategory("top-rated"),
          fetchCategory("upcoming"),
          fetchCategory("action"),
          fetchCategory("comedy"),
          fetchCategory("trending-tv")
        ]);

        setRows({
          trending: { data: trending, loading: false },
          popular: { data: popular, loading: false },
          topRated: { data: topRated, loading: false },
          upcoming: { data: upcoming, loading: false },
          action: { data: action, loading: false },
          comedy: { data: comedy, loading: false },
          tv: { data: tv, loading: false }
        });

        setHeroMovie(trending.results?.[0]);
      } catch (err) {
        console.error(err);
        setError("Failed to load movies from KodFlix API.");
        setRows((prev) => {
          const keys = Object.keys(prev);
          const next = {};
          for (const k of keys) {
            next[k] = { ...prev[k], loading: false };
          }
          return next;
        });
      }
    }

    load();
  }, []);

  const filterBySearch = (items) => {
    if (!search.trim()) return items;
    const term = search.toLowerCase();
    return {
      ...items,
      results: items.results.filter((item) =>
        (item.title || item.name || "").toLowerCase().includes(term)
      )
    };
  };

  return (
    <div className="app-root">
      <Navbar onSearchChange={setSearch} />
      <Hero movie={heroMovie} />
      <div className="rows-wrapper">
        <ErrorMessage message={error} />
        <Row
          title="Trending Now"
          loading={rows.trending.loading}
          items={rows.trending.data && filterBySearch(rows.trending.data)}
        />
        <Row
          title="Popular"
          loading={rows.popular.loading}
          items={rows.popular.data && filterBySearch(rows.popular.data)}
        />
        <Row
          title="Top Rated"
          loading={rows.topRated.loading}
          items={rows.topRated.data && filterBySearch(rows.topRated.data)}
        />
        <Row
          title="Upcoming"
          loading={rows.upcoming.loading}
          items={rows.upcoming.data && filterBySearch(rows.upcoming.data)}
        />
        <Row
          title="Action Movies"
          loading={rows.action.loading}
          items={rows.action.data && filterBySearch(rows.action.data)}
        />
        <Row
          title="Comedy Movies"
          loading={rows.comedy.loading}
          items={rows.comedy.data && filterBySearch(rows.comedy.data)}
        />
        <Row
          title="TV Shows"
          loading={rows.tv.loading}
          items={rows.tv.data && filterBySearch(rows.tv.data)}
        />
      </div>
    </div>
  );
}

