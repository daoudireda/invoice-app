import Container from "./container";

const Footer = () => {
  return (
    <footer className="mt-6 mb-8">
      <Container className="flex justify-between gap-4">
        <p className="text-sm">
          Invoicipedia &copy; {new Date().getFullYear()}
        </p>
        <p className="text-sm">
          Made with ❤️ by{" "}
          <a href="https://twitter.com/colbyfayock">Colby Fayock</a>
        </p>
      </Container>
    </footer>
  );
};

export default Footer;
