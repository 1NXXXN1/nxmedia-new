/**
 * Favorites Sync System
 * LocalStorage da darhol saqlanadi, keyin background da Supabase ga sync bo'ladi
 */

import { supabase } from './supabase';
import { FAVORITES_KEY } from './constants';

const SYNC_QUEUE_KEY = 'favorites_sync_queue';
const SYNC_DELAY = 3000; // 3 soniya kutib sync qiladi

let syncTimeout: NodeJS.Timeout | null = null;

interface SyncOperation {
  action: 'add' | 'remove';
  filmId: string;
  mediaType: 'movie' | 'tv';
  data?: any;
  timestamp: number;
}

// LocalStorage dan favoritlarni olish
export function getLocalFavorites(): any[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const saved = localStorage.getItem(FAVORITES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Error reading favorites:', e);
    return [];
  }
}

// LocalStorage ga favorit qo'shish
export function addLocalFavorite(favorite: any): void {
  const favorites = getLocalFavorites();
  
  // Agar mavjud bo'lmasa, qo'shamiz
  const exists = favorites.some(
    (f: any) => String(f.id) === String(favorite.id) && 
    (f.mediaType === favorite.mediaType || !f.mediaType)
  );
  
  if (!exists) {
    favorites.push(favorite);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    
    // Custom event yuboramiz
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('favoritesChanged'));
    }
  }
  
  // Sync queue ga qo'shamiz
  queueSync('add', String(favorite.id), favorite.mediaType, favorite);
}

// LocalStorage dan favorit o'chirish
export function removeLocalFavorite(filmId: string, mediaType: 'movie' | 'tv'): void {
  const favorites = getLocalFavorites();
  const filtered = favorites.filter(
    (f: any) => !(String(f.id) === String(filmId) && 
    (f.mediaType === mediaType || !f.mediaType))
  );
  
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
  
  // Custom event yuboramiz
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('favoritesChanged'));
  }
  
  // Sync queue ga qo'shamiz
  queueSync('remove', filmId, mediaType);
}

// LocalStorage da favorite bormi tekshirish
export function isLocalFavorite(filmId: string, mediaType: 'movie' | 'tv'): boolean {
  const favorites = getLocalFavorites();
  return favorites.some(
    (f: any) => String(f.id) === String(filmId) && 
    (f.mediaType === mediaType || !f.mediaType)
  );
}

// Sync queue ga operatsiya qo'shish
function queueSync(
  action: 'add' | 'remove',
  filmId: string,
  mediaType: 'movie' | 'tv',
  data?: any
): void {
  if (typeof window === 'undefined') return;
  
  try {
    const queue = getSyncQueue();
    
    // Agar bir xil film uchun operatsiya bo'lsa, yangisini qo'yamiz
    const filtered = queue.filter(
      op => !(op.filmId === filmId && op.mediaType === mediaType)
    );
    
    filtered.push({
      action,
      filmId,
      mediaType,
      data,
      timestamp: Date.now()
    });
    
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(filtered));
    
    // Debounced sync
    scheduleSync();
  } catch (e) {
    console.error('Error queuing sync:', e);
  }
}

// Sync queue dan operatsiyalarni olish
function getSyncQueue(): SyncOperation[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const saved = localStorage.getItem(SYNC_QUEUE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Error reading sync queue:', e);
    return [];
  }
}

// Sync ni rejalashtirish
function scheduleSync(): void {
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }
  
  syncTimeout = setTimeout(() => {
    syncToSupabase();
  }, SYNC_DELAY);
}

// Supabase ga sync qilish
export async function syncToSupabase(): Promise<void> {
  if (!supabase || typeof window === 'undefined') return;
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // User yo'q bo'lsa, sync qilmaymiz
      return;
    }
    
    const queue = getSyncQueue();
    
    if (queue.length === 0) {
      return;
    }
    
    console.log(`[Sync] Starting sync of ${queue.length} operations...`);
    
    for (const operation of queue) {
      try {
        if (operation.action === 'add') {
          // Add to Supabase
          const { error } = await supabase
            .from('favorites')
            .upsert([{
              user_id: user.id,
              film_id: operation.filmId,
              media_type: operation.mediaType,
              title: operation.data.title || '',
              poster: operation.data.poster,
              rating: operation.data.rating,
              imdb_rating: operation.data.imdbRating,
              year: operation.data.year,
              type: operation.data.type || 'film'
            }], {
              onConflict: 'user_id,film_id,media_type'
            });
          
          if (error) {
            console.error('[Sync] Error adding favorite:', error);
          }
        } else if (operation.action === 'remove') {
          // Remove from Supabase
          const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('user_id', user.id)
            .eq('film_id', operation.filmId)
            .eq('media_type', operation.mediaType);
          
          if (error) {
            console.error('[Sync] Error removing favorite:', error);
          }
        }
      } catch (err) {
        console.error('[Sync] Error processing operation:', err);
      }
    }
    
    // Queue ni tozalaymiz
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify([]));
    console.log('[Sync] Sync completed successfully');
    
    // Sync muvaffaqiyatli bo'lgandan keyin queue ni tozalaymiz
    localStorage.removeItem(SYNC_QUEUE_KEY);
    console.log('[Sync] Cleared sync queue from localStorage');
  } catch (err) {
    console.error('[Sync] Sync failed:', err);
  }
}

// Supabase dan localStorage ga load qilish
export async function loadFromSupabase(): Promise<void> {
  if (!supabase || typeof window === 'undefined') return;
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // User yo'q bo'lsa, localStorage ni tozalaymiz
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([]));
      localStorage.removeItem(SYNC_QUEUE_KEY);
      console.log('[Sync] Cleared localStorage (no user)');
      
      // Custom event yuboramiz
      window.dispatchEvent(new CustomEvent('favoritesChanged'));
      return;
    }
    
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('[Sync] Error loading from Supabase:', error);
      return;
    }
    
    // Supabase formatidan localStorage formatiga o'tkazamiz
    const favorites = (data || []).map(fav => ({
      id: fav.film_id,
      mediaType: fav.media_type,
      title: fav.title,
      poster: fav.poster,
      rating: fav.rating,
      imdbRating: fav.imdb_rating,
      year: fav.year,
      type: fav.type
    }));
    
    // localStorage ni tozalab, Supabase dan yuklaymiz
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    localStorage.removeItem(SYNC_QUEUE_KEY); // Har qanday kutilayotgan sync ni tozalaymiz
    console.log(`[Sync] Cleared and loaded ${favorites.length} favorites from Supabase`);
    
    // Custom event yuboramiz
    window.dispatchEvent(new CustomEvent('favoritesChanged'));
  } catch (err) {
    console.error('[Sync] Failed to load from Supabase:', err);
  }
}

// Page unload da sync qilish
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (syncTimeout) {
      clearTimeout(syncTimeout);
      // Darhol sync qilamiz
      syncToSupabase();
    }
  });
  
  // Page visibility change da sync qilish
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && syncTimeout) {
      clearTimeout(syncTimeout);
      syncToSupabase();
    }
  });
}
