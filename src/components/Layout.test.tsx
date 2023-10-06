import React from "react";
import { render, screen } from "@testing-library/react";
import { Layout } from "./Layout";

test.skip("renders nav bar link to portfolio", () => {
  render(<Layout />);
  const linkElement = screen.getByText(/portfolio/i);
  expect(linkElement).toBeInTheDocument();
});
