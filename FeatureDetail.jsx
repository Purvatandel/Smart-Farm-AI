import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import FeatureSidebar from "../components/FeatureSidebar.jsx";
import FeatureTools from "./FeatureTools.jsx";

const details = {
  "soil-analysis": {
    title: "Soil Analysis",
    description:
      "Understand your soil's nutrient balance and pH to make more informed decisions before planting.",
  },
  weather: {
    title: "Weather Insights",
    description:
      "Use local weather conditions to plan irrigation, field work and crop protection.",
  },
  "disease-detection": {
    title: "Crop Disease Detection",
    description:
      "Prepare to check crop leaf images for possible diseases and review suggested next steps.",
  },
  "growth-prediction": {
    title: "Crop Growth Prediction",
    description:
      "Explore crop growth and estimated yield using farm conditions and model data.",
  },
  "cost-profit": {
    title: "Cost & Profit Analysis",
    description:
      "Compare farming inputs, expected yield and potential revenue in one place.",
  },
  "ai-assistant": {
    title: "AI Farm Assistant",
    description:
      "Make farming information easier to explore with a conversational assistant built for your questions.",
  },
};

export default function FeatureDetail({ feature: routeFeature }) {
  const { feature: parameterFeature } = useParams();
  const feature = routeFeature || parameterFeature;
  const detail = details[feature];

  if (!detail) {
    return (
      <main className="features-page scenic-page">
        <div className="page-width features-content">
          <div className="page-intro">
            <h1>Feature not found</h1>
            <Link className="button button-outline" to="/features">
              <ArrowLeft size={16} /> Back to Features
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="crop-page scenic-page">
      <div className="page-width crop-layout">
        <FeatureSidebar active={feature} />
        <section className="crop-main">
          <div className="crop-heading">
            <span className="eyebrow">
              <span className="eyebrow-dot" /> SMART FARMING TOOL
            </span>
            <h1>{detail.title}</h1>
            <p>{detail.description}</p>
            <Link className="text-button" to="/features">
              <ArrowLeft size={15} /> Back to Features
            </Link>
          </div>
          <FeatureTools feature={feature} />
        </section>
      </div>
    </main>
  );
}
