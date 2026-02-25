"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield, ArrowLeft, AlertTriangle, CheckCircle2, Clock,
  Loader2, LogOut, UserPlus, Zap, LayoutDashboard, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportCard } from "@/components/report-card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  getReports, updateReportStatus, deleteReport, assignReport,
  getOfficersByDepartment, incidentCategories,
  type IncidentReport, type Officer,
} from "@/lib/incident-data";
import { toast } from "sonner";

export default function AuthorityDashboardPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<{ isLoggedIn: boolean; department: string; username: string; id: string } | null>(null);
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [selectedReport, setSelectedReport] = useState<IncidentReport | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<string>("");
  const [priority, setPriority] = useState<string>("medium");
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchData = useCallback(async (deptId: string) => {
    try {
      const fetchedReports = await getReports();
      setReports(Array.isArray(fetchedReports) ? fetchedReports : []);
      const fetchedOfficers = await getOfficersByDepartment(deptId);
      setOfficers(fetchedOfficers);
    } catch { setReports([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("authority_auth");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.isLoggedIn) { setAuth(parsed); fetchData(parsed.department); }
      else router.push("/authority/login");
    } else router.push("/authority/login");
  }, [router, fetchData]);

  const handleLogout = () => { localStorage.removeItem("authority_auth"); router.push("/authority/login"); };

  const handleStatusChange = async (id: string, status: IncidentReport["status"], action?: string) => {
    try {
      await updateReportStatus(id, status, action);
      setReports(Array.isArray(await getReports()) ? await getReports() : []);
      toast.success("स्थिति अपडेट की गई / Status Updated");
    } catch { toast.error("अपडेट विफल / Update Failed"); }
  };

  const handleDeleteReport = async (id: string) => {
    try {
      await deleteReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
      toast.success("रिपोर्ट हटाई गई / Report Deleted");
    } catch { toast.error("त्रुटि हुई / Error"); }
  };

  const handleOpenAssign = (report: IncidentReport) => {
    setSelectedReport(report);
    setIsAssignDialogOpen(true);
    setSelectedOfficer(report.assignedTo || "");
    setPriority(report.priority || "medium");
  };

  const handleAssign = async () => {
    if (!selectedReport || !selectedOfficer || !auth) return;
    setIsAssigning(true);
    try {
      const officer = officers.find(o => o.id === selectedOfficer);
      if (!officer) return;
      await assignReport(selectedReport.id, officer.id, officer.fullName, auth.id, priority);
      const updated = await getReports();
      setReports(Array.isArray(updated) ? updated : []);
      setIsAssignDialogOpen(false);
      toast.success(`कार्य ${officer.fullName} को सौंपा गया`);
    } catch { toast.error("असाइनमेंट विफल"); }
    finally { setIsAssigning(false); }
  };

  if (loading || !auth) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center flex-col gap-4">
        <Loader2 className="h-10 w-10 text-[#003580] animate-spin" />
        <p className="text-sm font-bold text-slate-500">लोड हो रहा है... Loading...</p>
      </div>
    );
  }

  const filteredReports = Array.isArray(reports) ? reports.filter((r) => {
    const matchDept = auth.department === "all"
      || r.category.id === auth.department
      || incidentCategories.find(c => c.id === auth.department)?.authority === r.category.authority;
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    return matchDept && matchStatus;
  }) : [];

  const stats = {
    total: filteredReports.length,
    pending: filteredReports.filter(r => r.status === "pending").length,
    inProgress: filteredReports.filter(r => r.status === "in-progress").length,
    resolved: filteredReports.filter(r => r.status === "resolved").length,
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] font-sans">
      {/* Tricolor strip */}
      <div className="h-1.5 w-full flex">
        <div className="flex-1 bg-[#f47920]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      {/* Top utility bar */}
      <div className="bg-[#002060] text-white text-[11px]">
        <div className="max-w-7xl mx-auto px-4 h-8 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold opacity-80">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
              alt="Emblem"
              className="h-4 w-auto brightness-0 invert"
            />
            भारत सरकार | Government of India
          </div>
          <span className="text-white/40 text-[10px]">CLASSIFIED — AUTHORIZED ACCESS ONLY</span>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b-4 border-[#f47920] shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
              alt="Emblem"
              className="h-14 w-auto"
            />
            <div className="border-l-2 border-slate-200 pl-4">
              <h1 className="text-xl font-black text-[#003580] leading-none">नागरिक सूचना पोर्टल</h1>
              <p className="text-[10px] text-[#f47920] font-bold uppercase tracking-widest mt-0.5">
                Authority Command Center — Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right border-r border-slate-200 pr-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signed in as</p>
              <p className="text-sm font-black text-[#003580]">{auth.username}</p>
              <p className="text-[10px] text-slate-400">
                {incidentCategories.find(c => c.id === auth.department)?.authority || "All Departments"}
              </p>
            </div>
            <Link href="/">
              <button className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#003580] bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded border border-slate-200 transition-all">
                <ArrowLeft className="h-3.5 w-3.5" />
                Portal Home
              </button>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs font-bold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 border border-red-200 hover:border-red-600 px-3 py-2 rounded transition-all"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Nav */}
      <nav className="bg-[#003580] text-white">
        <div className="max-w-7xl mx-auto px-4 h-10 flex items-center gap-1">
          <button className="flex items-center gap-2 h-full px-5 text-xs font-bold bg-[#f47920] text-white">
            <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
          </button>
          <div className="ml-auto flex items-center gap-3 text-[10px] text-white/50">
            <span>मुख्य पृष्ठ</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white">रिपोर्ट प्रबंधन</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* Page heading */}
        <div className="bg-[#003580] text-white px-6 py-4 rounded-t flex items-center justify-between mb-0">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-[#f47920]" />
            <div>
              <h2 className="font-black text-base">रिपोर्ट प्रबंधन कक्ष</h2>
              <p className="text-white/50 text-xs">Manage and resolve citizen incident reports</p>
            </div>
          </div>
          {/* Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/50 uppercase tracking-widest hidden sm:inline">Filter:</span>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-36 bg-white/10 border-white/20 text-white h-8 rounded text-xs font-bold focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-bold">सभी / All</SelectItem>
                <SelectItem value="pending" className="font-bold">लंबित / Pending</SelectItem>
                <SelectItem value="in-progress" className="font-bold">कार्यवाही / In-Progress</SelectItem>
                <SelectItem value="resolved" className="font-bold">समाधान / Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-t-0 border-[#003580]/20 mb-6">
          {[
            { label: "कुल रिपोर्ट", eng: "Total Cases", value: stats.total, icon: Zap, color: "#003580", bg: "bg-white" },
            { label: "लंबित", eng: "Pending", value: stats.pending, icon: Clock, color: "#f47920", bg: "bg-orange-50" },
            { label: "कार्यवाही में", eng: "In Action", value: stats.inProgress, icon: Loader2, color: "#2563eb", bg: "bg-blue-50" },
            { label: "समाधान हुए", eng: "Resolved", value: stats.resolved, icon: CheckCircle2, color: "#138808", bg: "bg-green-50" },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} border-r border-slate-200 last:border-r-0 p-5 flex items-center gap-4 group hover:bg-[#003580] hover:text-white transition-all`}>
              <div className="h-10 w-10 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: s.color + "20" }}>
                <s.icon className="h-5 w-5 group-hover:text-white transition-colors" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 group-hover:text-white transition-colors">{s.value}</p>
                <p className="text-xs font-black text-slate-600 group-hover:text-white/80 transition-colors">{s.label}</p>
                <p className="text-[9px] text-slate-400 group-hover:text-white/50 uppercase tracking-widest transition-colors">{s.eng}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Reports grid */}
        {filteredReports.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded py-20 flex flex-col items-center gap-4 text-center">
            <div className="bg-slate-100 p-6 rounded-full">
              <Shield className="h-14 w-14 text-slate-200" />
            </div>
            <p className="text-xl font-black text-slate-700">कोई रिपोर्ट नहीं मिली</p>
            <p className="text-sm text-slate-400 max-w-xs">इस श्रेणी में वर्तमान में कोई सक्रिय रिपोर्ट नहीं है।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-300">
            {filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                showActions
                onStatusChange={handleStatusChange}
                onAssign={handleOpenAssign}
                onDelete={handleDeleteReport}
              />
            ))}
          </div>
        )}
      </main>

      {/* Assign Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="bg-white rounded border border-slate-200 p-0 max-w-md shadow-2xl overflow-hidden">
          <div className="bg-[#003580] px-6 py-4 flex items-center gap-3">
            <div className="bg-[#f47920] p-2 rounded">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-white font-black text-base">कार्य असाइन करें</DialogTitle>
              <DialogDescription className="text-white/50 text-xs">
                Assign Case #{selectedReport?.id} to an Officer
              </DialogDescription>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Officer select */}
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">
                अधिकारी का चयन / Select Officer
              </label>
              <Select value={selectedOfficer} onValueChange={setSelectedOfficer}>
                <SelectTrigger className="h-10 border-slate-300 bg-white text-slate-900 rounded font-medium text-sm">
                  <SelectValue placeholder="सूची से चुनें" />
                </SelectTrigger>
                <SelectContent>
                  {officers.length === 0 ? (
                    <div className="p-3 text-center text-sm text-slate-400">कोई अधिकारी नहीं मिला</div>
                  ) : (
                    officers.map(o => (
                      <SelectItem key={o.id} value={o.id} className="text-sm font-medium">
                        {o.fullName} <span className="text-slate-400 text-[10px] ml-1">({o.officerId})</span>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">
                प्राथमिकता / Priority
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: "low", label: "कम", color: "text-blue-600 border-blue-200 hover:bg-blue-50" },
                  { id: "medium", label: "मध्यम", color: "text-yellow-600 border-yellow-200 hover:bg-yellow-50" },
                  { id: "high", label: "उच्च", color: "text-orange-600 border-orange-200 hover:bg-orange-50" },
                  { id: "critical", label: "गंभीर", color: "text-red-600 border-red-200 hover:bg-red-50" },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPriority(p.id)}
                    className={`py-2 rounded border-2 text-[10px] font-black uppercase tracking-wider transition-all ${
                      priority === p.id
                        ? "bg-[#003580] border-[#003580] text-white"
                        : `bg-white ${p.color}`
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Confirm */}
            <button
              onClick={handleAssign}
              disabled={!selectedOfficer || isAssigning}
              className="w-full bg-[#003580] hover:bg-[#002060] disabled:opacity-60 text-white font-black py-3 rounded text-sm flex items-center justify-center gap-2 transition-all"
            >
              {isAssigning ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              पुष्टि करें / Confirm Assignment
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
