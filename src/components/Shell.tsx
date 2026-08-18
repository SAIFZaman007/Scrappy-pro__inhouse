import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut, Radio } from "lucide-react";
import { token } from "../lib/api";

const NAV = [
  { to: "/", label: "New run", end: true },
  { to: "/runs", label: "History", end: false },
];

export default function Shell() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-ink text-white">
        <div className="mx-auto max-w-[1400px] px-6 h-14 flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <Radio size={18} className="text-signal" aria-hidden />
            <span className="font-display font-bold tracking-tight text-[15px]">
              Scrappy Pro
            </span>
          </div>

          <nav className="flex items-center gap-1 flex-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `px-3 py-1.5 text-[13px] font-medium rounded-[3px] transition-colors ${
                    isActive
                      ? "bg-white/12 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/8"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            className="flex items-center gap-2 text-[13px] text-white/60 hover:text-white"
            onClick={() => {
              token.clear();
              navigate("/sign-in");
            }}
          >
            <LogOut size={14} aria-hidden />
            Sign out
          </button>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-[1400px] w-full px-6 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-line py-4">
        <p className="mx-auto max-w-[1400px] px-6 text-[12px] text-muted">
          Collects publicly listed product data at a rate limited, robots-aware pace.
          Check each retailer's terms before running large jobs.
        </p>
      </footer>
    </div>
  );
}
