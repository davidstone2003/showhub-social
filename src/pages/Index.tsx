import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Feed } from "@/components/Feed";
import { LiveStrip } from "@/components/LiveStrip";
import { supabase } from "@/integrations/supabase/client";

interface Show {
  id: string;
  name: string;
}

const Index = () => {
  const [shows, setShows] = useState<Show[]>([]);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);

  useEffect(() => {
    async function fetchShows() {
      const { data } = await supabase
        .from("shows")
        .select("id, name")
        .order("name", { ascending: true });
      if (data && data.length > 0) {
        setShows(data);
        if (!selectedShow) setSelectedShow(data[0]);
      }
    }
    fetchShows();
  }, []);

  return (
    <Layout showDiscovery={false}>
      <div className="max-w-2xl mx-auto w-full">
        {/* Compact live strip */}
        <LiveStrip show={selectedShow} />
        {/* Main social feed */}
        <Feed />
      </div>
    </Layout>
  );
};

export default Index;
