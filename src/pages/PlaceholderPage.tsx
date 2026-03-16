import { Layout } from "@/components/Layout";
import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

const PlaceholderPage = ({ title, description }: PlaceholderPageProps) => (
  <Layout showDiscovery={false}>
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <Construction className="w-12 h-12 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-display text-foreground mb-2">{title}</h1>
      <p className="text-muted-foreground max-w-md">{description}</p>
    </div>
  </Layout>
);

export const WinnersPage = () => <PlaceholderPage title="Winners" description="Browse champion lambs from shows across the country." />;
export const MarketPage = () => <PlaceholderPage title="Market" description="Find show lambs, breeding stock, and equipment for sale." />;
export const HaulersPage = () => <PlaceholderPage title="Haulers" description="Connect with livestock haulers in your area." />;
export const SubmitPage = () => <PlaceholderPage title="New Post" description="Share your latest lambs with the ShowHub community. Coming soon." />;
