import { createContext, useContext, useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  Clock3,
  Download,
  FilePlus2,
  LockKeyhole,
  LogOut,
  MessageCircle,
  Moon,
  Search,
  Send,
  ShieldCheck,
  Sun,
  Trash2,
} from "lucide-react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import api, {
  clearTokens,
  hasAccessToken,
  setAuthFailureHandler,
  setTokens,
} from "./api.js";

const AuthContext = createContext(null);
const statuses = ["Open", "In Review", "Resolved"];

function useAuth() {
  return useContext(AuthContext);
}

function explainError(error) {
  const data = error.response?.data;
  if (typeof data?.detail === "string") return data.detail;
  if (data && typeof data === "object") {
    const first = Object.values(data).flat()[0];
    if (typeof first === "string") return first;
  }
  return "Something went wrong. Please try again.";
}

function App() {
  const [authenticated, setAuthenticated] = useState(hasAccessToken);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("complaints-theme") === "dark",
  );

  useEffect(() => {
    setAuthFailureHandler(() => setAuthenticated(false));
    return () => setAuthFailureHandler(() => {});
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("complaints-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const login = (tokens) => {
    setTokens(tokens);
    setAuthenticated(true);
  };
  const logout = () => {
    clearTokens();
    setAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ authenticated, login, logout }}>
      <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
        <Header darkMode={darkMode} onToggleTheme={() => setDarkMode((value) => !value)} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/complaints" element={<StaffComplaintsPage />} />
          <Route path="/lodge" element={<LodgePage />} />
          <Route path="/admin/login" element={authenticated ? <Navigate to="/admin" replace /> : <AdminLoginPage />} />
          <Route
            path="/admin"
            element={authenticated ? <AdminPage /> : <Navigate to="/admin/login" replace />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </div>
    </AuthContext.Provider>
  );
}

function Header({ darkMode, onToggleTheme }) {
  const { authenticated, logout } = useAuth();
  const { pathname } = useLocation();
  const isAdminPage = pathname === "/admin";
  const isAdminLoginPage = pathname === "/admin/login";
  const brand = (
    <>
      <img
        src="/ojo-local-government-logo.png"
        alt="Ojo Local Government Lagos State"
        className="h-12 w-14 rounded-lg bg-white object-contain"
      />
      <span>
        <span className="block text-xs font-bold tracking-tight sm:text-sm">Ojo Local Government</span>
        <span className="block text-[10px] text-slate-500 dark:text-slate-400 sm:text-xs">Secretariat Complaint Desk</span>
      </span>
    </>
  );

  return (
    <header className="border-b border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        {isAdminLoginPage ? (
          <div className="flex items-center gap-3">{brand}</div>
        ) : (
          <Link to="/" className="flex items-center gap-3">{brand}</Link>
        )}
        <nav className="flex items-center gap-2 sm:gap-4" aria-label="Main navigation">
          {!isAdminLoginPage && (
            <Link className="button-primary !px-3 !py-2 text-sm sm:!px-4" to="/lodge">
              <FilePlus2 size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Lodge a complaint</span>
              <span className="sm:hidden">Lodge</span>
            </Link>
          )}
          {authenticated && isAdminPage && (
            <button className="icon-button" onClick={logout} title="Log out" aria-label="Log out">
              <LogOut size={18} />
            </button>
          )}
          <button
            className="icon-button"
            onClick={onToggleTheme}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>
      </div>
    </header>
  );
}

function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 md:grid-cols-[1fr_0.85fr] md:py-20 lg:px-8">
          <div>
            <p className="eyebrow"><span className="size-2 rounded-full bg-emerald-400" /> Ojo Local Government</p>
            <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Your community.<br />Your voice. <span className="text-emerald-300">A better way forward.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-emerald-50/80 sm:text-lg">
              The Ojo Local Government Secretariat Complaint Desk makes it easy for staff to raise concerns, reach the right department, and follow progress toward a resolution.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link className="button-light" to="/lodge">
                <FilePlus2 size={17} /> Lodge a complaint
              </Link>
              <a className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-50 hover:text-white" href="#how-it-works">
                How it works <ArrowRight size={16} />
              </a>
              <Link className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-50 hover:text-white" to="/complaints">
                View complaints <MessageCircle size={16} />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-emerald-50/80 sm:text-sm">
              <span className="inline-flex items-center gap-2"><Check size={15} /> No account needed</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck size={15} /> Share anonymously</span>
            </div>
          </div>

          <div className="mx-auto w-full max-w-lg">
            <div className="overflow-hidden rounded-2xl border border-white/25 bg-white text-slate-900 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-red-300" />
                  <span className="size-2.5 rounded-full bg-amber-300" />
                  <span className="size-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[11px] font-medium text-slate-500">Complaint desk preview</span>
                <Building2 size={15} className="text-emerald-700" />
              </div>
              <div className="p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">Community concerns</p>
                    <p className="mt-1 text-sm font-semibold">Complaint space</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-800">Updates</span>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge bg-blue-50 text-blue-800 ring-blue-200"><span className="size-1.5 rounded-full bg-current" /> In Review</span>
                    <span className="badge-neutral"><Building2 size={12} /> Public Works</span>
                  </div>
                  <h2 className="mt-3 text-sm font-semibold">Street lighting near the community centre</h2>
                  <p className="mt-1.5 text-xs leading-5 text-slate-500">Several lights along the access road are not working. Please review the area when possible.</p>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] text-slate-500">
                    <span className="inline-flex items-center gap-1"><Clock3 size={12} /> Status updates</span>
                    <span className="inline-flex items-center gap-1"><MessageCircle size={12} /> Follow the conversation</span>
                  </div>
                </div>
                <p className="mt-3 text-center text-[10px] text-slate-400">Example preview — actual complaints remain in the complaint desk.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl scroll-mt-8 px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow text-emerald-700 dark:text-emerald-400">Straightforward and accessible</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">A clear path from concern to action</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Share what is happening. The secretariat routes your complaint to the relevant department and keeps you informed as it is reviewed.
          </p>
        </div>
        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {[
            { number: "01", title: "Tell us what happened", text: "Lodge your concern in a few simple steps. No staff account or sign-up is needed." },
            { number: "02", title: "Reach the right team", text: "Choose the department your complaint is about so it can be directed appropriately." },
            { number: "03", title: "Follow progress", text: "Check status updates and read replies as the secretariat works on your concern." },
          ].map((step) => (
            <article className="panel p-5 sm:p-6" key={step.number}>
              <span className="inline-flex size-9 items-center justify-center rounded-xl bg-emerald-100 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">{step.number}</span>
              <h3 className="mt-4 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-16 lg:px-8">
        <div className="flex flex-col justify-between gap-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950/40 sm:flex-row sm:items-center sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-800 dark:bg-slate-900 dark:text-emerald-300"><ShieldCheck size={22} /></span>
            <div>
              <h2 className="font-semibold">Your privacy matters</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">You can choose to hide your name when lodging a complaint. Your name will not appear in public complaint information.</p>
            </div>
          </div>
          <Link className="button-primary shrink-0" to="/lodge">Get started <ArrowRight size={16} /></Link>
        </div>
      </section>
    </main>
  );
}

function StaffComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadComplaints = async () => {
    setError("");
    try {
      const { data } = await api.get("/complaints/");
      setComplaints(data);
    } catch (reason) {
      setError(explainError(reason));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const filteredComplaints = selectedStatus
    ? complaints.filter((complaint) => complaint.status === selectedStatus)
    : complaints;
  const attendedCount = complaints.filter((complaint) => complaint.status !== "Open").length;
  const filters = [
    { label: "All complaints", value: "", count: complaints.length },
    ...statuses.map((status) => ({
      label: status === "In Review" ? "In review" : status,
      value: status,
      count: complaints.filter((complaint) => complaint.status === status).length,
    })),
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow text-emerald-700 dark:text-emerald-400">Staff complaint updates</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Complaints and progress</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Browse concerns submitted to the secretariat and see which have been picked up for review or resolved.
          </p>
        </div>
        <Link className="button-primary shrink-0" to="/lodge">
          <FilePlus2 size={16} /> Lodge a complaint
        </Link>
      </div>

      <section className="mt-7 grid gap-3 sm:grid-cols-3" aria-label="Complaint status totals">
        <StatusSummary label="All complaints" count={complaints.length} />
        <StatusSummary label="Attended to" count={attendedCount} description="In review or resolved" />
        <StatusSummary label="Resolved" count={filters.find((filter) => filter.value === "Resolved").count} />
      </section>

      <section className="mt-9">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Complaint list</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Select a status to see its updates and comments.</p>
        </div>
        <div className="mb-5 flex flex-wrap gap-2" aria-label="Filter complaints by status">
          {filters.map((filter) => (
            <button
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium ${
                selectedStatus === filter.value
                  ? "border-emerald-700 bg-emerald-700 text-white dark:border-emerald-600 dark:bg-emerald-600"
                  : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              }`}
              key={filter.value || "all"}
              type="button"
              aria-pressed={selectedStatus === filter.value}
              onClick={() => setSelectedStatus(filter.value)}
            >
              {filter.label}
              <span className="text-xs opacity-75">{filter.count}</span>
            </button>
          ))}
        </div>

        {error && <ErrorBanner message={error} />}
        {loading ? <LoadingMessage /> : filteredComplaints.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredComplaints.map((complaint) => (
              <ComplaintCard key={complaint.id} complaint={complaint} onChanged={loadComplaints} />
            ))}
          </div>
        ) : !error ? (
          <div className="panel px-6 py-12 text-center">
            <MessageCircle className="mx-auto text-slate-400" size={24} />
            <h3 className="mt-3 font-semibold">{complaints.length ? "No complaints with this status" : "No complaints yet"}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {complaints.length ? "Choose another status to see more complaints." : "New complaints will appear here once they have been submitted."}
            </p>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function StatusSummary({ label, count, description }) {
  return (
    <div className="panel p-4">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{count}</p>
      {description && <p className="mt-1 text-xs text-slate-400">{description}</p>}
    </div>
  );
}

function ComplaintCard({ complaint, admin = false, onChanged }) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState(complaint);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [comment, setComment] = useState({ author_name: "", text: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const toggleDetails = async () => {
    const next = !expanded;
    setExpanded(next);
    if (next && !detail.comments) {
      setLoadingDetail(true);
      try {
        const { data } = await api.get(`/complaints/${complaint.id}/`);
        setDetail(data);
      } catch (reason) {
        setError(explainError(reason));
      } finally {
        setLoadingDetail(false);
      }
    }
  };

  const addComment = async (event) => {
    event.preventDefault();
    if (!comment.text.trim()) return;
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post(`/complaints/${complaint.id}/comments/`, comment);
      setDetail((current) => ({ ...current, comments: [...(current.comments || []), data] }));
      setComment({ author_name: "", text: "" });
    } catch (reason) {
      setError(explainError(reason));
    } finally {
      setBusy(false);
    }
  };

  const addAdminReply = async (event) => {
    event.preventDefault();
    if (!comment.text.trim()) return;
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post(`/complaints/${complaint.id}/admin-reply/`, comment);
      setDetail((current) => ({ ...current, comments: [...(current.comments || []), data] }));
      setComment({ author_name: "", text: "" });
    } catch (reason) {
      setError(explainError(reason));
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="panel overflow-hidden">
      <button className="w-full p-5 text-left sm:p-6" onClick={toggleDetails} aria-expanded={expanded}>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={complaint.status} />
          <span className="badge-neutral"><Building2 size={13} /> {complaint.department_name || complaint.department_display || complaint.department}</span>
        </div>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold leading-snug">{complaint.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{complaint.details}</p>
          </div>
          {expanded ? <ChevronUp className="mt-1 shrink-0 text-slate-400" size={19} /> : <ChevronDown className="mt-1 shrink-0 text-slate-400" size={19} />}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5"><Clock3 size={14} /> {formatDate(complaint.created_at)}</span>
          {admin && complaint.submitted_by_name && <span>Submitted by {complaint.submitted_by_name}</span>}
          {complaint.is_anonymous && <span className="inline-flex items-center gap-1"><ShieldCheck size={13} /> Anonymous</span>}
          <span className="inline-flex items-center gap-1"><MessageCircle size={14} /> {detail.comments?.length ?? complaint.comments?.length ?? 0}</span>
        </div>
      </button>
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-5 dark:border-slate-800 dark:bg-slate-900/50 sm:px-6">
          {loadingDetail ? <LoadingMessage /> : (
            <>
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">{detail.details}</p>
              {admin && <AdminComplaintActions complaint={complaint} onChanged={onChanged} />}
              <div className="mt-5 space-y-3">
                <h4 className="text-sm font-semibold">Conversation</h4>
                {detail.comments?.length ? detail.comments.map((item) => <CommentItem key={item.id} comment={item} />) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No comments yet. Start the conversation.</p>
                )}
              </div>
              <form className="mt-5 space-y-3" onSubmit={admin ? addAdminReply : addComment}>
                <label className="block">
                  <span className="sr-only">{admin ? "Admin name" : "Your name (optional)"}</span>
                  <input
                    className="field"
                    maxLength={100}
                    value={comment.author_name}
                    onChange={(event) => setComment((current) => ({ ...current, author_name: event.target.value }))}
                    placeholder={admin ? "Admin name (optional)" : "Your name (optional)"}
                  />
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <label className="min-w-0 flex-1">
                    <span className="sr-only">{admin ? "Write an admin reply" : "Write a comment"}</span>
                    <input
                      className="field"
                      maxLength={2000}
                      required
                      value={comment.text}
                      onChange={(event) => setComment((current) => ({ ...current, text: event.target.value }))}
                      placeholder={admin ? "Write an official reply..." : "Add a comment..."}
                    />
                  </label>
                  <button disabled={busy} className="button-primary disabled:opacity-60" type="submit">
                    <Send size={15} /> {admin ? "Reply" : "Comment"}
                  </button>
                </div>
              </form>
              {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
            </>
          )}
        </div>
      )}
    </article>
  );
}

function AdminComplaintActions({ complaint, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const updateStatus = async (event) => {
    const status = event.target.value;
    setBusy(true);
    setError("");
    try {
      await api.patch(`/admin/complaints/${complaint.id}/`, { status });
      onChanged();
    } catch (reason) {
      setError(explainError(reason));
    } finally {
      setBusy(false);
    }
  };

  const deleteComplaint = async () => {
    if (!window.confirm("Delete this complaint and all its comments? This cannot be undone.")) return;
    setBusy(true);
    setError("");
    try {
      await api.delete(`/admin/complaints/${complaint.id}/`);
      onChanged();
    } catch (reason) {
      setError(explainError(reason));
      setBusy(false);
    }
  };

  return (
    <div className="mt-5 flex flex-wrap items-center gap-3 border-y border-slate-200 py-4 dark:border-slate-700">
      <label className="flex items-center gap-2 text-sm font-medium">
        Status
        <select className="field !w-auto py-2" value={complaint.status} onChange={updateStatus} disabled={busy}>
          {statuses.map((status) => <option key={status}>{status}</option>)}
        </select>
      </label>
      <button className="button-danger ml-auto" onClick={deleteComplaint} disabled={busy}>
        <Trash2 size={15} /> Delete
      </button>
      {error && <p className="w-full text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

function LodgePage() {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    title: "",
    details: "",
    department: "",
    submitted_by_name: "",
    submitter_department: "",
    is_anonymous: false,
  });
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/departments/").then(({ data }) => setDepartments(data)).catch((reason) => setError(explainError(reason)));
  }, []);

  const updateField = (event) => {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/complaints/", form);
      setSubmitted(data);
      setForm({
        title: "",
        details: "",
        department: "",
        submitted_by_name: "",
        submitter_department: "",
        is_anonymous: false,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (reason) {
      setError(explainError(reason));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Link to="/" className="back-link"><ArrowDown className="rotate-90" size={15} /> Back to complaint space</Link>
      <div className="mt-6">
        <p className="eyebrow text-emerald-700 dark:text-emerald-400">Make a difference</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Lodge a complaint</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Tell us what happened. Your concern will be shared with the department best placed to help.</p>
      </div>
      {submitted && (
        <div className="mt-6 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200" role="status">
          <Check className="mt-0.5 shrink-0" size={20} />
          <div>
            <p className="font-semibold">Your complaint has been received.</p>
            <p className="mt-1 text-sm">“{submitted.title}” is now open. You can follow updates in the complaint space.</p>
            <Link className="mt-2 inline-flex items-center gap-1 text-sm font-semibold underline" to="/">View complaint space <ArrowUpRight size={14} /></Link>
          </div>
        </div>
      )}
      <form className="panel mt-6 space-y-5 p-5 sm:p-7" onSubmit={submit}>
        <label className="block">
          <span className="label">Department the complaint is about</span>
          <select className="field" name="department" value={form.department} onChange={updateField} required>
            <option value="">Choose a department</option>
            {departments.map((department) => <option value={department.id} key={department.id}>{department.name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="label">Complaint title</span>
          <input className="field" name="title" value={form.title} onChange={updateField} maxLength={200} required placeholder="A short summary of your concern" />
        </label>
        <label className="block">
          <span className="label">What happened?</span>
          <textarea className="field min-h-36 resize-y" name="details" value={form.details} onChange={updateField} maxLength={5000} required placeholder="Share the details that will help us understand and address your concern." />
          <span className="mt-1 block text-right text-xs text-slate-400">{form.details.length}/5000</span>
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="label">Your name <span className="font-normal text-slate-400">(optional)</span></span>
            <input className="field" name="submitted_by_name" value={form.submitted_by_name} onChange={updateField} maxLength={100} placeholder="Name" />
          </label>
          <label className="block">
            <span className="label">Your department <span className="font-normal text-slate-400">(optional)</span></span>
            <input className="field" name="submitter_department" value={form.submitter_department} onChange={updateField} maxLength={100} placeholder="Department or unit" />
          </label>
        </div>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <input className="mt-1 size-4 accent-emerald-700" type="checkbox" name="is_anonymous" checked={form.is_anonymous} onChange={updateField} />
          <span>
            <span className="block text-sm font-semibold">Hide my name</span>
            <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">Your name will be kept private from public views. Admins can still see it to follow up if needed.</span>
          </span>
        </label>
        {error && <ErrorBanner message={error} />}
        <div className="flex flex-col-reverse justify-between gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row sm:items-center">
          <span className="text-xs text-slate-500 dark:text-slate-400">Your complaint will be marked as Open.</span>
          <button className="button-primary" type="submit" disabled={busy}>
            {busy ? "Sending..." : "Submit complaint"} <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </main>
  );
}

function AdminLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { data } = await api.post("/auth/login/", credentials);
      login(data);
      navigate("/admin", { replace: true });
    } catch (reason) {
      setError(reason.response?.status === 401 ? "Invalid admin credentials." : explainError(reason));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-14 sm:px-6 sm:py-20">
      <div className="panel p-6 sm:p-8">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <LockKeyhole size={22} />
        </div>
        <p className="eyebrow mt-6 text-emerald-700 dark:text-emerald-400">Administrator access</p>
        <h1 className="mt-2 text-2xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Use your secretariat admin account to manage complaints.</p>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <label className="block">
            <span className="label">Username</span>
            <input className="field" autoComplete="username" value={credentials.username} onChange={(event) => setCredentials({ ...credentials, username: event.target.value })} required />
          </label>
          <label className="block">
            <span className="label">Password</span>
            <input className="field" type="password" autoComplete="current-password" value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} required />
          </label>
          {error && <ErrorBanner message={error} />}
          <button className="button-primary w-full justify-center" type="submit" disabled={busy}>{busy ? "Signing in..." : "Sign in"} <ArrowRight size={16} /></button>
        </form>
      </div>
    </main>
  );
}

function AdminPage() {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState(null);
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState({ department: "", status: "", search: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const refresh = () => setApplied({ ...applied });
  const exportComplaints = async () => {
    setExporting(true);
    setError("");
    try {
      const { data } = await api.get("/admin/complaints/export/", {
        params: applied,
        responseType: "blob",
      });
      const downloadUrl = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `ojo-complaints-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (reason) {
      setError(explainError(reason));
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    api.get("/departments/").then(({ data }) => setDepartments(data)).catch((reason) => setError(explainError(reason)));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([
      api.get("/admin/complaints/", { params: applied }),
      api.get("/admin/stats/"),
    ])
      .then(([complaintResponse, statsResponse]) => {
        if (active) {
          setComplaints(complaintResponse.data);
          setStats(statsResponse.data);
        }
      })
      .catch((reason) => {
        if (active) setError(explainError(reason));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [applied]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow text-emerald-700 dark:text-emerald-400"><ShieldCheck size={14} /> Admin workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Complaint overview</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Review, respond to, and track community concerns.</p>
        </div>
        <span className="text-sm text-slate-500 dark:text-slate-400">{stats?.total ?? 0} total complaints</span>
      </div>

      {stats && (
        <>
          <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Total complaints" value={stats.total} icon={<MessageCircle size={18} />} />
            <StatCard label="Open" value={stats.by_status.Open} tone="amber" icon={<CircleHelp size={18} />} />
            <StatCard label="In review" value={stats.by_status["In Review"]} tone="blue" icon={<Clock3 size={18} />} />
            <StatCard label="Resolved" value={stats.by_status.Resolved} tone="green" icon={<Check size={18} />} />
          </div>
          <section className="panel mt-5 p-5 sm:p-6">
            <h2 className="font-semibold">Complaints by department</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {stats.by_department.map((item) => (
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70" key={item.id}>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{item.name}</p>
                  <p className="mt-1 text-lg font-semibold">{item.complaint_count}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      <section className="mt-9">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">All complaints</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Private names are visible to admins only.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 dark:text-slate-400">{complaints.length} shown</span>
            <button className="button-secondary" type="button" onClick={exportComplaints} disabled={exporting}>
              <Download size={16} /> {exporting ? "Exporting..." : "Export CSV"}
            </button>
          </div>
        </div>
        <form
          className="panel mb-5 grid gap-3 p-4 md:grid-cols-[1fr_0.72fr_0.72fr_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            setApplied({ department, status, search });
          }}
        >
          <label className="relative">
            <span className="sr-only">Search complaints</span>
            <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="field pl-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search concerns..." />
          </label>
          <label>
            <span className="sr-only">Filter by department</span>
            <select className="field" value={department} onChange={(event) => setDepartment(event.target.value)}>
              <option value="">All departments</option>
              {departments.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">Filter by status</span>
            <select className="field" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">All statuses</option>
              {statuses.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <button className="button-secondary" type="submit">Apply filters</button>
        </form>
        {error && <ErrorBanner message={error} />}
        {loading ? <LoadingMessage /> : complaints.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {complaints.map((complaint) => <ComplaintCard key={complaint.id} complaint={complaint} admin onChanged={refresh} />)}
          </div>
        ) : !error ? <EmptyState admin /> : null}
      </section>
    </main>
  );
}

function StatCard({ label, value, icon, tone = "slate" }) {
  const colors = {
    slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  };
  return (
    <div className="panel p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 sm:text-sm">{label}</span>
        <span className={`flex size-8 items-center justify-center rounded-lg ${colors[tone]}`}>{icon}</span>
      </div>
      <p className="mt-4 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Open: "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-900",
    "In Review": "bg-blue-50 text-blue-800 ring-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:ring-blue-900",
    Resolved: "bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-900",
  };
  return <span className={`badge ${styles[status] || styles.Open}`}><span className="size-1.5 rounded-full bg-current" /> {status}</span>;
}

function CommentItem({ comment }) {
  return (
    <div className={`rounded-xl p-3 ${comment.is_admin ? "bg-emerald-50 dark:bg-emerald-950/50" : "bg-white dark:bg-slate-800"}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold">{comment.is_admin ? comment.author_name || "Secretariat Admin" : comment.author_name || "Community member"}{comment.is_admin && <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">Official reply</span>}</span>
        <time className="text-[11px] text-slate-400">{formatDate(comment.created_at)}</time>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-5 text-slate-700 dark:text-slate-300">{comment.text}</p>
    </div>
  );
}

function EmptyState({ admin = false }) {
  return (
    <div className="panel flex flex-col items-center px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"><Search size={21} /></span>
      <h3 className="mt-4 font-semibold">No complaints found</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{admin ? "There are no complaints matching these filters." : "Try another search or be the first to share a concern."}</p>
    </div>
  );
}

function ErrorBanner({ message }) {
  return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200" role="alert">{message}</div>;
}

function LoadingMessage() {
  return <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400" role="status">Loading...</div>;
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <span>Ojo Local Government Secretariat Complaint Desk</span>
        <span>Your voice helps build a stronger community.</span>
      </div>
    </footer>
  );
}

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}

export default App;
