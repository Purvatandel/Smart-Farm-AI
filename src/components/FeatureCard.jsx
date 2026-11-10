import {
  ChartNoAxesCombined,
  CloudSun,
  Coins,
  Layers3,
  MessageCircleMore,
  ScanLine,
  Sprout,
} from "lucide-react";
import { Link } from "react-router-dom";
import GlassCard from "./GlassCard.jsx";

const icons = {
  Sprout,
  Layers3,
  CloudSun,
  ScanLine,
  ChartNoAxesCombined,
  Coins,
  MessageCircleMore,
};

export default function FeatureCard({
  number,
  title,
  description,
  icon = "Sprout",
  to,
}) {
  const Icon = icons[icon] || Sprout;
  return (
    <Link className="feature-card-link" to={to} aria-label={title}>
      <GlassCard className="feature-card">
        <div className="feature-card-top">
          <span className="feature-number">{number}</span>
          <span className="feature-icon">
            <Icon size={22} strokeWidth={1.7} />
          </span>
        </div>
        <h3>{title}</h3>
        <p>{description}</p>
        <span className="feature-arrow" aria-hidden="true">
          ↗
        </span>
      </GlassCard>
    </Link>
  );
}
