import Link from "next/link";
import Image from "next/image";
import { Clock, Star } from "lucide-react";
import type { Restaurant } from "@/shared/types";
import { formatDistance, formatRating } from "@/shared/lib/money";

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Link href={`/restaurante/${restaurant.slug}`} className="r-card" style={{ textDecoration: "none", color: "inherit" }}>
      <div className="cover" style={{ position: "relative", filter: restaurant.isOpen ? undefined : "saturate(0.5)" }}>
        <Image src={restaurant.coverUrl} alt="" fill sizes="(max-width: 1200px) 33vw, 380px" style={{ objectFit: "cover" }} />
        {!restaurant.isOpen && (
          <span className="promo-badge">Fechado agora</span>
        )}
      </div>
      <div className="body">
        <div className="row">
          <div className="name">{restaurant.name}</div>
          <div className="rating">
            <Star size={11} color="var(--folha-600)" /> {formatRating(restaurant.rating)}
          </div>
        </div>
        <div className="tags">{restaurant.tags}</div>
        <div className="meta">
          <span>
            <Clock size={12} /> {restaurant.prepTimeMinutes} min
          </span>
          <span className="dot">·</span>
          <span>{formatDistance(restaurant.distanceMeters)}</span>
          <span className="dot">·</span>
          <span className="free">Retirada grátis</span>
        </div>
      </div>
    </Link>
  );
}
