import { Link } from "react-router-dom";
import { useSeo } from "../seo";

// Unknown URLs used to redirect to the homepage, which Google indexed as copies of it.
export default function NotFound() {
  useSeo({ title: "Page not found | FineAnswer Study Abroad", noindex: true });
  return (
    <main style={{ padding: "120px 16px", textAlign: "center" }}>
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist or has moved.</p>
      <Link to="/">Go to the homepage</Link>
    </main>
  );
}
