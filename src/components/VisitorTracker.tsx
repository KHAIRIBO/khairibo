"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const trackVisit = async () => {
      // Don't track admin pages for visitor stats
      if (pathname.startsWith('/admin')) return;

      try {
        if (!supabase) return;
        await supabase
          .from('page_visits')
          .insert([{ page_path: pathname }]);
      } catch (error) {
        console.error('Error tracking visit:', error);
      }
    };

    trackVisit();
  }, [pathname]);

  return null;
}
