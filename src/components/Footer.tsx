export function Footer() {
  return (
    <footer className="app-footer">
      <p>
        © {new Date().getFullYear()} <strong>DIAMANDIS</strong> · Created by
        <a href="https://github.com/vero-code/diamandis" target="_blank" rel="noreferrer">
          {' '}
          Veronika Kashtanova
        </a>
      </p>
      <p>
        <a href="#/privacy">Privacy Policy</a> · <a href="#/terms">Terms of Use</a>
      </p>
    </footer>
  );
}
