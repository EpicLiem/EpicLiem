export default function ReaderShell({children}: {children:React.ReactNode}) {
  return <div className="page">
    <a className="skip-link" href="#main">Skip to passages</a>
    <header className="site-header"><a className="title" href="/">Leonardo, tomorrow</a><nav aria-label="Personal links"><a href="https://github.com/EpicLiem"><span aria-hidden="true">← </span>Back to GitHub</a><a href="https://epicliem.com">epicliem.com</a></nav></header>
    <noscript><p>Enable JavaScript to vote. If passages stay loading, <a href="https://github.com/EpicLiem">read today’s passage on GitHub</a>.</p></noscript>
    <main id="main" tabIndex={-1}>{children}</main>
    <footer className="site-footer"><p>From the notebooks,<br/>selected for their strangeness.</p><details><summary>About the passages &amp; voting</summary>
      <p>72 passages from Jean Paul Richter’s English edition of Leonardo’s notebooks. Original wording is preserved. The selection focuses on nature, perception, the body, and human behavior, and excludes the “Prophecies.” Each notebook link opens the original source.</p>
      <p>Tomorrow offers three passages from a rotating collection. Adjacent days have different choices; passages eventually return. The winning passage is fixed after midnight in New York. GitHub updates shortly afterward, subject to scheduled workflow delays. If nobody votes, the first passage is chosen.</p>
      <p>This site saves a signed browser cookie and your daily choice. No account or email is needed. Voting is limited to ten browsers per network each day. This is a casual vote, not an identity-verified election.</p>
      <a href="https://www.gutenberg.org/ebooks/5000">Read the complete notebooks</a>
    </details></footer>
  </div>;
}
