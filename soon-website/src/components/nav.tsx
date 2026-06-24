export default function Nav() {
  return (
    <nav className="flex w-full items-center justify-between px-6 py-4 tracking-body text-background">
      <span className="font-small">Logo</span>
      <div className="hidden items-center gap-10 md:flex">
        <a href="#soon" className="hover:opacity-70">
          Soon
        </a>
        <a href="#hackathon" className="hover:opacity-70">
          Hackathon
        </a>
        <a href="#navbar" className="hover:opacity-70">
          Navbar
        </a>
        <a href="#about" className="hover:opacity-70">
          About
        </a>
      </div>
    </nav>
  );
}
