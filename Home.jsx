import {
  ArrowDown,
  ArrowRight,
  CloudSun,
  Leaf,
  LineChart,
  Sprout,
  Waves,
} from "lucide-react";
import { Link } from "react-router-dom";
import FeatureCard from "../components/FeatureCard.jsx";

const benefits = [
  {
    icon: Sprout,
    title: "Better Crop Yield",
    text: "Make every growing decision count.",
  },
  {
    icon: LineChart,
    title: "Data Driven Insights",
    text: "Turn field data into clear next steps.",
  },
  {
    icon: Waves,
    title: "Sustainable Farming",
    text: "Grow more while caring for your soil.",
  },
  {
    icon: Leaf,
    title: "For Every Farmer",
    text: "Practical intelligence for every field.",
  },
];

export default function Home() {
  return (
    <main>
      <section className="hero hero-photo">
        <div className="hero-shade" />
        <div className="hero-content page-width">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="eyebrow-dot" /> GROW WITH GOOD DATA
            </span>
            <h1>
              Smart Farming for a <em>Brighter Tomorrow</em>
            </h1>
            <p>
              Use data and AI to get better crop recommendations, understand
              your soil, and make informed farming decisions for a healthier and
              more productive future.
            </p>
            <div className="hero-actions">
              <Link className="button" to="/signup">
                Get Started <ArrowRight size={17} />
              </Link>
              <a className="text-button" href="#how-it-works">
                Learn More <ArrowDown size={15} />
              </a>
            </div>
          </div>
          <div className="hero-float float-one">
            <span className="float-icon">
              <Sprout size={19} />
            </span>
            <span>
              <strong>AI Crop Recommendation</strong>
              <small>Field-ready insights</small>
            </span>
            <span className="float-check">✓</span>
          </div>
          <div className="hero-float float-two">
            <span className="float-icon">
              <CloudSun size={19} />
            </span>
            <span>
              <strong>Real-time Weather</strong>
              <small>Plan with confidence</small>
            </span>
          </div>
          <div className="hero-float float-three">
            <span className="float-icon">
              <Waves size={19} />
            </span>
            <span>
              <strong>Soil Analysis</strong>
              <small>Know what your soil needs</small>
            </span>
          </div>
          <div className="hero-yield">
            <span className="yield-mark">
              <LineChart size={17} />
            </span>
            <span>
              <strong>Higher yield</strong>
              <small>Better decisions</small>
            </span>
          </div>
          <div className="hero-caption">
            <span>01 / 04</span>
            <span className="caption-line" />
            <span>FIELDS OF POSSIBILITY</span>
          </div>
        </div>
      </section>
      <section
        className="benefit-band page-width"
        aria-label="Smart farming benefits"
      >
        {benefits.map(({ icon: Icon, title, text }) => (
          <article className="benefit-item" key={title}>
            <span className="benefit-icon">
              <Icon size={20} />
            </span>
            <div>
              <h2>{title}</h2>
              <p>{text}</p>
            </div>
          </article>
        ))}
      </section>
      <section className="section-wrap page-width" id="features">
        <div className="section-heading">
          <div>
            <span className="eyebrow dark-eyebrow">A SMARTER WAY TO FARM</span>
            <h2>
              Tools built around <em>your field</em>
            </h2>
          </div>
          <Link to="/features" className="under-link">
            Explore all features <ArrowRight size={16} />
          </Link>
        </div>
        <div className="home-feature-grid">
          <FeatureCard
            number="01"
            title="Crop Recommendation"
            description="Find crops suited to your soil, season and local conditions."
            icon="Sprout"
            to="/features/crop-recommendation"
          />
          <FeatureCard
            number="02"
            title="Soil Analysis"
            description="Understand nutrients and pH before you put seed in the ground."
            icon="Layers3"
            to="/features/soil-analysis"
          />
          <FeatureCard
            number="03"
            title="Weather Insights"
            description="See changing conditions and plan the work ahead."
            icon="CloudSun"
            to="/features/weather"
          />
        </div>
      </section>
      <section className="process-section" id="how-it-works">
        <div className="page-width process-inner">
          <div className="process-intro">
            <span className="eyebrow">FROM FIELD DATA TO FIELD DECISIONS</span>
            <h2>
              Good decisions start with <em>knowing your land.</em>
            </h2>
            <p>
              Simple tools. Useful answers. A clearer picture of what your farm
              needs next.
            </p>
            <Link
              className="button button-outline"
              to="/features/crop-recommendation"
            >
              Try crop recommendation <ArrowRight size={16} />
            </Link>
          </div>
          <div className="process-steps">
            <article>
              <span>01</span>
              <div>
                <h3>Tell us about your field</h3>
                <p>Add soil, weather and crop details in a few simple steps.</p>
              </div>
            </article>
            <article>
              <span>02</span>
              <div>
                <h3>Get practical insights</h3>
                <p>
                  AI-supported recommendations turn your numbers into options.
                </p>
              </div>
            </article>
            <article>
              <span>03</span>
              <div>
                <h3>Choose what works for you</h3>
                <p>
                  Use clear information to plan a healthier, more productive
                  season.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>
      <section className="closing-section page-width" id="about">
        <div>
          <span className="eyebrow dark-eyebrow">
            DATA TODAY • BETTER TOMORROW
          </span>
          <h2>
            Technology with its feet <em>in the soil.</em>
          </h2>
          <p>
            Smart Farm AI brings useful agricultural data closer to the people
            who grow our food. Designed to make informed choices easier, one
            field at a time.
          </p>
        </div>
        <a className="button" href="mailto:hello@smartfarmai.in" id="contact">
          Talk to our team <ArrowRight size={16} />
        </a>
      </section>
    </main>
  );
}
