import { type FormEvent, type ReactNode, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Check,
  ChevronDown,
  CircleAlert,
  Clock3,
  Download,
  FileText,
  Filter,
  LockKeyhole,
  LogIn,
  Menu,
  MoreHorizontal,
  PlayCircle,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Upload,
  Users,
  WalletCards,
  X,
} from 'lucide-react';
import {
  getGetDashboardSummaryQueryKey,
  getGetPaperQueryKey,
  getListPapersQueryKey,
  useCreateUpload,
  useGetDashboardSummary,
  useGetPaper,
  useListPapers,
  useUnlockPaper,
} from '@workspace/api-client-react';
import type {
  DashboardSummary,
  Paper,
  UnlockInputMethod,
  UploadInput,
} from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Link, Route, Router as WouterRouter, Switch, useLocation, useParams } from 'wouter';
import './index.css';

const queryClient = new QueryClient();

const fallbackPapers: Paper[] = [
  { id: 'muk-eco-2023', courseCode: 'ECO 2101', courseName: 'Microeconomics II', faculty: 'Faculty of Business', university: 'Makerere University', year: 2023, downloads: 284, priceUgx: 1500, previewLabel: 'Market structures and elasticity', accent: '#2364AA', isTrending: true, pdfUrl: null },
  { id: 'kyu-csc-2022', courseCode: 'CSC 2203', courseName: 'Data Structures', faculty: 'Faculty of Science and Technology', university: 'Kyambogo', year: 2022, downloads: 196, priceUgx: 1000, previewLabel: 'Trees, graphs and complexity', accent: '#16877A', isTrending: true, pdfUrl: null },
  { id: 'mubs-acc-2021', courseCode: 'ACC 3102', courseName: 'Financial Reporting', faculty: 'Faculty of Business', university: 'MUBS', year: 2021, downloads: 143, priceUgx: 2000, previewLabel: 'Cash flow statements', accent: '#D68A20', isTrending: false, pdfUrl: null },
  { id: 'ucu-law-2023', courseCode: 'LAW 3204', courseName: 'Commercial Law', faculty: 'Faculty of Law', university: 'UCU', year: 2023, downloads: 121, priceUgx: 1500, previewLabel: 'Agency and sale of goods', accent: '#704C9F', isTrending: false, pdfUrl: null },
  { id: 'iuiu-edu-2025', courseCode: 'EDU 310', courseName: 'Development Studies', faculty: 'Faculty of Education', university: 'IUIU', year: 2025, downloads: 89, priceUgx: 2000, previewLabel: 'Primary health care systems', accent: '#C35C54', isTrending: false, pdfUrl: null },
  { id: 'muk-edu-2024', courseCode: 'EDU 2201', courseName: 'Education Psychology', faculty: 'Faculty of Education', university: 'Makerere University', year: 2024, downloads: 74, priceUgx: 1000, previewLabel: 'Learning, memory and motivation', accent: '#4C779B', isTrending: false, pdfUrl: null },
];

const universities = ['All universities', 'IUIU', 'Makerere University', 'MUBS', 'Kyambogo', 'UCU'];
const faculties = ['All faculties', 'Faculty of Business', 'Faculty of Science and Technology', 'Faculty of Law', 'Faculty of Education', 'Faculty of Social Sciences'];
const years = ['All years', '2025', '2024', '2023', '2022'];

function formatUgx(value: number) {
  return new Intl.NumberFormat('en-UG').format(value);
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 ${compact ? 'justify-center' : ''}`} data-testid="link-brand-home">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-accent text-accent-foreground shadow-sm">
        <BookOpen size={19} strokeWidth={2.5} />
      </span>
      {!compact && <span className="font-display text-[1.18rem] font-bold tracking-[-0.04em]">UgCampus <span className="text-primary/65">Papers</span></span>}
    </Link>
  );
}

function Header({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-[1320px] items-center justify-between px-4 sm:px-7">
        <div className="flex items-center gap-3">
          <button onClick={onMenu} className="grid h-10 w-10 place-items-center rounded-xl text-muted-foreground hover:bg-muted md:hidden" data-testid="button-open-menu" aria-label="Open navigation">
            <Menu size={21} />
          </button>
          <BrandMark />
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/upload" className="hidden items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-primary hover:bg-secondary sm:flex" data-testid="link-header-upload">
            <Plus size={16} /> Share a paper
          </Link>
          <Link href="/login" className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card text-primary hover:bg-secondary sm:flex sm:h-auto sm:w-auto sm:gap-2 sm:px-3 sm:py-2 sm:text-sm sm:font-semibold" data-testid="link-header-login">
            <LogIn size={17} /><span className="hidden sm:inline">Sign in</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

function SideNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [location] = useLocation();
  const items = [
    { href: '/', label: 'Find papers', icon: Search },
    { href: '/upload', label: 'Upload & earn', icon: Upload },
    { href: '/admin', label: 'Admin desk', icon: BarChart3 },
  ];
  return (
    <>
      {open && <button onClick={onClose} className="fixed inset-0 z-40 bg-[#14213d]/25 md:hidden" data-testid="button-close-menu-overlay" aria-label="Close navigation" />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[265px] -translate-x-full bg-sidebar px-4 py-5 text-sidebar-foreground shadow-xl transition-transform md:relative md:z-0 md:w-[224px] md:translate-x-0 md:shadow-none ${open ? 'translate-x-0' : ''}`}>
        <div className="mb-10 flex items-center justify-between px-2 md:mb-12">
          <BrandMark />
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-sidebar-foreground/65 hover:bg-sidebar-accent md:hidden" data-testid="button-close-menu" aria-label="Close navigation"><X size={17} /></button>
        </div>
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-sidebar-foreground/45">Library</p>
        <nav className="space-y-1" aria-label="Primary navigation">
          {items.map(({ href, label, icon: Icon }) => {
            const active = href === '/' ? location === '/' : location.startsWith(href);
            return <Link key={href} href={href} onClick={onClose} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${active ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground'}`} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}><Icon size={18} />{label}</Link>;
          })}
        </nav>
        <div className="mt-auto hidden rounded-2xl bg-sidebar-accent p-4 md:block">
          <div className="mb-3 grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-foreground"><Sparkles size={16} /></div>
          <p className="text-sm font-semibold text-sidebar-foreground">Earn as you study</p>
          <p className="mt-1 text-xs leading-5 text-sidebar-foreground/55">Share clean papers from your phone and build credits for the next one.</p>
          <Link href="/upload" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-accent" data-testid="link-sidebar-upload">Start sharing <ArrowRight size={13} /></Link>
        </div>
      </aside>
    </>
  );
}

function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return <div className="min-h-[100dvh] bg-background"><Header onMenu={() => setMenuOpen(true)} /><div className="mx-auto flex max-w-[1540px]"><SideNav open={menuOpen} onClose={() => setMenuOpen(false)} /><main className="min-w-0 flex-1">{children}</main></div></div>;
}

function LoadingCards() {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{[1, 2, 3, 4, 5, 6].map((item) => <div className="rounded-2xl border border-border bg-card p-4" key={item}><div className="skeleton mb-4 h-28 rounded-xl" /><div className="skeleton mb-2 h-3 w-24 rounded" /><div className="skeleton mb-3 h-5 w-3/4 rounded" /><div className="skeleton h-3 w-1/2 rounded" /></div>)}</div>;
}

function ErrorState({ onRetry, label = 'The library is taking a breather.' }: { onRetry?: () => void; label?: string }) {
  return <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center"><CircleAlert className="mx-auto mb-3 text-destructive" size={26} /><h3 className="font-display text-lg font-bold">{label}</h3><p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">Check your connection and try again. Your search is still here.</p>{onRetry && <button onClick={onRetry} className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground" data-testid="button-retry">Try again</button>}</div>;
}

function PaperCard({ paper }: { paper: Paper }) {
  return <Link href={`/paper/${paper.id}`} className="group block rounded-2xl border border-border bg-card p-3.5 shadow-[0_2px_0_hsl(var(--primary)/.03)] transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md" data-testid={`card-paper-${paper.id}`}>
    <div className="relative mb-3 flex h-[132px] flex-col justify-between overflow-hidden rounded-xl p-4 text-primary-foreground" style={{ backgroundColor: paper.accent }}>
      <div className="absolute -right-7 -top-8 h-28 w-28 rounded-full border-[16px] border-white/10" />
      <div className="relative flex items-start justify-between"><span className="font-mono-ui text-[11px] font-bold tracking-wide">{paper.courseCode}</span>{paper.isTrending && <span className="rounded-full bg-accent px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-accent-foreground">Trending</span>}</div>
      <div className="relative flex items-end justify-between"><span className="max-w-[190px] font-display text-[1.08rem] font-bold leading-tight">{paper.courseName}</span><FileText size={25} className="opacity-40" /></div>
    </div>
    <p className="line-clamp-1 text-xs font-semibold text-muted-foreground">{paper.university} · {paper.year}</p>
    <div className="mt-3 flex items-center justify-between"><span className="font-mono-ui text-[11px] text-muted-foreground">{paper.downloads} downloads</span><span className="flex items-center gap-1 text-xs font-bold text-primary group-hover:gap-1.5">Open paper <ArrowRight size={14} /></span></div>
  </Link>;
}

function Home() {
  const [search, setSearch] = useState('');
  const [university, setUniversity] = useState('All universities');
  const [faculty, setFaculty] = useState('All faculties');
  const [year, setYear] = useState('All years');
  const [trending, setTrending] = useState(false);
  const papersQuery = useListPapers(undefined, { query: { queryKey: getListPapersQueryKey() } });
  const source = papersQuery.data?.length ? papersQuery.data : fallbackPapers;
  const papers = useMemo(() => source.filter((paper) => {
    const query = search.toLowerCase().trim();
    return (!query || `${paper.courseCode} ${paper.courseName} ${paper.university}`.toLowerCase().includes(query)) &&
      (university === 'All universities' || paper.university === university) &&
      (faculty === 'All faculties' || paper.faculty === faculty) &&
      (year === 'All years' || String(paper.year) === year) &&
      (!trending || paper.isTrending);
  }), [source, search, university, faculty, year, trending]);
  const resetFilters = () => { setSearch(''); setUniversity('All universities'); setFaculty('All faculties'); setYear('All years'); setTrending(false); };
  return <div className="px-4 py-7 sm:px-7 sm:py-10">
    <div className="mx-auto max-w-[1120px]">
      <section className="animate-rise relative overflow-hidden rounded-[26px] bg-primary px-5 py-7 text-primary-foreground shadow-md sm:px-9 sm:py-10">
        <div className="absolute -right-14 -top-20 h-64 w-64 rounded-full border-[28px] border-white/10" /><div className="absolute -bottom-20 right-28 h-40 w-40 rounded-full bg-accent/15" />
        <div className="relative max-w-2xl"><p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground/70"><span className="h-1.5 w-1.5 rounded-full bg-accent" /> Uganda’s student paper shelf</p><h1 className="font-display text-[2.35rem] font-bold leading-[.98] tracking-[-0.05em] sm:text-5xl">Find the paper.<br /><span className="text-accent">Keep your time.</span></h1><p className="mt-4 max-w-lg text-sm leading-6 text-primary-foreground/75 sm:text-base">Past papers from the campuses you know, ready for the revision hour that matters.</p>
          <div className="mt-6 flex max-w-xl items-center gap-2 rounded-2xl bg-card p-1.5 text-foreground shadow-md"><Search className="ml-3 shrink-0 text-muted-foreground" size={19} /><input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm outline-none placeholder:text-muted-foreground" placeholder="Course code, title or university" data-testid="input-search-papers" /><button onClick={() => document.getElementById('paper-list')?.scrollIntoView({ behavior: 'smooth' })} className="hidden rounded-xl bg-accent px-4 py-3 text-xs font-bold text-accent-foreground sm:block" data-testid="button-search-papers">Search</button></div>
        </div>
      </section>
      <section className="mt-8 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-border bg-card p-4"><div className="mb-3 grid h-9 w-9 place-items-center rounded-xl bg-secondary text-primary"><FileText size={18} /></div><p className="font-display text-xl font-bold">One clean copy</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Preview before you spend a shilling.</p></div><div className="rounded-2xl border border-border bg-card p-4"><div className="mb-3 grid h-9 w-9 place-items-center rounded-xl bg-[#fff4d6] text-[#a66813]"><Smartphone size={18} /></div><p className="font-display text-xl font-bold">Made for mobile</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Light pages for campus data bundles.</p></div><div className="rounded-2xl border border-border bg-card p-4"><div className="mb-3 grid h-9 w-9 place-items-center rounded-xl bg-[#e3f4ef] text-[#197564]"><BadgeCheck size={18} /></div><p className="font-display text-xl font-bold">Study together</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Upload a paper, earn credits for yours.</p></div></section>
      <section id="paper-list" className="mt-10"><div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">The shelf</p><h2 className="font-display text-2xl font-bold tracking-[-0.03em]">Recent papers</h2></div><button onClick={() => setTrending((value) => !value)} className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold transition-colors ${trending ? 'border-accent bg-accent text-accent-foreground' : 'border-border bg-card text-muted-foreground hover:bg-secondary'}`} data-testid="button-filter-trending"><Sparkles size={14} /> Trending only</button></div>
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1"><div className="relative shrink-0"><Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} /><select value={university} onChange={(event) => setUniversity(event.target.value)} className="h-10 max-w-[210px] appearance-none rounded-xl border border-border bg-card pl-9 pr-8 text-xs font-semibold outline-none focus:border-primary" data-testid="select-university-filter">{universities.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} /></div><select value={faculty} onChange={(event) => setFaculty(event.target.value)} className="h-10 shrink-0 rounded-xl border border-border bg-card px-3 text-xs font-semibold outline-none focus:border-primary" data-testid="select-faculty-filter">{faculties.map((item) => <option key={item}>{item}</option>)}</select><select value={year} onChange={(event) => setYear(event.target.value)} className="h-10 shrink-0 rounded-xl border border-border bg-card px-3 text-xs font-semibold outline-none focus:border-primary" data-testid="select-year-filter">{years.map((item) => <option key={item}>{item}</option>)}</select></div>
        {papersQuery.isLoading ? <LoadingCards /> : papersQuery.isError && !papersQuery.data?.length ? <ErrorState onRetry={() => papersQuery.refetch()} /> : papers.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{papers.map((paper) => <PaperCard key={paper.id} paper={paper} />)}</div> : <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-12 text-center"><Search className="mx-auto mb-3 text-primary/60" size={28} /><h3 className="font-display text-xl font-bold">No papers on this shelf yet</h3><p className="mt-1 text-sm text-muted-foreground">Try a wider search, or be the first student to share one.</p><div className="mt-5 flex justify-center gap-2"><button onClick={resetFilters} className="rounded-xl border border-border px-4 py-2.5 text-sm font-bold" data-testid="button-reset-filters">Clear filters</button><Link href="/upload" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground" data-testid="link-empty-upload">Upload a paper</Link></div></div>}
      </section>
    </div>
  </div>;
}

function Preview({ paper, unlocked }: { paper: Paper; unlocked: boolean }) {
  return <div className="relative h-[310px] overflow-hidden rounded-2xl border border-border bg-[#fbfaf5] shadow-sm sm:h-[390px]"><div className={`absolute inset-5 rounded border border-[#ddd8c8] bg-[#fffdf8] p-5 text-[#3b4451] sm:p-8 ${unlocked ? '' : 'blur-[5px]'}`}><div className="border-b border-[#d8d3c7] pb-4 text-center"><p className="font-mono-ui text-[9px] tracking-widest">UNIVERSITY EXAMINATIONS BOARD</p><p className="mt-2 font-display text-xl font-bold">END OF SEMESTER EXAMINATION</p><p className="mt-1 text-[10px]">FACULTY OF {paper.faculty.toUpperCase()} · {paper.year}</p></div><div className="mt-6 flex justify-between text-[10px] font-bold"><span>{paper.courseCode}</span><span>TIME: 3 HOURS</span></div><div className="mt-7 space-y-4 text-[11px] leading-5"><p><b>1.</b> Answer any four questions. Show all working clearly and state any assumptions made.</p><p><b>2.</b> Discuss the key principles that guide the application of {paper.courseName.toLowerCase()} in Uganda.</p><p><b>3.</b> A student group is preparing for the assessment. Explain the approach you would use to evaluate this case.</p><div className="h-12 border-b border-dashed border-[#bab5aa]" /><div className="h-12 border-b border-dashed border-[#bab5aa]" /></div></div>{!unlocked && <div className="absolute inset-0 grid place-items-center bg-[#f1eee6]/25"><div className="rounded-2xl border border-white/80 bg-card/95 px-5 py-4 text-center shadow-md"><LockKeyhole className="mx-auto mb-2 text-primary" size={21} /><p className="text-sm font-bold">First page preview</p><p className="mt-0.5 text-xs text-muted-foreground">{paper.previewLabel}</p></div></div>}</div>;
}

function Detail() {
  const { id = '' } = useParams<{ id: string }>();
  const paperQuery = useGetPaper(id, { query: { enabled: Boolean(id), queryKey: getGetPaperQueryKey(id) } });
  const paper = paperQuery.data ?? fallbackPapers.find((item) => item.id === id) ?? fallbackPapers[0];
  const unlock = useUnlockPaper();
  const [method, setMethod] = useState<UnlockInputMethod>('momo');
  const [unlocked, setUnlocked] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const startUnlock = () => {
    setResultMessage('');
    unlock.mutate({ id, data: { method } }, { onSuccess: (result) => { setUnlocked(result.unlocked); setDownloadUrl(result.downloadUrl); setResultMessage(result.message); }, onError: () => setResultMessage('We could not complete that request. Please try again.') });
  };
  const download = () => {
    const url = downloadUrl ?? paper.pdfUrl;
    if (url) { const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${paper.courseCode}-${paper.year}.pdf`; anchor.click(); }
    else setResultMessage('Download ready in simulation mode. Connect a PDF URL to save the file.');
  };
  if (paperQuery.isLoading) return <div className="mx-auto max-w-[1120px] px-4 py-10"><div className="skeleton mb-6 h-5 w-24 rounded" /><div className="skeleton h-12 w-3/4 rounded" /><div className="skeleton mt-8 h-[350px] rounded-2xl" /></div>;
  if (paperQuery.isError && !paperQuery.data && !fallbackPapers.some((item) => item.id === id)) return <div className="mx-auto max-w-[650px] px-4 py-14"><ErrorState onRetry={() => paperQuery.refetch()} label="That paper could not be found." /></div>;
  return <div className="px-4 py-7 sm:px-7 sm:py-10"><div className="mx-auto max-w-[980px]"><Link href="/" className="mb-7 inline-flex items-center gap-2 text-sm font-bold text-primary" data-testid="link-back-library"><ArrowLeft size={16} /> Back to library</Link><div className="grid gap-7 lg:grid-cols-[1fr_340px]"><div><div className="mb-5 flex items-start justify-between gap-3"><div><p className="font-mono-ui text-xs font-bold tracking-wide text-primary">{paper.courseCode} · {paper.year}</p><h1 className="mt-2 max-w-xl font-display text-3xl font-bold leading-tight tracking-[-0.04em] sm:text-4xl">{paper.courseName}</h1><p className="mt-2 text-sm text-muted-foreground">{paper.university} · {paper.faculty}</p></div><span className="hidden rounded-full bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground sm:block">{paper.downloads} downloads</span></div><Preview paper={paper} unlocked={unlocked} /></div><div><div className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-primary">{unlocked ? 'Unlocked' : 'Get this paper'}</p><p className="mt-1 font-display text-2xl font-bold">{unlocked ? 'Ready to study' : `From UGX ${formatUgx(paper.priceUgx)}`}</p></div><div className={`grid h-11 w-11 place-items-center rounded-xl ${unlocked ? 'bg-[#e3f4ef] text-[#197564]' : 'bg-[#fff4d6] text-[#a66813]'}`}>{unlocked ? <Check size={22} /> : <LockKeyhole size={20} />}</div></div>{unlocked ? <><div className="rounded-xl bg-[#e3f4ef] p-3.5 text-sm leading-5 text-[#245f54]"><p className="font-bold">{resultMessage || 'Paper unlocked successfully.'}</p><p className="mt-1 text-xs">Your paper is ready. This result is linked to your account.</p></div><button onClick={download} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-90" data-testid="button-download-paper"><Download size={17} /> Download PDF</button></> : <><p className="mb-3 text-xs leading-5 text-muted-foreground">Choose how you would like to unlock. Payment is simulated for this study library demo.</p><div className="space-y-2">{(['momo', 'airtel', 'ad'] as UnlockInputMethod[]).map((item) => <button key={item} onClick={() => setMethod(item)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${method === item ? 'border-primary bg-secondary' : 'border-border hover:bg-muted'}`} data-testid={`button-unlock-method-${item}`}><span className={`grid h-9 w-9 place-items-center rounded-lg ${item === 'ad' ? 'bg-[#fff4d6] text-[#a66813]' : 'bg-primary/10 text-primary'}`}>{item === 'ad' ? <PlayCircle size={18} /> : <Smartphone size={18} />}</span><span className="flex-1"><span className="block text-sm font-bold">{item === 'momo' ? 'MTN Mobile Money' : item === 'airtel' ? 'Airtel Money' : 'Watch a short ad'}</span><span className="block text-[11px] text-muted-foreground">{item === 'ad' ? 'No credits used' : `Pay UGX ${formatUgx(paper.priceUgx)}`}</span></span>{method === item && <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground"><Check size={12} /></span>}</button>)}</div><button onClick={startUnlock} disabled={unlock.isPending} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-90 disabled:cursor-wait disabled:opacity-60" data-testid="button-unlock-paper">{unlock.isPending ? 'Preparing your paper…' : method === 'ad' ? 'Watch ad & unlock' : 'Continue to unlock'} <ArrowRight size={16} /></button>{resultMessage && <p className="mt-3 text-center text-xs font-semibold text-destructive" data-testid="status-unlock-error">{resultMessage}</p>}</>}</div><div className="mt-3 flex items-start gap-2 rounded-xl bg-secondary/70 p-3 text-[11px] leading-4 text-muted-foreground"><ShieldCheck className="mt-0.5 shrink-0 text-primary" size={15} /> A light preview is shown first, so you know exactly which paper you are unlocking.</div></div></div></div></div>;
}

function UploadPage() {
  const upload = useCreateUpload();
  const [form, setForm] = useState<UploadInput>({ courseCode: '', courseName: '', university: '', faculty: '', year: new Date().getFullYear(), fileName: '' });
  const [message, setMessage] = useState('');
  const update = (key: keyof UploadInput, value: string | number) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => { event.preventDefault(); setMessage(''); upload.mutate({ data: form }, { onSuccess: (result) => setMessage(`Upload received. You earned ${result.creditsEarned} credits while it goes through review.`), onError: () => setMessage('Upload could not be sent. Check your connection and try again.') }); };
  const inputClass = 'mt-1.5 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10';
  return <div className="px-4 py-8 sm:px-7 sm:py-11"><div className="mx-auto max-w-[930px]"><div className="grid gap-8 lg:grid-cols-[1fr_310px]"><div><p className="mb-2 text-xs font-bold uppercase tracking-[.15em] text-primary">Share what you have</p><h1 className="font-display text-4xl font-bold tracking-[-.05em] sm:text-5xl">Put a paper<br /><span className="text-primary">back on the shelf.</span></h1><p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground">Help the next student spend less time hunting in class groups. Every useful upload earns credits after a quick review.</p><form onSubmit={submit} className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7"><div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-bold">Course code<input required value={form.courseCode} onChange={(event) => update('courseCode', event.target.value.toUpperCase())} placeholder="e.g. CSC 2203" className={inputClass} data-testid="input-upload-course-code" /></label><label className="text-xs font-bold">Course name<input required value={form.courseName} onChange={(event) => update('courseName', event.target.value)} placeholder="e.g. Data Structures" className={inputClass} data-testid="input-upload-course-name" /></label></div><div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-bold">University<select required value={form.university} onChange={(event) => update('university', event.target.value)} className={inputClass} data-testid="select-upload-university"><option value="">Select university</option>{universities.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-xs font-bold">Faculty<select required value={form.faculty} onChange={(event) => update('faculty', event.target.value)} className={inputClass} data-testid="select-upload-faculty"><option value="">Select faculty</option>{faculties.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label></div><div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-bold">Exam year<input required type="number" min="2000" max="2030" value={form.year} onChange={(event) => update('year', Number(event.target.value))} className={inputClass} data-testid="input-upload-year" /></label><label className="text-xs font-bold">Paper file<div className="relative mt-1.5 flex h-11 items-center overflow-hidden rounded-xl border border-dashed border-primary/40 bg-secondary/40 px-3 text-sm text-muted-foreground"><Upload size={15} className="mr-2 shrink-0 text-primary" /><span className="truncate">{form.fileName || 'Choose PDF from phone'}</span><input required type="file" accept=".pdf,application/pdf" onChange={(event) => update('fileName', event.target.files?.[0]?.name ?? '')} className="absolute inset-0 cursor-pointer opacity-0" data-testid="input-upload-file" /></div></label></div><div className="flex items-start gap-2 rounded-xl bg-[#fff4d6] p-3 text-xs leading-5 text-[#7e5b1d]"><Sparkles size={15} className="mt-0.5 shrink-0" /> Keep it legible and remove personal notes before sharing. Clean uploads earn the most trust.</div>{message && <div className={`rounded-xl p-3 text-sm font-semibold ${message.startsWith('Upload received') ? 'bg-[#e3f4ef] text-[#245f54]' : 'bg-destructive/10 text-destructive'}`} data-testid="status-upload">{message}</div>}<button type="submit" disabled={upload.isPending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-60" data-testid="button-submit-upload">{upload.isPending ? 'Sending to review…' : 'Submit paper for review'} <ArrowRight size={16} /></button></form></div><aside className="h-fit rounded-2xl bg-sidebar p-5 text-sidebar-foreground shadow-md sm:p-6"><div className="mb-8 flex items-center justify-between"><div className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-accent-foreground"><WalletCards size={21} /></div><span className="font-mono-ui text-xs text-sidebar-foreground/55">CREDITS / 01</span></div><p className="font-display text-2xl font-bold">Your useful thing can pay for the next one.</p><p className="mt-3 text-sm leading-6 text-sidebar-foreground/65">Credits stay with your account and can help unlock future papers.</p><div className="mt-8 space-y-4 border-t border-sidebar-border pt-5"><div className="flex gap-3"><Check className="shrink-0 text-accent" size={16} /><span className="text-xs leading-5 text-sidebar-foreground/75">PDF only, clear first page</span></div><div className="flex gap-3"><Check className="shrink-0 text-accent" size={16} /><span className="text-xs leading-5 text-sidebar-foreground/75">Reviewed by the library team</span></div><div className="flex gap-3"><Check className="shrink-0 text-accent" size={16} /><span className="text-xs leading-5 text-sidebar-foreground/75">Credits awarded when approved</span></div></div></aside></div></div></div>;
}

function Stat({ icon: Icon, label, value, accent = false }: { icon: typeof FileText; label: string; value: string; accent?: boolean }) {
  return <div className={`rounded-2xl border p-4 ${accent ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card'}`}><div className="mb-5 flex items-center justify-between"><span className={`text-xs font-semibold ${accent ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{label}</span><Icon size={17} className={accent ? 'text-accent' : 'text-primary'} /></div><p className="font-mono-ui text-2xl font-bold tracking-[-.05em]">{value}</p></div>;
}

function Admin() {
  const query = useGetDashboardSummary({ query: { queryKey: getGetDashboardSummaryQueryKey() } });
  const data: DashboardSummary = query.data ?? { totalPapers: 248, totalDownloads: 1642, paidUnlocks: 706, totalEarningsUgx: 934500, pendingUploads: 12, topUniversity: 'Makerere University' };
  return <div className="px-4 py-8 sm:px-7 sm:py-11"><div className="mx-auto max-w-[1120px]"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-xs font-bold uppercase tracking-[.15em] text-primary">Admin desk</p><h1 className="font-display text-4xl font-bold tracking-[-.05em]">Keep the shelf<br /><span className="text-primary">moving.</span></h1></div><div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground"><span className="h-2 w-2 rounded-full bg-[#299b7e]" /> Live library view</div></div>{query.isLoading ? <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="skeleton h-32 rounded-2xl" />)}</div> : query.isError && !query.data ? <div className="mt-8"><ErrorState onRetry={() => query.refetch()} /></div> : <><div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Stat icon={FileText} label="Papers on shelf" value={String(data.totalPapers)} accent /><Stat icon={Download} label="Total downloads" value={formatUgx(data.totalDownloads)} /><Stat icon={WalletCards} label="Earnings (UGX)" value={formatUgx(data.totalEarningsUgx)} /><Stat icon={Clock3} label="Waiting review" value={String(data.pendingUploads)} /></div><div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_.8fr]"><section className="rounded-2xl border border-border bg-card p-5 sm:p-6"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.13em] text-primary">Library pulse</p><h2 className="mt-1 font-display text-2xl font-bold">This is what students are reaching for.</h2></div><button className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-muted" data-testid="button-admin-more" aria-label="More dashboard actions"><MoreHorizontal size={17} /></button></div><div className="mt-7 flex h-44 items-end gap-2 border-b border-border pb-0">{[42, 57, 48, 71, 62, 83, 74, 96, 88, 100, 92, 108].map((height, index) => <div key={index} className="group relative flex flex-1 items-end"><div className="w-full rounded-t-md bg-secondary transition-all group-hover:bg-primary" style={{ height: `${height}px` }} /><span className="absolute -bottom-5 left-1/2 -translate-x-1/2 font-mono-ui text-[9px] text-muted-foreground">{index + 1}</span></div>)}</div><div className="mt-8 grid grid-cols-2 gap-3"><div className="rounded-xl bg-secondary/70 p-3"><p className="text-[11px] font-semibold text-muted-foreground">Paid unlocks</p><p className="mt-1 font-mono-ui text-lg font-bold">{formatUgx(data.paidUnlocks)}</p></div><div className="rounded-xl bg-[#fff4d6] p-3"><p className="text-[11px] font-semibold text-[#85651f]">Top university</p><p className="mt-1 line-clamp-1 text-sm font-bold text-[#6f541d]">{data.topUniversity}</p></div></div></section><section className="rounded-2xl border border-border bg-card p-5 sm:p-6"><p className="text-xs font-bold uppercase tracking-[.13em] text-primary">Review queue</p><h2 className="mt-1 font-display text-2xl font-bold">Uploads to check</h2><div className="mt-6 flex items-center gap-4 rounded-xl border border-border bg-background p-4"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[#fff4d6] text-[#a66813]"><Upload size={20} /></div><div className="flex-1"><p className="font-bold">{data.pendingUploads} papers waiting</p><p className="mt-1 text-xs text-muted-foreground">A quick look keeps the shelf clean.</p></div><ArrowRight className="text-primary" size={17} /></div><div className="mt-3 flex items-center gap-4 rounded-xl border border-border bg-background p-4"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[#e3f4ef] text-[#197564]"><Users size={20} /></div><div className="flex-1"><p className="font-bold">Student activity</p><p className="mt-1 text-xs text-muted-foreground">{formatUgx(data.totalDownloads)} downloads so far</p></div><ArrowRight className="text-primary" size={17} /></div><Link href="/" className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-bold text-primary hover:bg-secondary" data-testid="link-admin-view-library">View student library <ArrowRight size={15} /></Link></section></div></>}</div></div>;
}

function Login() {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [university, setUniversity] = useState('');
  const [faculty, setFaculty] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const next = (event: FormEvent) => { event.preventDefault(); if (step < 3) setStep((value) => value + 1); else setSubmitted(true); };
  return <div className="grid min-h-[calc(100dvh-68px)] place-items-center px-4 py-10 sm:px-7"><div className="grid w-full max-w-[900px] overflow-hidden rounded-[26px] border border-border bg-card shadow-md md:grid-cols-[.9fr_1.1fr]"><div className="grid min-h-[230px] content-between bg-primary p-6 text-primary-foreground sm:p-8 md:min-h-[540px]"><div><BrandMark /><p className="mt-12 max-w-xs font-display text-3xl font-bold leading-tight tracking-[-.04em]">Your campus shelf, in your pocket.</p><p className="mt-4 max-w-xs text-sm leading-6 text-primary-foreground/70">Sign in once. Find the papers that make your next revision session count.</p></div><div className="hidden items-center gap-2 text-xs text-primary-foreground/60 md:flex"><ShieldCheck size={16} /> Built around Ugandan campus life</div></div><div className="p-6 sm:p-10">{submitted ? <div className="flex min-h-[390px] flex-col items-center justify-center text-center"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#e3f4ef] text-[#197564]"><Check size={27} /></div><h1 className="mt-5 font-display text-3xl font-bold">You’re set.</h1><p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">Your shelf is ready for {university}. We’ll keep your downloads and credits close.</p><Link href="/" className="mt-7 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground" data-testid="link-login-library">Open my library</Link></div> : <><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-primary">Welcome back</p><h1 className="mt-2 font-display text-3xl font-bold tracking-[-.04em]">Set up your shelf.</h1></div><span className="font-mono-ui text-xs text-muted-foreground">0{step} / 03</span></div><div className="mt-7 flex gap-1.5">{[1, 2, 3].map((item) => <span key={item} className={`h-1.5 flex-1 rounded-full ${item <= step ? 'bg-accent' : 'bg-muted'}`} />)}</div><form onSubmit={next} className="mt-8">{step === 1 && <label className="text-xs font-bold">Phone number<p className="mt-1.5 flex h-12 items-center overflow-hidden rounded-xl border border-border bg-background focus-within:border-primary"><span className="border-r border-border px-3 text-sm font-bold text-muted-foreground">+256</span><input required value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 9))} className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none" placeholder="7XX XXX XXX" data-testid="input-login-phone" /></p><span className="mt-2 block text-xs font-normal text-muted-foreground">We use this to keep your credits tied to you.</span></label>}{step === 2 && <label className="text-xs font-bold">Where do you study?<select required value={university} onChange={(event) => setUniversity(event.target.value)} className="mt-1.5 h-12 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary" data-testid="select-login-university"><option value="">Select university</option>{universities.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label>}{step === 3 && <label className="text-xs font-bold">Your faculty<select required value={faculty} onChange={(event) => setFaculty(event.target.value)} className="mt-1.5 h-12 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary" data-testid="select-login-faculty"><option value="">Select faculty</option>{faculties.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label>}<button type="submit" className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground" data-testid="button-login-next">{step === 3 ? 'Finish setup' : 'Continue'} <ArrowRight size={16} /></button></form><p className="mt-7 text-center text-[11px] leading-5 text-muted-foreground">No password to remember. This is an onboarding demo; no payment is taken here.</p></>}</div></div></div>;
}

function Router() {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}><Switch><Route path="/login"><Login /></Route><Route path="/paper/:id"><AppShell><Detail /></AppShell></Route><Route path="/upload"><AppShell><UploadPage /></AppShell></Route><Route path="/admin"><AppShell><Admin /></AppShell></Route><Route path="/"><AppShell><Home /></AppShell></Route><Route component={NotFound} /></Switch></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;