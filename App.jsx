import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Features from "./pages/Features.jsx";
import CropRecommendation from "./pages/CropRecommendation.jsx";
import FeatureDetail from "./pages/FeatureDetail.jsx";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<Features />} />
        <Route
          path="/features/crop-recommendation"
          element={<CropRecommendation />}
        />
        <Route
          path="/features/soil-analysis"
          element={<FeatureDetail feature="soil-analysis" />}
        />
        <Route
          path="/features/weather"
          element={<FeatureDetail feature="weather" />}
        />
        <Route
          path="/features/disease-detection"
          element={<FeatureDetail feature="disease-detection" />}
        />
        <Route
          path="/features/growth-prediction"
          element={<FeatureDetail feature="growth-prediction" />}
        />
        <Route
          path="/features/cost-profit"
          element={<FeatureDetail feature="cost-profit" />}
        />
        <Route
          path="/features/ai-assistant"
          element={<FeatureDetail feature="ai-assistant" />}
        />
        <Route path="/crop-recommendation" element={<CropRecommendation />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
