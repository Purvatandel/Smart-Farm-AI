import { Leaf } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <Link className="brand footer-brand" to="/">
        <span className="brand-mark">
          <Leaf size={19} />
        </span>
        <span className="brand-copy">
          <strong>SMART FARM AI</strong>
          <small>
            DATA TODAY <i /> BETTER TOMORROW
          </small>
        </span>
      </Link>
      <p>Thoughtful technology for a more resilient harvest.</p>
      <span className="footer-copy">© 2026 Smart Farm AI</span>
    </footer>
  );
}
