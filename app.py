import os
import io
import pickle
import warnings
from datetime import datetime
import numpy as np
import joblib
import requests
import traceback
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS

# Suppress harmless warnings from scikit-learn
warnings.filterwarnings("ignore", category=UserWarning)

app = Flask(__name__)
# Enable CORS for all routes so the frontend can interact smoothly
CORS(app)

@app.after_request
def add_header(response):
    """Ensure responses are never cached by the browser or proxies."""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

# Resolve file paths dynamically relative to app.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODELS_DIR, "crop_recommendation_model.pkl")
ENCODER_PATH = os.path.join(MODELS_DIR, "label_encoder.pkl")
DISEASE_MODEL_PATH = os.path.join(MODELS_DIR, "plant_disease_model.onnx")
GROWTH_MODEL_PATH = os.path.join(MODELS_DIR, "crop_growth_yield_model.pkl")

crop_model = None
crop_label_encoder = None
disease_session = None
disease_input_name = None
growth_model = None
growth_label_encoder = None

# PlantVillage 38 classes with health status and treatment recommendations
DISEASE_CLASSES = {
    0: ("Apple Scab", False, "Apply protective copper or sulfur fungicide in early spring before rain. Rake and dispose of fallen infected leaves."),
    1: ("Apple with Black Rot", False, "Prune infected twigs, dead wood, and mummified fruits. Apply captan or copper-based fungicide."),
    2: ("Cedar Apple Rust", False, "Remove nearby galls from juniper/cedar trees. Spray myclobutanil or sulfur fungicide at bud break."),
    3: ("Healthy Apple", True, "Leaf is healthy and shows no pathogen damage. Continue normal watering and balanced pruning."),
    4: ("Healthy Blueberry Plant", True, "Leaf is healthy and free of disease symptoms. Maintain acidic soil pH (4.5–5.5) and good drainage."),
    5: ("Cherry with Powdery Mildew", False, "Prune for adequate canopy aeration. Apply sulfur or potassium bicarbonate fungicide early."),
    6: ("Healthy Cherry Plant", True, "Leaf is healthy and vigorous. Maintain good canopy sunlight penetration and regular watering."),
    7: ("Corn with Cercospora / Gray Leaf Spot", False, "Use resistant hybrid varieties. Practice crop rotation and apply strobilurin or triazole fungicides if severe."),
    8: ("Corn with Common Rust", False, "Avoid late planting. Apply preventative foliar fungicides if pustules appear before tassel emergence."),
    9: ("Corn with Northern Leaf Blight", False, "Rotate crops and till residue to accelerate decomposition. Apply labeled foliar fungicide if needed."),
    10: ("Healthy Corn (Maize) Plant", True, "Leaf is healthy. Ensure adequate nitrogen and moisture during reproductive growth stages."),
    11: ("Grape with Black Rot", False, "Remove mummified berries and infected shoots. Spray mancozeb or myclobutanil before and after bloom."),
    12: ("Grape with Esca (Black Measles)", False, "Prune during dry weather and protect large pruning wounds. Remove severely infected vine trunks."),
    13: ("Grape with Isariopsis Leaf Spot", False, "Apply copper oxychloride or dithiocarbamate sprays after heavy rains. Ensure good row spacing."),
    14: ("Healthy Grape Plant", True, "Vine foliage is clean and healthy. Continue regular canopy training and balanced vine nutrition."),
    15: ("Orange with Citrus Greening (HLB)", False, "Control Asian citrus psyllids with insecticidal sprays. Remove severely declining infected trees."),
    16: ("Peach with Bacterial Spot", False, "Apply copper hydroxide dormant sprays. Avoid overhead irrigation and minimize wind abrasion."),
    17: ("Healthy Peach Plant", True, "Foliage is healthy. Keep tree base clear of grass and maintain routine preventative fruit tree care."),
    18: ("Bell Pepper with Bacterial Spot", False, "Spray copper bactericide combined with mancozeb. Avoid working in fields when foliage is wet."),
    19: ("Healthy Bell Pepper Plant", True, "Foliage is healthy and clean. Maintain steady soil moisture and mulch to prevent splash contamination."),
    20: ("Potato with Early Blight", False, "Remove infected lower leaves. Spray protective chlorothalonil or copper fungicide and practice crop rotation."),
    21: ("Potato with Late Blight", False, "Immediately destroy affected foliage to prevent spread. Spray systemic fungicides (e.g., metalaxyl/mancozeb)."),
    22: ("Healthy Potato Plant", True, "Foliage is healthy. Hill soil properly around stems and monitor regularly during cool, humid weather."),
    23: ("Healthy Raspberry Plant", True, "Canes and leaves are vigorous. Prune old fruited canes after harvest for good air circulation."),
    24: ("Healthy Soybean Plant", True, "Crop canopy is healthy. Maintain proper weed control and monitor for early pest emergence."),
    25: ("Squash with Powdery Mildew", False, "Spray neem oil, sulfur, or potassium bicarbonate on both leaf surfaces. Avoid crowded planting."),
    26: ("Strawberry with Leaf Scorch", False, "Remove dried infected leaves after harvest. Apply protective copper fungicide and avoid excessive nitrogen."),
    27: ("Healthy Strawberry Plant", True, "Crown and leaves are healthy. Keep straw mulch beneath fruit to reduce soil-borne splashing."),
    28: ("Tomato with Bacterial Spot", False, "Apply copper-mancozeb tank mix. Stake plants, disinfect tools, and remove severely diseased foliage."),
    29: ("Tomato with Early Blight", False, "Prune lower leaves touching soil. Apply copper fungicide or chlorothalonil every 7–10 days in wet conditions."),
    30: ("Tomato with Late Blight", False, "Remove and bag infected plants immediately. Apply copper fungicide protectively; avoid overhead sprinkler watering."),
    31: ("Tomato with Leaf Mold", False, "Increase air movement and reduce greenhouse humidity below 85%. Apply preventative copper spray."),
    32: ("Tomato with Septoria Leaf Spot", False, "Remove bottom infected leaves promptly. Apply organic copper or chlorothalonil fungicide and mulch the ground."),
    33: ("Tomato with Spider Mites", False, "Wash leaf undersides with strong water spray. Apply insecticidal soap or neem oil every 5–7 days."),
    34: ("Tomato with Target Spot", False, "Ensure wide plant spacing and prune suckers for ventilation. Apply azoxystrobin or chlorothalonil fungicide."),
    35: ("Tomato Yellow Leaf Curl Virus", False, "Control whitefly vectors using yellow sticky traps and insecticidal sprays. Remove infected plants promptly."),
    36: ("Tomato Mosaic Virus", False, "Disinfect gardening tools and wash hands. Remove and discard infected plants; do not compost virus-infected material."),
    37: ("Healthy Tomato Plant", True, "Leaf is vibrant and disease-free. Maintain consistent watering, staking, and balanced feeding."),
}

# WMO Weather interpretation table
WMO_WEATHER_CODES = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
}

def load_ml_components():
    """Load ML models and components on startup."""
    global crop_model, crop_label_encoder, disease_session, disease_input_name, growth_model, growth_label_encoder

    # 1. Crop Recommendation Model
    if os.path.exists(MODEL_PATH):
        try:
            crop_model = joblib.load(MODEL_PATH)
            print(f"[OK] Crop model loaded from: {MODEL_PATH}")
        except Exception:
            try:
                with open(MODEL_PATH, "rb") as f:
                    crop_model = pickle.load(f)
                print(f"[OK] Crop model loaded via pickle: {MODEL_PATH}")
            except Exception as e:
                print(f"[ERROR] Could not load crop model: {e}")
                crop_model = None

    # 2. Crop Recommendation Label Encoder
    if os.path.exists(ENCODER_PATH):
        try:
            crop_label_encoder = joblib.load(ENCODER_PATH)
            print(f"[OK] Crop label encoder loaded from: {ENCODER_PATH}")
        except Exception:
            try:
                with open(ENCODER_PATH, "rb") as f:
                    crop_label_encoder = pickle.load(f)
                print(f"[OK] Crop label encoder loaded via pickle: {ENCODER_PATH}")
            except Exception as e:
                print(f"[ERROR] Could not load crop label encoder: {e}")
                crop_label_encoder = None

    # 3. Plant Disease Detection ONNX Model
    if os.path.exists(DISEASE_MODEL_PATH):
        try:
            import onnxruntime as ort
            disease_session = ort.InferenceSession(DISEASE_MODEL_PATH)
            disease_input_name = disease_session.get_inputs()[0].name
            print(f"[OK] Plant disease ONNX model loaded from: {DISEASE_MODEL_PATH}")
        except Exception as e:
            print(f"[ERROR] Could not load disease detection model: {e}")
            disease_session = None

    # 4. Crop Growth & Yield Regression Model
    if os.path.exists(GROWTH_MODEL_PATH):
        try:
            g_data = joblib.load(GROWTH_MODEL_PATH)
            growth_model = g_data.get("model")
            growth_label_encoder = g_data.get("label_encoder")
            print(f"[OK] Crop growth & yield model loaded from: {GROWTH_MODEL_PATH}")
        except Exception as e:
            print(f"[ERROR] Could not load growth model: {e}")
            growth_model = None

load_ml_components()

def get_crop_growth_stage(crop, das):
    """Determine precise agronomic growth stage and practical field guidance."""
    crop_lower = crop.lower()
    if "rice" in crop_lower:
        if das <= 20: return "Seedling & Germination Stage", "Maintain shallow water level (2-3 cm) and monitor weed emergence."
        elif das <= 45: return "Active Tillering Stage", "Apply top-dress nitrogen fertilizer; keep soil saturated."
        elif das <= 75: return "Panicle Initiation & Stem Elongation", "Crucial water stage: maintain 5 cm water depth to ensure spikelet formation."
        elif das <= 100: return "Flowering & Heading Stage", "Avoid moisture stress. Check for stem borer and blast infections."
        elif das <= 125: return "Milk & Dough Grain Filling", "Gradually reduce water standing; ensure adequate aeration."
        else: return "Physiological Maturity & Ripening", "Drain field 10–14 days before harvest. Grains are golden and ready for cutting."
    elif "wheat" in crop_lower:
        if das <= 20: return "Crown Root Initiation (CRI)", "First critical irrigation stage: irrigate immediately for strong root establishment."
        elif das <= 45: return "Tillering Stage", "Apply first dose of nitrogen top dressing and perform initial weeding."
        elif das <= 70: return "Jointing & Stem Extension", "Monitor soil moisture; apply second irrigation if soil feels dry."
        elif das <= 95: return "Heading & Flowering Stage", "Protect against warm winds and moisture stress during anthesis."
        elif das <= 120: return "Milk & Dough Filling Stage", "Maintain light moisture; guard against aphid buildup."
        else: return "Harvest Maturity", "Crop is ripe (golden brown). Harvest when grain moisture drops below 14%."
    elif "maize" in crop_lower:
        if das <= 15: return "Emergence & Early Vegetative (V1-V4)", "Check for cutworms or shoot flies; ensure light initial irrigation."
        elif das <= 40: return "Knee-High Rapid Vegetative Growth (V6-V12)", "Side-dress urea; earth up soil around stems for anchor support."
        elif das <= 65: return "Tasseling & Silking Stage", "Peak water-sensitive stage: water deficit now severely impacts grain setting."
        elif das <= 90: return "Blister & Dough Grain Filling", "Maintain steady moisture; monitor for fall armyworm."
        else: return "Black Layer Maturity", "Corn ears are fully developed. Ready for harvest when kernels harden."
    elif "cotton" in crop_lower:
        if das <= 25: return "Seedling & Early Vegetative Stage", "Thin excess seedlings and maintain clean row weed control."
        elif das <= 55: return "Square / Flower Bud Formation", "Apply nitrogen fertilizer; scout for whitefly and jassids."
        elif das <= 90: return "Peak Flowering & Early Boll Development", "Irrigate at 10-12 day intervals; avoid waterlogging."
        elif das <= 130: return "Boll Maturation Stage", "Stop excessive nitrogen; ensure soil moisture for boll weight."
        else: return "Boll Bursting & Harvesting", "Pick clean cotton bolls during dry sunny morning hours."
    elif "soybean" in crop_lower:
        if das <= 20: return "Emergence & Trifoliate Vegetative", "Control early broadleaf weeds; avoid crusting soil."
        elif das <= 45: return "Branching & Early Flowering (R1-R2)", "Critical moisture period: ensure soil is neither dry nor flooded."
        elif das <= 75: return "Pod Development & Seed Filling (R3-R6)", "Guard against pod borers and rust; support pod filling with light irrigation."
        else: return "Leaf Drop & Maturity (R7-R8)", "Harvest promptly when 95% of pods turn mature brown to avoid shattering."
    elif "millet" in crop_lower:
        if das <= 20: return "Seedling Phase", "Thin plants to optimal spacing; hoe to break soil crust."
        elif das <= 45: return "Tillering & Stem Elongation", "Apply light nitrogen; millets are drought-tolerant but benefit from moderate rain."
        elif das <= 70: return "Panicle Booting & Flowering", "Maintain moist soil; protect head against birds."
        else: return "Grain Hardening & Maturity", "Harvest earheads when grains are hard and dry."
    else:
        if das <= 25: return "Vegetative Seedling Stage", "Provide adequate starter moisture and weed control."
        elif das <= 60: return "Active Vegetative Growth", "Ensure balanced NPK nutrient supply."
        elif das <= 95: return "Flowering & Yield Formation", "Maintain steady soil moisture during reproductive phase."
        else: return "Maturity & Ripening Stage", "Crop is reaching maturity; prepare harvest equipment."

def generate_forecast_advisory(temp, humidity, rain, wind_speed, forecast_days):
    """Generate dynamic farming advisory based on current conditions and 7-day forecast."""
    notes = []
    total_rain_7d = sum(d.get("precipitation", 0.0) for d in forecast_days)
    rainy_days = [d["day"].split(" ")[0].rstrip(",") for d in forecast_days if d.get("precipitation", 0) > 2.0 or d.get("rain_probability", 0) >= 45]
    high_wind_days = [d["day"].split(" ")[0].rstrip(",") for d in forecast_days if d.get("wind_speed", 0) >= 20.0]
    hot_days = [d["day"].split(" ")[0].rstrip(",") for d in forecast_days if d.get("temp_max", 0) >= 35.0]

    if total_rain_7d > 25.0:
        notes.append(f"Heavy rainfall forecast across the week (approx. {total_rain_7d:.1f} mm total). Clear field drainage channels and avoid irrigation.")
    elif rainy_days:
        notes.append(f"Rainfall expected on {', '.join(rainy_days[:3])}. Avoid irrigation and postpone spraying operations prior to rain.")
    else:
        notes.append("Dry conditions expected across the forecast period. Irrigation is recommended based on field soil moisture.")

    if high_wind_days:
        notes.append(f"High wind speeds (>= 20 km/h) forecasted on {', '.join(high_wind_days[:2])}. Avoid pesticide spraying to prevent drift.")

    if hot_days:
        notes.append(f"High temperature alert (>= 35°C) on {', '.join(hot_days[:2])}. Irrigate early morning or evening to reduce heat stress.")

    if not rainy_days and not high_wind_days and not hot_days:
        notes.append("Favorable weather conditions throughout the 7-day period for general fieldwork, weeding, and crop maintenance.")

    return " ".join(notes)

@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "project": "Smart Farm AI Backend",
        "status": "online",
        "endpoints": {
            "health": "/api/health",
            "crop_recommendation": "/api/crop-recommendation",
            "weather": "/api/weather",
            "crop_growth": "/api/crop-growth",
            "disease_detection": "/api/disease-detection"
        }
    }), 200

@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint to verify backend status and loaded components."""
    return jsonify({
        "status": "healthy",
        "message": "Smart Farm AI Backend is running",
        "crop_model_loaded": crop_model is not None,
        "label_encoder_loaded": crop_label_encoder is not None,
        "disease_model_loaded": disease_session is not None,
        "growth_model_loaded": growth_model is not None
    }), 200

# ==========================================
# 1. CROP RECOMMENDATION ENDPOINT
# ==========================================
@app.route("/api/crop-recommendation", methods=["POST"])
def crop_recommendation():
    """Predict optimal crop based on soil and weather parameters."""
    if crop_model is None:
        return jsonify({
            "status": "error",
            "error": "Crop model not loaded. Ensure crop_recommendation_model.pkl is placed in backend/models/"
        }), 500

    data = request.get_json(silent=True)
    if not data:
        return jsonify({
            "status": "error",
            "error": "Request body must be valid JSON."
        }), 400

    def extract_value(*keys):
        for key in keys:
            if key in data and data[key] is not None and str(data[key]).strip() != "":
                try:
                    return float(data[key])
                except (ValueError, TypeError):
                    raise ValueError(f"Value for '{key}' must be a valid number.")
        return None

    try:
        n = extract_value("N", "nitrogen", "n")
        p = extract_value("P", "phosphorus", "p")
        k = extract_value("K", "potassium", "k")
        temp = extract_value("temperature", "temp")
        humidity = extract_value("humidity")
        ph = extract_value("ph", "pH")
        rainfall = extract_value("rainfall", "rain")
    except ValueError as ve:
        return jsonify({
            "status": "error",
            "error": str(ve)
        }), 400

    missing = []
    if n is None: missing.append("N (or nitrogen)")
    if p is None: missing.append("P (or phosphorus)")
    if k is None: missing.append("K (or potassium)")
    if temp is None: missing.append("temperature")
    if humidity is None: missing.append("humidity")
    if ph is None: missing.append("ph")
    if rainfall is None: missing.append("rainfall")

    if missing:
        return jsonify({
            "status": "error",
            "error": f"Missing required parameter(s): {', '.join(missing)}"
        }), 400

    try:
        features = np.array([[n, p, k, temp, humidity, ph, rainfall]], dtype=float)
        raw_prediction = crop_model.predict(features)

        if crop_label_encoder is not None and hasattr(crop_label_encoder, "inverse_transform"):
            crop_name = str(crop_label_encoder.inverse_transform(raw_prediction)[0])
        else:
            crop_name = str(raw_prediction[0])

        confidence = None
        if hasattr(crop_model, "predict_proba"):
            try:
                probabilities = crop_model.predict_proba(features)[0]
                confidence = round(float(np.max(probabilities)) * 100, 2)
            except Exception:
                confidence = None

        return jsonify({
            "status": "success",
            "crop": crop_name,
            "prediction": crop_name,
            "confidence": confidence,
            "input_received": {
                "N": n,
                "P": p,
                "K": k,
                "temperature": temp,
                "humidity": humidity,
                "ph": ph,
                "rainfall": rainfall
            }
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "error": f"Crop prediction failed: {str(e)}"
        }), 500

# ==========================================
# 2. LIVE WEATHER & 7-DAY FORECAST ENDPOINT
# ==========================================
@app.route("/api/weather", methods=["GET", "POST"])
def get_weather():
    """Fetch live current weather and 7-day forecast with agronomic advisory."""
    if request.method == "POST":
        data = request.get_json(silent=True) or {}
        location_input = data.get("location", "").strip()
    else:
        location_input = request.args.get("location", "").strip()

    if not location_input:
        return jsonify({
            "status": "error",
            "error": "Location parameter is required (e.g. Mumbai, Pune, Nashik, Delhi)."
        }), 400

    try:
        # Step 1: Live Geocoding via Open-Meteo API
        geo_url = (
            f"https://geocoding-api.open-meteo.com/v1/search?"
            f"name={requests.utils.quote(location_input)}&count=1&language=en&format=json"
        )
        geo_resp = requests.get(geo_url, timeout=10)
        if not geo_resp.ok:
            return jsonify({
                "status": "error",
                "error": "Unable to fetch live weather. Please check the location and try again."
            }), 502

        geo_data = geo_resp.json()
        results = geo_data.get("results")
        if not results:
            return jsonify({
                "status": "error",
                "error": "Unable to fetch live weather. Please check the location and try again."
            }), 404

        place = results[0]
        lat = place["latitude"]
        lon = place["longitude"]
        resolved_name = ", ".join(
            filter(None, [place.get("name"), place.get("admin1"), place.get("country")])
        )

        # Step 2: Live Current Weather + 7-Day Forecast via Open-Meteo
        weather_url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lon}&"
            f"current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&"
            f"daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&"
            f"timezone=auto"
        )
        weather_resp = requests.get(weather_url, timeout=10)
        if not weather_resp.ok:
            return jsonify({
                "status": "error",
                "error": "Unable to fetch live weather. Please check the location and try again."
            }), 502

        weather_json = weather_resp.json()
        current = weather_json.get("current", {})
        temp = float(current.get("temperature_2m", 0.0))
        humidity = float(current.get("relative_humidity_2m", 0.0))
        precipitation = float(current.get("precipitation", 0.0))
        wind_speed = float(current.get("wind_speed_10m", 0.0))
        code = current.get("weather_code", 0)
        condition = WMO_WEATHER_CODES.get(code, "Clear sky")

        # Parse 7-day forecast
        daily = weather_json.get("daily", {})
        times = daily.get("time", [])
        codes = daily.get("weather_code", [])
        max_temps = daily.get("temperature_2m_max", [])
        min_temps = daily.get("temperature_2m_min", [])
        precip_sums = daily.get("precipitation_sum", [])
        precip_probs = daily.get("precipitation_probability_max", [])
        wind_speeds = daily.get("wind_speed_10m_max", [])

        forecast_days = []
        for i in range(len(times)):
            d_str = times[i]
            try:
                d_obj = datetime.strptime(d_str, "%Y-%m-%d")
                if i == 0:
                    day_label = f"Today ({d_obj.strftime('%a, %b %d')})"
                elif i == 1:
                    day_label = f"Tomorrow ({d_obj.strftime('%a, %b %d')})"
                else:
                    day_label = d_obj.strftime("%A, %b %d")
            except Exception:
                day_label = d_str

            day_code = codes[i] if i < len(codes) else 0
            day_condition = WMO_WEATHER_CODES.get(day_code, "Clear sky")

            forecast_days.append({
                "date": d_str,
                "day": day_label,
                "weather_code": day_code,
                "condition": day_condition,
                "temp_max": round(float(max_temps[i]), 1) if i < len(max_temps) and max_temps[i] is not None else 0.0,
                "temp_min": round(float(min_temps[i]), 1) if i < len(min_temps) and min_temps[i] is not None else 0.0,
                "precipitation": round(float(precip_sums[i]), 1) if i < len(precip_sums) and precip_sums[i] is not None else 0.0,
                "rain_probability": int(precip_probs[i]) if i < len(precip_probs) and precip_probs[i] is not None else 0,
                "wind_speed": round(float(wind_speeds[i]), 1) if i < len(wind_speeds) and wind_speeds[i] is not None else 0.0,
            })

        advisory = generate_forecast_advisory(temp, humidity, precipitation, wind_speed, forecast_days)
        now = datetime.now()
        updated_at = now.strftime("%I:%M:%S %p")

        resp = jsonify({
            "status": "success",
            "location": resolved_name,
            "temperature": round(temp, 1),
            "humidity": round(humidity, 1),
            "precipitation": round(precipitation, 1),
            "rainfall": round(precipitation, 1),
            "condition": condition,
            "wind_speed": round(wind_speed, 1),
            "advisory": advisory,
            "updated_at": updated_at,
            "timestamp": now.isoformat(),
            "forecast": forecast_days
        })
        return resp, 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({
            "status": "error",
            "error": "Unable to fetch live weather. Please check the location and try again."
        }), 500

# ==========================================
# 3. CROP DISEASE DETECTION ENDPOINT
# ==========================================
@app.route("/api/disease-detection", methods=["POST"])
@app.route("/api/crop-disease", methods=["POST"])
def disease_detection():
    """Detect crop leaf disease from uploaded leaf image using MobileNetV2 ONNX model."""
    if disease_session is None:
        return jsonify({
            "status": "error",
            "error": "Disease detection model not loaded. Ensure plant_disease_model.onnx is placed in backend/models/"
        }), 503

    uploaded_file = request.files.get("file") or request.files.get("image")
    if not uploaded_file or uploaded_file.filename == "":
        return jsonify({
            "status": "error",
            "error": "No image file provided in request."
        }), 400

    try:
        img_bytes = uploaded_file.read()
        image = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        image_resized = image.resize((224, 224))
        img_array = (np.array(image_resized).astype(np.float32) / 255.0 - 0.5) / 0.5
        img_array = np.transpose(img_array, (2, 0, 1))
        input_tensor = np.expand_dims(img_array, axis=0).astype(np.float32)

        outputs = disease_session.run(None, {disease_input_name: input_tensor})
        logits = outputs[0][0]
        exp_logits = np.exp(logits - np.max(logits))
        probabilities = exp_logits / np.sum(exp_logits)
        class_idx = int(np.argmax(probabilities))
        confidence = round(float(probabilities[class_idx]) * 100, 2)

        disease_info = DISEASE_CLASSES.get(
            class_idx,
            ("Unknown Plant Condition", False, "Consult a local agricultural extension officer for expert identification.")
        )
        disease_name = disease_info[0]
        is_healthy = disease_info[1]
        treatment_advice = disease_info[2]

        detection_status = "Healthy leaf — no disease detected" if is_healthy else "Disease detected"

        return jsonify({
            "status": "success",
            "disease": "Healthy" if is_healthy else disease_name,
            "prediction": "Healthy" if is_healthy else disease_name,
            "raw_class": disease_name,
            "confidence": confidence,
            "is_healthy": is_healthy,
            "detection_status": detection_status,
            "treatment": treatment_advice,
            "message": "Detection successful"
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "error": f"Leaf image processing failed: {str(e)}"
        }), 500

# ==========================================
# 4. CROP GROWTH & YIELD PREDICTION ENDPOINT
# ==========================================
@app.route("/api/crop-growth", methods=["POST"])
@app.route("/api/growth", methods=["POST"])
def crop_growth_prediction():
    """Predict crop growth stage and estimate yield using trained regression model."""
    if growth_model is None or growth_label_encoder is None:
        return jsonify({
            "status": "error",
            "error": "Crop growth model not loaded. Ensure crop_growth_yield_model.pkl is placed in backend/models/"
        }), 503

    data = request.get_json(silent=True)
    if not data:
        return jsonify({
            "status": "error",
            "error": "Request body must be valid JSON."
        }), 400

    crop = str(data.get("crop", "")).strip()
    if not crop:
        return jsonify({
            "status": "error",
            "error": "Crop selection is required."
        }), 400

    try:
        area = float(data.get("area", 1.0))
        das = int(float(data.get("daysAfterSowing", data.get("days", data.get("das", 30)))))
        temperature = float(data.get("temperature", 25.0))
        rainfall = float(data.get("rainfall", 100.0))
    except (ValueError, TypeError) as e:
        return jsonify({
            "status": "error",
            "error": f"Invalid numerical value in input: {str(e)}"
        }), 400

    if area <= 0:
        return jsonify({
            "status": "error",
            "error": "Land area must be greater than 0 hectares."
        }), 400

    if das < 0:
        return jsonify({
            "status": "error",
            "error": "Days after sowing cannot be negative."
        }), 400

    try:
        # Determine physiological growth stage and advisory
        growth_stage, stage_advisory = get_crop_growth_stage(crop, das)

        # Prepare feature vector for model
        matched_crop = "Other"
        for known in growth_label_encoder.classes_:
            if known.lower() in crop.lower() or crop.lower() in known.lower():
                matched_crop = known
                break

        crop_code = int(growth_label_encoder.transform([matched_crop])[0])
        feature_vector = np.array([[crop_code, area, das, temperature, rainfall]], dtype=np.float32)

        # Predict yield per hectare (Tonnes/ha)
        yield_per_ha = float(growth_model.predict(feature_vector)[0])
        yield_per_ha = max(0.1, round(yield_per_ha, 2))
        total_yield = round(yield_per_ha * area, 2)

        full_advisory = (
            f"{stage_advisory} At {das} days after sowing, expected yield is approximately "
            f"{yield_per_ha} Tonnes/ha, yielding a total of ~{total_yield} Tonnes across {area} hectare(s)."
        )

        return jsonify({
            "status": "success",
            "crop": crop,
            "growth": growth_stage,
            "growth_stage": growth_stage,
            "yield": f"{total_yield} Tonnes",
            "yield_per_ha": yield_per_ha,
            "yield_per_hectare": yield_per_ha,
            "total_yield": total_yield,
            "predicted_yield_tonnes": total_yield,
            "estimated_yield": f"{total_yield} Tonnes ({yield_per_ha} Tonnes/ha)",
            "area": area,
            "days": das,
            "temperature": temperature,
            "rainfall": rainfall,
            "stage_advisory": stage_advisory,
            "advisory": full_advisory,
            "units": {
                "yield": "Tonnes",
                "yield_per_ha": "Tonnes/ha",
                "area": "Hectares (ha)"
            }
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "error": f"Crop growth prediction failed: {str(e)}"
        }), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting Smart Farm AI Backend on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=True)
