import api from "./api";

export async function fetchCategory(path) {
  const { data } = await api.get(`/tmdb/${path}`);
  return data;
}

