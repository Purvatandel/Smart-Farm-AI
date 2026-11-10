import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import FeatureCard from "../components/FeatureCard.jsx";

const tools = [
  [
    "01",
    "Crop Recommendation",
    "Get the most suitable crops based on soil and weather data.",
    "Sprout",
    "/features/crop-recommendation",
  ],
  [
    "02",
    "Soil Analysis",
    "Analyze N, P, K, pH and other soil nutrients for better farming decisions.",
    "Layers3",
    "/features/soil-analysis",
  ],
  [
    "03",
    "Weather Insights",
    "Get real-time weather information to plan farming activities.",
    "CloudSun",
    "/features/weather",
  ],
  [
    "04",
    "Crop Disease Detection",
    "Upload leaf images to detect possible diseases and get suggestions.",
    "ScanLine",
    "/features/disease-detection",
  ],
  [
    "05",
    "Crop Growth Prediction",
    "Predict crop growth and estimate yield using AI.",
    "ChartNoAxesCombined",
    "/features/growth-prediction",
  ],
  [
    "06",
    "Cost & Profit Analysis",
    "Estimate input costs, expected yield and potential profit.",
    "Coins",
    "/features/cost-profit",
  ],
  [
    "07",
    "AI Farm Assistant",
    "Ask questions and get easy-to-understand answers about farming.",
    "MessageCircleMore",
    "/features/ai-assistant",
  ],
];

export default function Features() {
  return (
    <main className="features-page scenic-page">
      <div className="page-width features-content">
        <div className="page-intro">
          <span className="eyebrow">
            <span className="eyebrow-dot" /> FIELD TO FORECAST
          </span>
          <h1>
            Smart Farming for a <em>Brighter Tomorrow</em>
          </h1>
          <p>
            Explore our AI-powered tools to get better crop recommendations,
            analyze your soil, check weather, detect diseases and make informed
            farming decisions.
          </p>
          <Link className="text-button" to="/crop-recommendation">
            Start with your soil data <ArrowRight size={16} />
          </Link>
        </div>
        <div className="feature-list-grid">
          {tools.map(([number, title, description, icon, to]) => (
            <FeatureCard
              key={number}
              number={number}
              title={title}
              description={description}
                icon={icon}
                to={to}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
