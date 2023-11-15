import { Outlet, NavLink } from "react-router-dom";

import styled from "@emotion/styled";

const Container = styled.div(() => ({
  maxWidth: 800,
  margin: "0 auto",
  fontFamily: "Work Sans",
}));

const NavBar = styled.div(() => ({
  display: "flex",
  justifyContent: "space-between",
  padding: "20px 0",
}));

const Initials = styled.div(() => ({
  textAlign: "left",
  fontWeight: "600",
  fontSize: 36,
}));

const LinkGroup = styled.nav(() => ({
  margin: "auto 0", // centers it vertically within NavBar
}));

const SpacedNavLink = styled(NavLink)(() => ({
  marginLeft: 20,
  textDecoration: "none",
  color: "inherit",
  fontWeight: "600",
}));

const Footer = styled.footer(() => ({
  marginTop: 20,
}));

export const Layout = () => (
  <Container>
    <NavBar>
      <Initials>Title</Initials>
      <LinkGroup>
        <SpacedNavLink
          style={({ isActive }) => ({
            textDecoration: isActive ? "underline" : "none",
          })}
          to="/"
        >
          Home
        </SpacedNavLink>
        <SpacedNavLink
          style={({ isActive }) => ({
            textDecoration: isActive ? "underline" : "none",
          })}
          to="another"
        >
          Another
        </SpacedNavLink>
      </LinkGroup>
    </NavBar>
    <Outlet />
    <Footer>
      <p>Thanks for visiting!</p>
    </Footer>
  </Container>
);
