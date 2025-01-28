import Image from "next/image";

export default function NavBar() {
  return (
    <nav className="navbar" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <a className="navbar-item" href="/">
          <Image
            className="rounded-full"
            src={"/logo.png"}
            alt="Logo Image"
            width={32}
            height={32}
          />
          <span className="title">GoodOnyx</span>
        </a>
      </div>

      <div className="navbar-menu">
        {/* <div className="navbar-start">
          <a className="navbar-item">Home</a>

          <a className="navbar-item">Documentation</a>

          <div className="navbar-item has-dropdown is-hoverable">
            <a className="navbar-link">More</a>

            <div className="navbar-dropdown">
              <a className="navbar-item">About</a>
              <a className="navbar-item is-selected">Jobs</a>
              <a className="navbar-item">Contact</a>
              <hr className="navbar-divider" />
              <a className="navbar-item">Report an issue</a>
            </div>
          </div>
        </div> */}

        {/* <div className="navbar-end">
          <div className="navbar-item"></div>
        </div> */}
      </div>
    </nav>
  );
}
