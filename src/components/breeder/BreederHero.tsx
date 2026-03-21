import { User, MapPin, ExternalLink, Phone, Mail, MessageSquare, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BreederProfile {
  display_name: string | null;
  username: string;
  bio: string | null;
  tagline: string | null;
  logo_url: string | null;
  hero_image_url: string | null;
  location: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  website_url: string | null;
  phone: string | null;
  subscription_tier: string;
}

interface BreederHeroProps {
  profile: BreederProfile;
  tier: string;
  stats?: { winners: number; sires: number; posts: number };
}

export function BreederHero({ profile, tier, stats }: BreederHeroProps) {
  const name = profile.display_name || profile.username;
  const isFeatured = tier === "featured" || tier === "breeder_page";
  const hasContact = tier === "contacted" || isFeatured;
  const hasSocials = profile.facebook_url || profile.instagram_url || profile.website_url;

  return (
    <div className="bg-card border-b border-border">
      {/* Hero banner — only featured tiers */}
      {isFeatured && profile.hero_image_url ? (
        <div className="w-full h-40 sm:h-52 overflow-hidden">
          <img src={profile.hero_image_url} alt="" className="w-full h-full object-cover" />
        </div>
      ) : tier === "free" ? (
        <div className="w-full h-20 bg-muted" />
      ) : null}

      <div className="max-w-2xl mx-auto px-4 py-5">
        <div className="flex items-start gap-4">
          {profile.logo_url ? (
            <img
              src={profile.logo_url}
              alt={name}
              className="w-16 h-16 rounded-full object-cover border-2 border-border flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-7 h-7 text-primary" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground truncate">{name}</h1>
              {isFeatured && (
                <span className="shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-primary text-primary-foreground flex items-center gap-1">
                  <Award className="w-3 h-3" /> Featured
                </span>
              )}
            </div>

            {profile.tagline && isFeatured && (
              <p className="text-sm text-muted-foreground mt-0.5 italic">{profile.tagline}</p>
            )}

            {profile.location && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" /> {profile.location}
              </p>
            )}

            {profile.bio && (
              <p className={`text-sm text-muted-foreground mt-1.5 ${isFeatured ? "" : "line-clamp-2"}`}>
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* Contact row — only for contacted+ tiers */}
        {hasContact && (
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {profile.phone && (
              <>
                <Button variant="default" size="sm" asChild>
                  <a href={`tel:${profile.phone}`}><Phone className="w-3.5 h-3.5 mr-1" /> Call</a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={`sms:${profile.phone}`}><MessageSquare className="w-3.5 h-3.5 mr-1" /> Text</a>
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" asChild>
              <a href={`mailto:${profile.username}@example.com`}><Mail className="w-3.5 h-3.5 mr-1" /> Email</a>
            </Button>

            {hasSocials && (
              <div className="flex items-center gap-1.5">
                {profile.facebook_url && (
                  <a href={profile.facebook_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                  </a>
                )}
                {profile.instagram_url && (
                  <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                  </a>
                )}
                {profile.website_url && (
                  <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* Stats for featured tiers */}
        {isFeatured && stats && (
          <div className="flex gap-6 mt-4 text-sm">
            <span className="text-muted-foreground">
              <span className="font-bold text-foreground">{stats.winners}</span> wins
            </span>
            <span className="text-muted-foreground">
              <span className="font-bold text-foreground">{stats.sires}</span> sires
            </span>
            <span className="text-muted-foreground">
              <span className="font-bold text-foreground">{stats.posts}</span> posts
            </span>
          </div>
        )}
      </div>
    </div>
  );
}