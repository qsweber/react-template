import { Link } from "react-router-dom";
import { Section } from "../components/Section";

export const NotFound = () => (
  <div>
    <h2>Nothing to see here!</h2>
    <Section>
      <Link to="/">Go to the home page</Link>
    </Section>
  </div>
);
