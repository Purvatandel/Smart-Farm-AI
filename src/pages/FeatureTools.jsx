import { useEffect, useState } from "react";
import {
  ArrowRight,
  Cloud,
  CloudLightning,
  CloudRain,
  CloudSun,
  Coins,
  Layers3,
  MessageCircleMore,
  ScanLine,
  Sprout,
  Sun,
} from "lucide-react";
import GlassCard from "../components/GlassCard.jsx";
import {
  modelEndpoints,
  modelErrorMessage,
  postModelRequest,
} from "../services/modelApi.js";

function NumberField({
  label,
  name,
  value,
  onChange,
  min = 0,
  max,
  step = "any",
  placeholder = "Enter a value",
}) {
  return (
    <label>
      {label}
      <input
        name={name}
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        required
      />
    </label>
  );
}

function CropField({ value, onChange }) {
  return (
    <label>
      Crop
      <select name="crop" value={value} onChange={onChange} required>
        <option value="" disabled>
          Select a crop
        </option>
        {["Rice", "Maize", "Wheat", "Soybean", "Cotton", "Millet", "Other"].map(
          (crop) => (
            <option key={crop}>{crop}</option>
          ),
        )}
      </select>
    </label>
  );
}

function ResultPanel({ icon: Icon, title, children }) {
  return (
    <GlassCard className="recommendation-card">
      <div className="recommendation-heading">
        <span className="form-icon">
          <Icon size={19} />
        </span>
        <div>
          <h2>{title}</h2>
        </div>
      </div>
      {children}
    </GlassCard>
  );
}

function ToolStatus({ children, error = false }) {
  return (
    <p className={`tool-status ${error ? "is-error" : ""}`} role="status">
      {children}
    </p>
  );
}

function SoilAnalysis() {
  const [values, setValues] = useState({
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    ph: "",
    soilType: "",
  });
  const [result, setResult] = useState(null);
  const update = (event) =>
    setValues((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));

  const analyze = (event) => {
    event.preventDefault();
    const ph = Number(values.ph);
    let condition = "pH within common crop range";
    let advice =
      "Keep a regular soil-testing schedule and compare nutrient values with a local laboratory report.";

    if (ph < 5.5) {
      condition = "Acidic pH reading";
      advice =
        "Confirm the reading with a soil laboratory. Ask a local agronomist whether a pH amendment is appropriate before applying one.";
    } else if (ph > 7.5) {
      condition = "Alkaline pH reading";
      advice =
        "Confirm the reading with a soil laboratory and check nutrient availability before selecting amendments.";
    }

    setResult({ condition, advice, values });
  };

  return (
    <div className="crop-columns tool-columns">
      <GlassCard className="farm-form-card">
        <div className="form-heading">
          <span className="form-icon">
            <Layers3 size={19} />
          </span>
          <div>
            <h2>Enter Soil Values</h2>
            <p>Use values from a recent soil test.</p>
          </div>
        </div>
        <form onSubmit={analyze}>
          <div className="farm-input-grid">
            <NumberField
              label="Nitrogen (N)"
              name="nitrogen"
              value={values.nitrogen}
              onChange={update}
            />
            <NumberField
              label="Phosphorus (P)"
              name="phosphorus"
              value={values.phosphorus}
              onChange={update}
            />
            <NumberField
              label="Potassium (K)"
              name="potassium"
              value={values.potassium}
              onChange={update}
            />
            <NumberField
              label="Soil pH"
              name="ph"
              min="0"
              max="14"
              step="0.1"
              value={values.ph}
              onChange={update}
            />
            <label>
              Soil Type
              <select
                name="soilType"
                value={values.soilType}
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
          </div>
          <button className="button form-submit" type="submit">
            Analyze Soil <ArrowRight size={16} />
          </button>
        </form>
      </GlassCard>
      <ResultPanel icon={Layers3} title="Soil Condition">
        {result ? (
          <div className="tool-result-content">
            <strong className="result-condition">{result.condition}</strong>
            <p>Soil type: {result.values.soilType}</p>
            <p>
              N {result.values.nitrogen} · P {result.values.phosphorus} · K{" "}
              {result.values.potassium} · pH {result.values.ph}
            </p>
            <p>{result.advice}</p>
            <ToolStatus>
              Basic pH screening only; this is not a laboratory diagnosis.
            </ToolStatus>
          </div>
        ) : (
          <ToolStatus>
            Enter your soil test values to review the pH screening and
            recommendations.
          </ToolStatus>
        )}
      </ResultPanel>
    </div>
  );
}

function getWeatherIcon(condition = "") {
  const cond = condition.toLowerCase();
  if (cond.includes("thunder") || cond.includes("lightning")) {
    return <CloudLightning size={22} color="#facc15" />;
  }
  if (cond.includes("rain") || cond.includes("drizzle") || cond.includes("shower")) {
    return <CloudRain size={22} color="#60a5fa" />;
  }
  if (cond.includes("cloud") || cond.includes("overcast") || cond.includes("fog")) {
    return <Cloud size={22} color="#94a3b8" />;
  }
  return <Sun size={22} color="#fbbf24" />;
}

function WeatherInsights() {
  const [location, setLocation] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    const query = location.trim();
    if (!query) return;

    setLoading(true);
    setError("");
    setWeather(null);

    try {
      const endpoint =
        modelEndpoints.weather || "http://127.0.0.1:5000/api/weather";
      const separator = endpoint.includes("?") ? "&" : "?";
      const cacheBustedUrl = `${endpoint}${separator}location=${encodeURIComponent(query)}&_t=${Date.now()}`;

      const response = await fetch(cacheBustedUrl, {
        method: "GET",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });

      const data = await response.json();

      if (
        !response.ok ||
        data.status === "error" ||
        data.temperature === undefined ||
        data.temperature === null
      ) {
        throw new Error(
          data.error ||
            "Unable to fetch live weather. Please check the location and try again.",
        );
      }

      setWeather(data);
    } catch {
      setError(
        "Unable to fetch live weather. Please check the location and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="crop-columns tool-columns">
        <GlassCard className="farm-form-card">
          <div className="form-heading">
            <span className="form-icon">
              <CloudSun size={19} />
            </span>
            <div>
              <h2>Enter Location</h2>
              <p>Fetch real-time weather and 7-day agronomic forecast.</p>
            </div>
          </div>
          <form onSubmit={submit}>
            <div className="farm-input-grid">
              <label>
                City or District
                <input
                  name="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Mumbai, Pune, Nashik, Delhi"
                  required
                />
              </label>
            </div>
            <button className="button form-submit" type="submit" disabled={loading}>
              {loading ? (
                "Fetching live weather…"
              ) : (
                <>
                  Get Weather <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </GlassCard>
        <ResultPanel icon={CloudSun} title="Current Weather & Advisory">
          {loading ? (
            <ToolStatus>Fetching live weather and 7-day forecast from Open-Meteo…</ToolStatus>
          ) : error ? (
            <ToolStatus error={true}>{error}</ToolStatus>
          ) : weather ? (
            <div className="tool-result-content">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  flexWrap: "wrap",
                  gap: "6px",
                  marginBottom: "6px",
                }}
              >
                <strong className="result-condition">{weather.location}</strong>
                <span style={{ fontSize: "11px", color: "#8fa38c" }}>
                  ● Live · Last updated: {weather.updated_at || "Just now"}
                </span>
              </div>
              <div className="weather-metrics">
                <span>
                  <b>{weather.temperature}°C</b>
                  <small>Current Temp</small>
                </span>
                <span>
                  <b>{weather.humidity}%</b>
                  <small>Humidity</small>
                </span>
                <span>
                  <b>{weather.precipitation ?? weather.rainfall} mm</b>
                  <small>Precipitation</small>
                </span>
                <span>
                  <b>{weather.condition}</b>
                  <small>Condition</small>
                </span>
                <span>
                  <b>{weather.wind_speed} km/h</b>
                  <small>Wind Speed</small>
                </span>
              </div>
              <div>
                <p style={{ marginTop: "6px", fontWeight: "600", color: "#d6eccf" }}>
                  7-Day Farming Advisory:
                </p>
                <p style={{ marginTop: "4px" }}>{weather.advisory}</p>
              </div>
            </div>
          ) : (
            <ToolStatus>
              Enter a city or place name and click Get Weather to retrieve live
              weather data and the 7-day forecast.
            </ToolStatus>
          )}
        </ResultPanel>
      </div>

      {weather && weather.forecast && weather.forecast.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <GlassCard className="farm-form-card" style={{ width: "100%" }}>
            <div className="form-heading" style={{ marginBottom: "16px" }}>
              <span className="form-icon">
                <CloudSun size={19} />
              </span>
              <div>
                <h2>7-Day Weather Forecast</h2>
                <p>Projected 7-day forecast conditions for {weather.location}</p>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                gap: "12px",
              }}
            >
              {weather.forecast.map((day) => (
                <div
                  key={day.date}
                  style={{
                    background: "rgba(184, 244, 125, 0.05)",
                    border: "1px solid rgba(225, 239, 219, 0.12)",
                    borderRadius: "8px",
                    padding: "12px 8px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    gap: "6px",
                  }}
                >
                  <strong style={{ fontSize: "12px", color: "#f5f8f0" }}>
                    {day.day}
                  </strong>
                  <div style={{ margin: "2px 0" }}>
                    {getWeatherIcon(day.condition)}
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#aebcac",
                      minHeight: "28px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {day.condition}
                  </span>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      color: "#d6eccf",
                    }}
                  >
                    {day.temp_max}°C{" "}
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#8fa38c",
                        fontWeight: "normal",
                      }}
                    >
                      / {day.temp_min}°C
                    </span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      borderTop: "1px solid rgba(225, 239, 219, 0.08)",
                      paddingTop: "6px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "3px",
                      fontSize: "10px",
                      color: "#aebcac",
                    }}
                  >
                    <div>
                      🌧️ Rain: <b style={{ color: "#f5f8f0" }}>{day.rain_probability}%</b>
                    </div>
                    <div>
                      💧 Precip: <b style={{ color: "#f5f8f0" }}>{day.precipitation} mm</b>
                    </div>
                    <div>
                      💨 Wind: <b style={{ color: "#f5f8f0" }}>{day.wind_speed} km/h</b>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

function DiseaseDetection() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  const selectImage = (event) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
    setPreview(selectedFile ? URL.createObjectURL(selectedFile) : "");
    setResult(null);
    setError("");
  };

  const detect = async (event) => {
    event.preventDefault();
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const payload = new FormData();
      payload.append("file", file);

      const endpoint =
        modelEndpoints.disease || "http://127.0.0.1:5000/api/disease-detection";
      const data = await postModelRequest(endpoint, payload);

      if (!data || data.status === "error") {
        throw new Error(data?.error || "Disease detection failed.");
      }

      setResult(data);
    } catch (requestError) {
      const msg = requestError.message || "";
      if (
        msg.includes("Failed to fetch") ||
        msg.includes("NetworkError") ||
        msg === "MODEL_ENDPOINT_NOT_CONFIGURED" ||
        msg.includes("not connected")
      ) {
        setError(
          "Disease detection service is currently unavailable. Please make sure the backend server is running on port 5000.",
        );
      } else {
        setError(msg || "Could not analyze the leaf image. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crop-columns tool-columns">
      <GlassCard className="farm-form-card">
        <div className="form-heading">
          <span className="form-icon">
            <ScanLine size={19} />
          </span>
          <div>
            <h2>Inspect a Crop Leaf</h2>
            <p>Choose a clear photo for model analysis.</p>
          </div>
        </div>
        <form onSubmit={detect}>
          <label className="upload-field">
            Leaf image
            <input
              type="file"
              accept="image/*"
              onChange={selectImage}
              required
            />
          </label>
          {preview && (
            <img
              className="disease-image-preview"
              src={preview}
              alt="Selected crop leaf preview"
            />
          )}
          <button
            className="button form-submit"
            type="submit"
            disabled={!file || loading}
          >
            {loading ? (
              "Analyzing leaf…"
            ) : (
              <>
                Detect Disease <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </GlassCard>
      <ResultPanel icon={ScanLine} title="Detection Result">
        {loading ? (
          <ToolStatus>Analyzing leaf image with AI model…</ToolStatus>
        ) : error ? (
          <ToolStatus error={true}>{error}</ToolStatus>
        ) : result ? (
          <div className="tool-result-content">
            <strong className="result-condition">
              {result.is_healthy ? "Healthy" : result.disease}
            </strong>
            <div className="weather-metrics">
              <span>
                <b>{result.confidence}%</b>
                <small>Confidence</small>
              </span>
              <span>
                <b>{result.detection_status}</b>
                <small>Detection Status</small>
              </span>
              <span>
                <b>{result.is_healthy ? "Healthy" : "Infected"}</b>
                <small>Condition</small>
              </span>
            </div>
            {result.is_healthy ? (
              <p>Healthy leaf — no disease detected.</p>
            ) : (
              <div>
                <p
                  style={{
                    marginTop: "8px",
                    fontWeight: "600",
                    color: "#d6eccf",
                  }}
                >
                  Recommended Next Steps / Treatment:
                </p>
                <p style={{ marginTop: "4px" }}>{result.treatment}</p>
              </div>
            )}
          </div>
        ) : (
          <ToolStatus>
            {file
              ? "Image ready. Click Detect Disease to analyze."
              : "Upload a leaf image to preview it here."}
          </ToolStatus>
        )}
      </ResultPanel>
    </div>
  );
}

function GrowthPrediction() {
  const [values, setValues] = useState({
    crop: "",
    area: "",
    days: "",
    temperature: "",
    rainfall: "",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (event) =>
    setValues((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const endpoint =
        modelEndpoints.growth || "http://127.0.0.1:5000/api/crop-growth";
      const data = await postModelRequest(endpoint, {
        crop: values.crop,
        area: Number(values.area),
        daysAfterSowing: Number(values.days),
        temperature: Number(values.temperature),
        rainfall: Number(values.rainfall),
      });

      if (!data || data.status === "error") {
        throw new Error(data?.error || "Could not predict crop growth.");
      }

      setResult(data);
    } catch (requestError) {
      const msg = requestError.message || "";
      if (
        msg.includes("Failed to fetch") ||
        msg.includes("NetworkError") ||
        msg === "MODEL_ENDPOINT_NOT_CONFIGURED" ||
        msg.includes("not connected")
      ) {
        setError(
          "Growth prediction service is currently unavailable. Please make sure the backend server is running on port 5000.",
        );
      } else {
        setError(msg || "Could not predict crop growth. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crop-columns tool-columns">
      <GlassCard className="farm-form-card">
        <div className="form-heading">
          <span className="form-icon">
            <Sprout size={19} />
          </span>
          <div>
            <h2>Growth Inputs</h2>
            <p>Enter the current crop and field conditions.</p>
          </div>
        </div>
        <form onSubmit={submit}>
          <div className="farm-input-grid">
            <CropField value={values.crop} onChange={update} />
            <NumberField
              label="Land Area (ha)"
              name="area"
              min="0.01"
              value={values.area}
              onChange={update}
            />
            <NumberField
              label="Days After Sowing"
              name="days"
              value={values.days}
              onChange={update}
            />
            <NumberField
              label="Temperature (°C)"
              name="temperature"
              min="-20"
              value={values.temperature}
              onChange={update}
            />
            <NumberField
              label="Rainfall (mm)"
              name="rainfall"
              value={values.rainfall}
              onChange={update}
            />
          </div>
          <button
            className="button form-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              "Predicting…"
            ) : (
              <>
                Predict Growth <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </GlassCard>
      <ResultPanel icon={Sprout} title="Predicted Growth & Yield">
        {loading ? (
          <ToolStatus>Calculating growth stage and estimating yield…</ToolStatus>
        ) : error ? (
          <ToolStatus error={true}>{error}</ToolStatus>
        ) : result ? (
          <div className="tool-result-content">
            <strong className="result-condition">
              {result.crop} — {result.growth}
            </strong>
            <div className="weather-metrics">
              <span>
                <b>{result.crop}</b>
                <small>Selected Crop</small>
              </span>
              <span>
                <b>{result.growth}</b>
                <small>Growth Stage</small>
              </span>
              <span>
                <b>{result.total_yield} Tonnes</b>
                <small>Total Yield ({result.area} ha)</small>
              </span>
              <span>
                <b>{result.yield_per_ha} T/ha</b>
                <small>Productivity</small>
              </span>
              <span>
                <b>{result.days} Days</b>
                <small>Days After Sowing</small>
              </span>
            </div>
            <div>
              <p
                style={{
                  marginTop: "8px",
                  fontWeight: "600",
                  color: "#d6eccf",
                }}
              >
                Agronomic Stage Interpretation & Advisory:
              </p>
              <p style={{ marginTop: "4px" }}>{result.advisory}</p>
            </div>
          </div>
        ) : (
          <ToolStatus>
            Enter your crop, land area, days after sowing, and field conditions
            to predict crop growth and expected yield.
          </ToolStatus>
        )}
      </ResultPanel>
    </div>
  );
}

function CostProfit() {
  const [values, setValues] = useState({
    crop: "",
    area: "",
    inputCost: "",
    expectedYield: "",
    sellingPrice: "",
  });
  const [result, setResult] = useState(null);
  const update = (event) =>
    setValues((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  const calculate = (event) => {
    event.preventDefault();
    const area = Number(values.area);
    const totalCost = area * Number(values.inputCost);
    const revenue =
      area * Number(values.expectedYield) * Number(values.sellingPrice);
    setResult({
      crop: values.crop,
      totalCost,
      revenue,
      profit: revenue - totalCost,
    });
  };

  return (
    <div className="crop-columns tool-columns">
      <GlassCard className="farm-form-card">
        <div className="form-heading">
          <span className="form-icon">
            <Coins size={19} />
          </span>
          <div>
            <h2>Farm Cost Inputs</h2>
            <p>Enter per-hectare values for this estimate.</p>
          </div>
        </div>
        <form onSubmit={calculate}>
          <div className="farm-input-grid">
            <CropField value={values.crop} onChange={update} />
            <NumberField
              label="Land Area (ha)"
              name="area"
              min="0.01"
              value={values.area}
              onChange={update}
            />
            <NumberField
              label="Input Cost per ha (₹)"
              name="inputCost"
              value={values.inputCost}
              onChange={update}
            />
            <NumberField
              label="Expected Yield per ha (tonnes)"
              name="expectedYield"
              value={values.expectedYield}
              onChange={update}
            />
            <NumberField
              label="Selling Price per tonne (₹)"
              name="sellingPrice"
              value={values.sellingPrice}
              onChange={update}
            />
          </div>
          <button className="button form-submit" type="submit">
            Calculate <ArrowRight size={16} />
          </button>
        </form>
      </GlassCard>
      <ResultPanel icon={Coins} title="Cost & Profit Estimate">
        {result ? (
          <div className="tool-result-content">
            <strong className="result-condition">{result.crop}</strong>
            <div className="profit-grid">
              <div>
                <span>Total cost</span>
                <strong>{formatCurrency(result.totalCost)}</strong>
              </div>
              <div>
                <span>Expected revenue</span>
                <strong>{formatCurrency(result.revenue)}</strong>
              </div>
              <div>
                <span>Estimated profit</span>
                <strong>{formatCurrency(result.profit)}</strong>
              </div>
            </div>
            <ToolStatus>
              Calculated from your entered area, costs, yield, and selling
              price.
            </ToolStatus>
          </div>
        ) : (
          <ToolStatus>
            Complete the farm inputs to calculate estimated costs, revenue, and
            profit.
          </ToolStatus>
        )}
      </ResultPanel>
    </div>
  );
}

function demoAssistantReply(question) {
  const text = question.toLowerCase();
  if (text.includes("soil") || text.includes("ph"))
    return "Demo guidance (not AI-generated): use a recent soil laboratory report before changing pH or fertilizer inputs. A local agricultural extension office can interpret results for your crop and area.";
  if (
    text.includes("weather") ||
    text.includes("rain") ||
    text.includes("irrigat")
  )
    return "Demo guidance (not AI-generated): check your local official forecast and soil moisture before irrigation or spraying. Weather conditions can vary significantly between nearby fields.";
  if (
    text.includes("disease") ||
    text.includes("leaf") ||
    text.includes("pest")
  )
    return "Demo guidance (not AI-generated): photograph symptoms on several plants and note when they appeared. Avoid applying treatment until the issue is identified by a qualified local advisor.";
  if (text.includes("crop") || text.includes("plant") || text.includes("seed"))
    return "Demo guidance (not AI-generated): compare crop choices with your soil test, planting season, water access, and advice from your local agriculture office.";
  return "Demo guidance (not AI-generated): include your crop, location, and growing conditions in your question. For field-specific decisions, confirm advice with a local agricultural extension service.";
}

function FarmAssistant() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Ask a farming question. Without an assistant API configured, replies are clearly labeled demo guidance.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    const prompt = question.trim();
    if (!prompt || loading) return;
    const history = messages;
    setQuestion("");
    setMessages((current) => [...current, { role: "user", text: prompt }]);
    if (!modelEndpoints.assistant) {
      setMessages((current) => [
        ...current,
        { role: "assistant", text: demoAssistantReply(prompt) },
      ]);
      return;
    }
    setLoading(true);
    try {
      const data = await postModelRequest(modelEndpoints.assistant, {
        question: prompt,
        history,
      });
      const answer = data.answer || data.response || data.message;
      if (!answer)
        throw new Error("The assistant response did not include an answer.");
      setMessages((current) => [
        ...current,
        { role: "assistant", text: String(answer) },
      ]);
    } catch (requestError) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: modelErrorMessage(requestError, "Farm assistant"),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="farm-form-card assistant-card">
      <div className="form-heading">
        <span className="form-icon">
          <MessageCircleMore size={19} />
        </span>
        <div>
          <h2>Farm Assistant</h2>
          <p>
            {modelEndpoints.assistant
              ? "Connected to the configured assistant endpoint."
              : "Local demo replies are not AI-generated."}
          </p>
        </div>
      </div>
      <div className="chat-history" aria-live="polite">
        {messages.map((message, index) => (
          <div
            className={`chat-message ${message.role}`}
            key={`${message.role}-${index}`}
          >
            <span>{message.role === "user" ? "You" : "Assistant"}</span>
            <p>{message.text}</p>
          </div>
        ))}
      </div>
      <form className="chat-form" onSubmit={submit}>
        <label className="visually-hidden" htmlFor="farm-question">
          Your farming question
        </label>
        <input
          id="farm-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask about crops, soil, weather…"
        />
        <button
          className="button"
          type="submit"
          disabled={!question.trim() || loading}
        >
          {loading ? (
            "Asking…"
          ) : (
            <>
              Ask <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
    </GlassCard>
  );
}

const tools = {
  "soil-analysis": SoilAnalysis,
  weather: WeatherInsights,
  "disease-detection": DiseaseDetection,
  "growth-prediction": GrowthPrediction,
  "cost-profit": CostProfit,
  "ai-assistant": FarmAssistant,
};

export default function FeatureTools({ feature }) {
  const Tool = tools[feature];
  return Tool ? <Tool /> : null;
}
