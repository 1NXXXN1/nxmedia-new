/**
 * Favorites API using Supabase
 * Handles server-side favorites storage with authentication
 */

import { supabase, Favorite } from './supabase';

export async function getFavorites(): Promise<Favorite[]> {
  if (!supabase) return [];
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching favorites:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error in getFavorites:', err);
    return [];
  }
}

export async function addFavorite(favorite: Favorite): Promise<boolean> {
  if (!supabase) return false;
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not authenticated');
      return false;
    }

    const { error } = await supabase
      .from('favorites')
      .insert([{
        user_id: user.id,
        film_id: favorite.film_id,
        media_type: favorite.media_type,
        title: favorite.title,
        poster: favorite.poster,
        rating: favorite.rating,
        imdb_rating: favorite.imdb_rating,
        year: favorite.year,
        type: favorite.type,
      }]);

    if (error) {
      console.error('Error adding favorite:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error in addFavorite:', err);
    return false;
  }
}

export async function removeFavorite(filmId: string, mediaType: 'movie' | 'tv'): Promise<boolean> {
  if (!supabase) return false;
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not authenticated');
      return false;
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('film_id', filmId)
      .eq('media_type', mediaType);

    if (error) {
      console.error('Error removing favorite:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error in removeFavorite:', err);
    return false;
  }
}

export async function isFavorite(filmId: string, mediaType: 'movie' | 'tv'): Promise<boolean> {
  if (!supabase) return false;
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('film_id', filmId)
      .eq('media_type', mediaType)
      .maybeSingle(); // Use maybeSingle instead of single to avoid 406 error

    if (error) {
      console.error('Error checking favorite:', error);
      return false;
    }

    return !!data;
  } catch (err) {
    console.error('Error in isFavorite:', err);
    return false;
  }
}
