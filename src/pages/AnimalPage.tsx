import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { animals, posts } from "@/data/mock";
import { PostCard } from "@/components/PostCard";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, Weight, DollarSign, MessageCircle } from "lucide-react";

export default function AnimalPage() {
  const { id } = useParams();
  const animal = animals.find((a) => a.id === id);

  if (!animal) {
    return (
      <Layout showDiscovery={false}>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-muted-foreground">Animal not found.</p>
          <Link to="/" className="mt-2 text-primary text-sm font-medium hover:underline">Back to feed</Link>
        </div>
      </Layout>
    );
  }

  const relatedPosts = posts.filter((p) =>
    p.tags.some((t) => animal.tags.some((at) => at.label === t.label))
  ).slice(0, 4);

  return (
    <Layout showDiscovery={false}>
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <div className="px-3 py-3 lg:px-0 lg:pt-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>

        {/* Photo gallery */}
        <div className="aspect-[4/5] lg:aspect-[3/2] overflow-hidden lg:rounded-lg bg-muted">
          <img src={animal.photos[0]} alt={animal.name} className="w-full h-full object-cover" />
        </div>

        {animal.photos.length > 1 && (
          <div className="flex gap-2 px-3 lg:px-0 mt-2 overflow-x-auto scrollbar-hide">
            {animal.photos.slice(1).map((photo, i) => (
              <div key={i} className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                <img src={photo} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="px-3 lg:px-0 pt-4 pb-8 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl text-foreground">{animal.name}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{animal.breed}</p>
            </div>
            {animal.price && (
              <span className="text-lg font-bold text-primary">{animal.price}</span>
            )}
          </div>

          {/* Status badge */}
          <Badge
            variant={animal.status === "For Sale" ? "default" : "secondary"}
            className={animal.status === "For Sale" ? "bg-primary text-primary-foreground" : ""}
          >
            {animal.status}
          </Badge>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 text-primary" />
              <span>DOB: {animal.dob}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Weight className="w-4 h-4 text-primary" />
              <span>{animal.weight}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{animal.breeder.location}</span>
            </div>
          </div>

          {/* Pedigree */}
          <div className="border border-border rounded-lg p-4 space-y-2">
            <h3 className="font-display text-sm text-foreground">Pedigree</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground text-xs">Sire</span>
                <p className="font-medium text-foreground">{animal.sire}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Dam</span>
                <p className="font-medium text-foreground">{animal.dam}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">{animal.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {animal.tags.map((tag) => (
              <Badge key={tag.label} variant="outline" className="text-xs">
                {tag.label}
              </Badge>
            ))}
          </div>

          {/* Breeder contact */}
          <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
            <span className="w-10 h-10 rounded-full bg-charcoal text-primary-foreground flex items-center justify-center text-lg">
              {animal.breeder.logo}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground">{animal.breeder.name}</p>
              <p className="text-xs text-muted-foreground">{animal.breeder.location}</p>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              <MessageCircle className="w-4 h-4" />
              Contact
            </button>
          </div>

          {/* Related posts */}
          {relatedPosts.length > 0 && (
            <div className="pt-4">
              <h3 className="font-display text-lg text-foreground mb-3">Related</h3>
              {relatedPosts.map((post, i) => (
                <PostCard key={post.id} post={post} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
