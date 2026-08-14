import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="mt-24 border-t bg-sunken/60">
      <div className="shell flex flex-col gap-8 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-3 text-sm leading-relaxed text-muted">
            A full-stack property marketplace built as an academic project.
            Listings and accounts are real records in its own database, not a
            live agency.
          </p>
        </div>

        <nav className="flex gap-12 sm:gap-16" aria-label="Footer">
          <div className="flex flex-col gap-3">
            <h2 className="text-[0.8125rem] font-medium text-ink">Browse</h2>
            <Link
              to="/search?type=rent"
              className="text-sm text-muted hover:text-ink"
            >
              For rent
            </Link>
            <Link
              to="/search?type=sale"
              className="text-sm text-muted hover:text-ink"
            >
              For sale
            </Link>
            <Link
              to="/search?offer=true"
              className="text-sm text-muted hover:text-ink"
            >
              With offers
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="text-[0.8125rem] font-medium text-ink">Project</h2>
            <Link to="/about" className="text-sm text-muted hover:text-ink">
              About
            </Link>
            <Link
              to="/about#contact"
              className="text-sm text-muted hover:text-ink"
            >
              Contact
            </Link>
            <Link
              to="/create-listing"
              className="text-sm text-muted hover:text-ink"
            >
              List a property
            </Link>
            <Link to="/showcase" className="text-sm text-muted hover:text-ink">
              Screens
            </Link>
          </div>
        </nav>
      </div>

      <div className="shell flex flex-col gap-2 border-t py-6 text-[0.8125rem] text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>CasaConnect. Built with React, Express and MongoDB.</p>
        <p>Property photography from Unsplash.</p>
      </div>
    </footer>
  );
}
