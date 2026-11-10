import { useState } from "react";
import { ArrowRight, Leaf } from "lucide-react";
import { Link } from "react-router-dom";

export default function Login() {
  const [success, setSuccess] = useState(false);
  return (
    <main className="auth-page scenic-page">
      <div className="login-layout page-width">
        <div className="login-brand">
          <Link className="brand" to="/">
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
        </div>
        <form
          className="auth-form login-form"
          onSubmit={(event) => {
            event.preventDefault();
            setSuccess(true);
          }}
        >
          <span className="form-kicker">WELCOME BACK</span>
          <h1>
            Good to see <em>you again.</em>
          </h1>
          <p className="auth-form-desc">
            Log in to continue exploring your farm insights.
          </p>
          <label>
            Your Email
            <input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              required
            />
          </label>
          <button className="button auth-submit" type="submit">
            Log in <ArrowRight size={17} />
          </button>
          {success && (
            <p className="success-message" role="status">
              Login is ready to connect to your authentication service.
            </p>
          )}
          <p className="auth-switch">
            New to Smart Farm AI? <Link to="/signup">Create an account</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
