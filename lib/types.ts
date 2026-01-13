export type MediaKind = 'film'|'series'|'cartoon';
export type Media = {
  id: string;
  title: string;
  year?: number;
  poster?: string | null;
  rating?: number | null;
  imdbRating?: number | null;
  type: MediaKind;
};
