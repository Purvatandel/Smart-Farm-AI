import { useState } from "react";
import { ArrowRight, ArrowLeft, Leaf, Sprout } from "lucide-react";
import { Link } from "react-router-dom";
import FeatureSidebar from "../components/FeatureSidebar.jsx";
import GlassCard from "../components/GlassCard.jsx";
import {
  modelEndpoints,
  modelErrorMessage,
  postModelRequest,
} from "../services/modelApi.js";
const initialValues = {
  nitrogen: "",
  phosphorus: "",
  potassium: "",
  ph: "",
  soil: "",
  temperature: "",
  humidity: "",
  rainfall: "",
};

export default function CropRecommendation() {
  const [values, setValues] = useState(initialValues);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const update = (event) =>
    setValues({ ...values, [event.target.name]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setResults([]);

    try {
      const data = await postModelRequest(modelEndpoints.crop, {
        nitrogen: Number(values.nitrogen),
        phosphorus: Number(values.phosphorus),
        potassium: Number(values.potassium),
        ph: Number(values.ph),
        soilType: values.soil,
        temperature: Number(values.temperature),
        humidity: Number(values.humidity),
        rainfall: Number(values.rainfall),
      });
      const recommendations = Array.isArray(data.recommendations)
        ? data.recommendations
        : data.crop || data.prediction || data.label
          ? [data]
          : [];
      const normalized = recommendations
        .map((item) => {
          const recommendation =
            typeof item === "string" ? { crop: item } : item;
          const name =
            recommendation.crop ||
            recommendation.name ||
            recommendation.label ||
            recommendation.prediction;
          const rawScore =
            recommendation.suitability ??
            recommendation.confidence ??
            recommendation.score;
          const numericScore = Number(rawScore);
          const suitability =
            rawScore == null || !Number.isFinite(numericScore)
              ? null
              : Math.max(
                  0,
                  Math.min(
                    100,
                    Math.round(
                      numericScore <= 1 ? numericScore * 100 : numericScore,
                    ),
                  ),
                );
          return name ? { name: String(name), suitability } : null;
        })
        .filter(Boolean);

      if (!normalized.length) {
        setError("The crop model responded without any crop recommendations.");
      } else {
        setResults(normalized);
        setMessage("Results returned by your configured crop model.");
      }
    } catch (requestError) {
      setError(modelErrorMessage(requestError, "Crop recommendation"));
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="crop-page scenic-page">
      <div className="page-width crop-layout">
        <FeatureSidebar active="crop-recommendation" />
        <section className="crop-main">
          <div className="crop-heading">
            <span className="eyebrow">
              <span className="eyebrow-dot" /> PERSONALIZED FIELD INSIGHTS
            </span>
            <h1>
              Crop <em>Recommendation</em>
            </h1>
            <p>
              Share a few details about your farm to explore crops that may fit
              your growing conditions.
            </p>
            <Link className="text-button" to="/features">
              <ArrowLeft size={15} /> Back to Features
            </Link>
          </div>
          <div className="crop-columns">
            <GlassCard className="farm-form-card">
              <div className="form-heading">
                <span className="form-icon">
                  <Sprout size={19} />
                </span>
                <div>
                  <h2>Enter Your Farm Details</h2>
                  <p>Values help tailor your crop suggestions.</p>
                </div>
              </div>
              <form onSubmit={submit}>
                <div className="farm-input-grid">
                  <label>
                    Nitrogen (N)
                    <input
                      name="nitrogen"
                      type="number"
                      min="0"
                      step="any"
                      placeholder="e.g. 90"
                      value={values.nitrogen}
                      onChange={update}
                      required
                    />
                  </label>
                  <label>
                    Phosphorus (P)
                    <input
                      name="phosphorus"
                      type="number"
                      min="0"
                      step="any"
                      placeholder="e.g. 42"
                      value={values.phosphorus}
                      onChange={update}
                      required
                    />
                  </label>
                  <label>
                    Potassium (K)
                    <input
                      name="potassium"
                      type="number"
                      min="0"
                      step="any"
                      placeholder="e.g. 43"
                      value={values.potassium}
                      onChange={update}
                      required
                    />
                  </label>
                  <label>
                    Soil pH
                    <input
                      name="ph"
                      type="number"
                      min="0"
                      max="14"
                      step="0.1"
                      placeholder="e.g. 6.5"
                      value={values.ph}
                      onChange={update}
                      required
                    />
                  </label>
                  <label>
                    Soil Type
                    <select
                      name="soil"
                      value={values.soil}
                      onChange={update}
                      required
                    >
                      <option value="" disabled>
                        Select soil type
                      </option>
                      <option>Alluvial</option>
                      <option>Black</option>
                      <option>Red</option>
                      <option>Laterite</option>
                      <option>Sandy</option>
                      <option>Clay</option>
                    </select>
                  </label>
                  <label>
                    Temperature (°C)
                    <input
                      name="temperature"
                      type="number"
                      step="any"
                      placeholder="e.g. 25"
                      value={values.temperature}
                      onChange={update}
                      required
                    />
                  </label>
                  <label>
                    Humidity (%)
                    <input
                      name="humidity"
                      type="number"
                      min="0"
                      max="100"
                      step="any"
                      placeholder="e.g. 75"
                      value={values.humidity}
                      onChange={update}
                      required
                    />
                  </label>
                  <label>
                    Rainfall (mm)
                    <input
                      name="rainfall"
                      type="number"
                      min="0"
                      step="any"
                      placeholder="e.g. 120"
                      value={values.rainfall}
                      onChange={update}
                      required
                    />
                  </label>
                </div>
                <button
                  className="button form-submit"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    "Requesting model prediction…"
                  ) : (
                    <>
                      Get Crop Recommendation <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>
            </GlassCard>
            <GlassCard className="recommendation-card">
              <div className="recommendation-heading">
                <span className="form-icon">
                  <Leaf size={19} />
                </span>
                <div>
                  <h2>Top Crop Recommendations</h2>
                  <p>Results appear only after a successful model response.</p>
                </div>
              </div>
              {results.length > 0 ? (
                <div className="results-list">
                  {results.map(({ name, suitability }, index) => (
                    <article className="result-item" key={name}>
                      <div className="result-top">
                        <span className="result-number">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <strong>{name}</strong>
                        {suitability != null && (
                          <b>
                            Suitability <em>{suitability}%</em>
                          </b>
                        )}
                      </div>
                      {suitability != null && (
                        <div className="progress-track">
                          <span style={{ width: `${suitability}%` }} />
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <p
                  className={`empty-results ${error ? "is-error" : ""}`}
                  role="status"
                >
                  {error ||
                    "No crop prediction yet. Submit farm details to request a result from your configured model."}
                </p>
              )}
              {message && !error && (
                <p className="model-note" role="status">
                  {message}
                </p>
              )}
            </GlassCard>
          </div>
        </section>
      </div>
    </main>
  );
}
