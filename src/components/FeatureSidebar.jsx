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

const tools = [
  ["01", "Crop Recommendation", "/features/crop-recommendation", Sprout],
  ["02", "Soil Analysis", "/features/soil-analysis", Layers3],
  ["03", "Weather Insights", "/features/weather", CloudSun],
  ["04", "Crop Disease Detection", "/features/disease-detection", ScanLine],
  [
    "05",
    "Crop Growth Prediction",
    "/features/growth-prediction",
    ChartNoAxesCombined,
  ],
  ["06", "Cost & Profit Analysis", "/features/cost-profit", Coins],
  ["07", "AI Farm Assistant", "/features/ai-assistant", MessageCircleMore],
];

export default function FeatureSidebar({ active }) {
  return (
    <aside className="tool-rail">
      <span className="rail-label">FARM TOOLS</span>
      {tools.map(([number, label, to, Icon]) => (
        <Link
          className={`tool-link ${active === to.split("/").at(-1) ? "selected" : ""}`}
          to={to}
          key={number}
          aria-current={active === to.split("/").at(-1) ? "page" : undefined}
        >
          <span>{number}</span>
          <Icon size={17} />
          <b>{label}</b>
        </Link>
      ))}
      <div className="rail-note">
        <Sprout size={18} />
        <p>Better decisions grow from understanding your field.</p>
      </div>
    </aside>
  );
}
