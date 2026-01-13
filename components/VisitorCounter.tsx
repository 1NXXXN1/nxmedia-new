'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function VisitorCounter() {
  const [visitorCount, setVisitorCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function trackVisitor() {
      try {
        // Проверяем уникальность посетителя
        const visitorId = localStorage.getItem('nxmedia_visitor_id');
        
        if (!visitorId) {
          // Новый посетитель - генерируем ID
          const newId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('nxmedia_visitor_id', newId);
          
          if (supabase) {
            // Добавляем в базу данных
            const { error: insertError } = await supabase
              .from('visitors')
              .insert([
                { 
                  visitor_id: newId,
                  first_visit: new Date().toISOString(),
                  last_visit: new Date().toISOString()
                }
              ]);
            
            if (insertError) {
              console.error('Ошибка добавления посетителя:', insertError);
            }
          }
          
          // Обновляем локальный счетчик
          const currentCount = parseInt(localStorage.getItem('nxmedia_total_visitors') || '0');
          const newCount = currentCount + 1;
          localStorage.setItem('nxmedia_total_visitors', String(newCount));
        } else {
          // Обновляем last_visit для возвращающегося посетителя
          if (supabase) {
            const { error: updateError } = await supabase
              .from('visitors')
              .update({ last_visit: new Date().toISOString() })
              .eq('visitor_id', visitorId);
            
            if (updateError) {
              console.error('Ошибка обновления посетителя:', updateError);
            }
          }
        }

        // Получаем количество посетителей
        if (supabase) {
          const { count, error: countError } = await supabase
            .from('visitors')
            .select('*', { count: 'exact', head: true });
          
          if (!countError && count !== null) {
            setVisitorCount(count);
            setLoading(false);
            return;
          }
        }
        
        // Fallback: используем локальный счетчик
        const localCount = parseInt(localStorage.getItem('nxmedia_total_visitors') || '0');
        setVisitorCount(localCount);
        setLoading(false);
        
      } catch (error) {
        console.error('Ошибка отслеживания посетителя:', error);
        // Fallback на локальный счетчик
        const localCount = parseInt(localStorage.getItem('nxmedia_total_visitors') || '0');
        setVisitorCount(localCount);
        setLoading(false);
      }
    }

    trackVisitor();
  }, []);

  if (loading || visitorCount === null) return null;

  return (
    <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
      <span dangerouslySetInnerHTML={{ __html: `
        <!--LiveInternet counter-->
        <a href="//www.liveinternet.ru/click" target="_blank">
          <img src="//counter.yadro.ru/hit?t14.6;r${escape(document.referrer)};s${window.screen.width}*${window.screen.height}*${window.screen.colorDepth};u${escape(document.URL)};${Math.random()}" border="0" width="88" height="31" alt="LiveInternet" />
        </a>
        <!--/LiveInternet-->
      ` }} />
    </div>
  );
}
