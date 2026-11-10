import { useState } from "react";
import {
  Apple,
  ArrowRight,
  ChartNoAxesCombined,
  Leaf,
  Sprout,
  Waves,
} from "lucide-react";
import { Link } from "react-router-dom";

function BrandStamp() {
  return (
    <Link className="brand auth-brand" to="/">
      <span className="brand-mark">
        <Leaf size={21} />
      </span>
      <span className="brand-copy">
        <strong>SMART FARM AI</strong>
        <small>
          DATA TODAY <i /> BETTER TOMORROW
        </small>
      </span>
    </Link>
  );
}
export default function Signup() {
  const [success, setSuccess] = useState(false);
  const submit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const repeatPassword = form.elements.repeatPassword;
    repeatPassword.setCustomValidity(
      form.elements.password.value === repeatPassword.value
        ? ""
        : "Passwords must match.",
    );
    if (form.reportValidity()) setSuccess(true);
  };
  return (
    <main className="auth-page scenic-page">
      <div className="auth-layout page-width">
        <section className="auth-story">
          <BrandStamp />
          <div className="auth-story-copy">
            <span className="eyebrow">
              <span className="eyebrow-dot" /> YOUR FARM, WITH A CLEARER VIEW
            </span>
            <h1>
              Let's Get <em>Started</em>
            </h1>
            <p>
              Bring your farm data and AI together. Get useful insights to help
              you grow with confidence, season after season.
            </p>
            <div className="auth-benefits">
              <div>
                <Sprout size={17} />
                <span>Better Crop Yield</span>
              </div>
              <div>
                <ChartNoAxesCombined size={17} />
                <span>Data Driven Insights</span>
              </div>
              <div>
                <Waves size={17} />
                <span>Sustainable Farming</span>
              </div>
            </div>
          </div>
          <span className="auth-side-caption">
            ROOTED IN THE FIELD. READY FOR WHAT'S NEXT.
          </span>
        </section>
        <section className="auth-form-side">
          <form
            className="auth-form"
            onSubmit={submit}
            onChange={(event) =>
              event.currentTarget.elements.repeatPassword.setCustomValidity("")
            }
          >
            <span className="form-kicker">CREATE YOUR ACCOUNT</span>
            <h2>Sign Up</h2>
            <p className="auth-form-desc">
              Start making more informed farm decisions.
            </p>
            <label>
              Your name
              <input
                name="name"
                autoComplete="name"
                placeholder="Your full name"
                required
              />
            </label>
            <label>
              Your Email
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
            </label>
            <label>
              Create Password
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                minLength="8"
                required
              />
            </label>
            <label>
              Repeat password
              <input
                name="repeatPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Enter your password again"
                minLength="8"
                required
              />
            </label>
            <button className="button auth-submit" type="submit">
              Sign Up <ArrowRight size={17} />
            </button>
            {success && (
              <p className="success-message" role="status">
                Your account form is ready. Authentication can be connected
                here.
              </p>
            )}
            <div className="auth-divider">
              <span />
              or continue with
              <span />
            </div>
            <div className="social-buttons">
              <button type="button" aria-label="Continue with Google">
                G
              </button>
              <button type="button" aria-label="Continue with Facebook">
                f
              </button>
              <button type="button" aria-label="Continue with Apple">
                <Apple size={16} strokeWidth={1.8} />
              </button>
            </div>
            <p className="auth-switch">
              Already a Member? <Link to="/login">Log in here</Link>
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
