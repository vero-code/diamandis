import '../styles/footer.css';

export function Footer() {
  return (
    <footer className="app-footer">
      <p>
        <strong>DIAMANDIS</strong> © {new Date().getFullYear()} · Author:
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
