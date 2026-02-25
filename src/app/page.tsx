"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle, FileText, Shield, Menu, X, Search,
  CheckCircle2, Bell, PhoneCall, MapPin, Clock, Users,
  Building2, Zap, Eye, ChevronRight, Car, Flame,
  Droplets, Truck, BadgeAlert, HelpCircle, Info,
  ChevronDown, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ReportForm } from "@/components/report-form";
import { ReportCard } from "@/components/report-card";
import { AuthorityLoginBox } from "@/components/authority-login-box";
import { toast } from "sonner";
import {
  addReport, getReports, getReportById,
  type IncidentCategory, type IncidentReport
} from "@/lib/incident-data";
import { sendReportNotification } from "@/app/actions/notifications";

export default function Home() {
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [activeTab, setActiveTab] = useState<"report" | "view" | "track">("report");
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchId, setSearchId] = useState("");
  const [trackedReport, setTrackedReport] = useState<IncidentReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try {
      const data = await getReports();
      setReports(Array.isArray(data) ? data : []);
    } catch { setReports([]); }
    finally { setIsLoading(false); }
  };

  const handleSubmit = async (data: {
    category: IncidentCategory; description: string; location: string;
    reporterName: string; reporterPhone: string; imageUrl: string;
  }) => {
    try {
        const newReport = await addReport(data);
          if (newReport?.id) {
            await fetchReports();
            setShowSuccess(newReport.id);
            setTimeout(() => { setShowSuccess(null); setActiveTab("view"); }, 10000);

            // Send SMS to reporter via API route (avoids Server Action host validation)
            if (newReport.reporterPhone) {
              fetch("/api/send-sms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  phone: newReport.reporterPhone,
                  referenceId: newReport.id,
                  category: newReport.category.name,
                }),
              }).then((r) => r.json()).then((result) => {
                if (result?.success) toast.success("SMS aapke mobile par bhej diya gaya hai!");
              }).catch(() => {});
            }

            // Send email to admin in background
            sendReportNotification({
              id: newReport.id,
              category: { name: newReport.category.name, email: newReport.category.email },
              description: newReport.description, location: newReport.location,
              reporterName: newReport.reporterName, reporterPhone: newReport.reporterPhone
            }).then((result) => {
              if (result?.success) toast.success("Adhikarion ko email bhej di gayi hai.");
            }).catch(() => {});
          }
      } catch {
        toast.error("रिपोर्ट भेजने में त्रुटि हुई। / Error submitting report.");
      }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    setIsTracking(true);
    setTrackedReport(null);
    try {
      const report = await getReportById(searchId.trim().toUpperCase());
      setTrackedReport(report || null);
      if (!report) toast.error("इस संदर्भ संख्या के साथ कोई रिपोर्ट नहीं मिली।");
    } catch { toast.error("ट्रैकिंग में त्रुटि।"); }
    finally { setIsTracking(false); }
  };

  const stats = [
    { value: `${reports.length}+`, label: "कुल रिपोर्ट्स", sub: "Total Reports Filed", color: "#003580" },
    { value: "98%", label: "समाधान दर", sub: "Resolution Rate", color: "#138808" },
    { value: "24/7", label: "निगरानी", sub: "Active Monitoring", color: "#003580" },
    { value: "50+", label: "विभाग जुड़े", sub: "Departments", color: "#f47920" },
  ];

  const incidentTypes = [
    { icon: Car, label: "सड़क दुर्घटना", sub: "Road Accident", color: "#dc2626" },
    { icon: Flame, label: "आग / Fire", sub: "Fire Incident", color: "#ea580c" },
    { icon: Droplets, label: "जलभराव", sub: "Waterlogging", color: "#2563eb" },
    { icon: Truck, label: "कचरा", sub: "Garbage", color: "#16a34a" },
    { icon: BadgeAlert, label: "अवैध गतिविधि", sub: "Illegal Activity", color: "#7c3aed" },
    { icon: HelpCircle, label: "अन्य", sub: "Other Issue", color: "#475569" },
  ];

  const departments = [
    { name: "पुलिस विभाग", eng: "Police Dept.", icon: Shield },
    { name: "नगर निगम", eng: "Municipal Corp.", icon: Building2 },
    { name: "बिजली विभाग", eng: "Power Dept.", icon: Zap },
    { name: "जल विभाग", eng: "Water Dept.", icon: Droplets },
    { name: "यातायात पुलिस", eng: "Traffic Police", icon: Car },
    { name: "दमकल विभाग", eng: "Fire Dept.", icon: Flame },
  ];

  return (
    <div className="min-h-screen bg-[#f0f4f8] font-sans">

      {/* ── Tricolor Strip ── */}
      <div className="h-1.5 w-full flex">
        <div className="flex-1 bg-[#f47920]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      {/* ── Top Utility Bar ── */}
      <div className="bg-[#002060] text-white text-[11px]">
        <div className="max-w-7xl mx-auto px-4 h-8 flex items-center justify-between">
          <div className="flex items-center gap-1 font-semibold opacity-90">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
              alt="Emblem"
              className="h-5 w-auto brightness-0 invert mr-2"
            />
            भारत सरकार &nbsp;|&nbsp; Government of India
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:flex items-center gap-3 border-r border-white/20 pr-4">
              <button className="hover:text-[#f47920] transition-colors">Skip to content</button>
              <button className="font-bold hover:text-[#f47920]">A+</button>
              <button className="hover:text-[#f47920]">A</button>
              <button className="hover:text-[#f47920]">A-</button>
            </span>
            <span className="flex items-center gap-2">
              <button className="opacity-60 hover:opacity-100 hover:text-[#f47920]">English</button>
              <span className="text-white/30">|</span>
              <button className="text-[#f47920] font-bold">हिन्दी</button>
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Branding Header ── */}
      <header className="bg-white border-b-4 border-[#f47920] shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
              alt="Emblem of India"
              className="h-16 md:h-20 w-auto"
            />
            <div className="border-l-2 border-slate-200 pl-4">
              <h1 className="text-xl md:text-3xl font-black text-[#003580] leading-none">
                नागरिक घटना सूचना पोर्टल
              </h1>
              <p className="text-[10px] md:text-xs font-bold text-[#f47920] uppercase tracking-widest mt-1">
                Citizen Incident Reporting Portal &nbsp;|&nbsp; Digital India Initiative
              </p>
              <p className="text-[9px] text-slate-500 font-medium mt-0.5 hidden md:block">
                Ministry of Home Affairs &nbsp;•&nbsp; Government of India
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-6 shrink-0">
            <div className="text-center border-r border-slate-200 pr-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Helpline</p>
              <p className="text-2xl font-black text-red-600">112</p>
              <p className="text-[9px] text-slate-400">Emergency</p>
            </div>
            <div className="text-center border-r border-slate-200 pr-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Toll Free</p>
              <p className="text-xl font-black text-[#003580]">1800-111-222</p>
              <p className="text-[9px] text-slate-400">Mon–Sat, 9AM–6PM</p>
            </div>
            <img
              src="https://upload.wikimedia.org/wikipedia/en/thumb/9/95/Digital_India_logo.svg/1200px-Digital_India_logo.svg.png"
              alt="Digital India"
              className="h-10 w-auto opacity-70"
            />
          </div>

          <button className="lg:hidden p-2 text-[#003580]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* ── Navigation Bar ── */}
      <nav className="bg-[#003580] text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="hidden lg:flex items-center h-11">
            {[
              { id: "report", icon: FileText, label: "शिकायत दर्ज करें", sub: "File Report" },
              { id: "view", icon: Eye, label: `सभी रिपोर्ट (${reports.length})`, sub: "View All" },
              { id: "track", icon: Search, label: "स्थिति जाँचें", sub: "Track Status" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "report" | "view" | "track")}
                className={`flex items-center gap-2 h-full px-6 text-sm font-bold transition-all border-b-4 ${
                  activeTab === tab.id
                    ? "bg-[#f47920] border-[#f47920] text-white"
                    : "border-transparent hover:bg-white/10 text-white/80 hover:text-white"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <Link href="/authority/login">
                <button className="flex items-center gap-2 text-xs font-bold bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded transition-all">
                  <Shield className="h-3.5 w-3.5 text-[#f47920]" />
                  Authority Login
                </button>
              </Link>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-3 space-y-1 border-t border-white/10">
              {[
                { id: "report", icon: FileText, label: "शिकायत दर्ज करें" },
                { id: "view", icon: Eye, label: `सभी रिपोर्ट (${reports.length})` },
                { id: "track", icon: Search, label: "स्थिति जाँचें" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as "report" | "view" | "track"); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded text-sm font-bold transition-all ${
                    activeTab === tab.id ? "bg-[#f47920]" : "hover:bg-white/10"
                  }`}
                >
                  <tab.icon className="h-4 w-4" /> {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* ── Marquee News ── */}
      <div className="bg-[#fff8e1] border-y border-[#f47920]/30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 flex items-center h-8">
          <span className="bg-[#f47920] text-white text-[10px] font-black uppercase px-3 py-1 rounded shrink-0 mr-4 tracking-widest">
            अधिसूचना
          </span>
          <div className="overflow-hidden flex-1">
            <div className="animate-marquee inline-block">
              <span className="text-[11px] text-slate-700 font-semibold">
                नागरिकों से अनुरोध है कि किसी भी आपातकालीन स्थिति में तुरंत रिपोर्ट करें। &nbsp;•&nbsp;
                सड़क दुर्घटना / आग / जलभराव की सूचना तुरंत दें। &nbsp;•&nbsp;
                रिपोर्ट करने के बाद संदर्भ संख्या अवश्य नोट करें। &nbsp;•&nbsp;
                आपातकाल में 112 पर कॉल करें। &nbsp;•&nbsp;
                Citizens are requested to report emergencies immediately for faster response. &nbsp;•&nbsp;
                नागरिकों को अपनी रिपोर्ट की स्थिति संदर्भ संख्या द्वारा ट्रैक कर सकते हैं। &nbsp;•&nbsp;
                सड़क दुर्घटना / आग / जलभराव की सूचना तुरंत दें। &nbsp;•&nbsp;
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Hero / Stats Banner ── */}
      <section className="bg-gradient-to-r from-[#002060] to-[#003580] text-white py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
            {/* Text */}
            <div className="lg:col-span-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#f47920] mb-3 flex items-center gap-2">
                <span className="w-6 h-[2px] bg-[#f47920]" />
                Public Safety Initiative — Digital India
              </p>
              <h2 className="text-3xl md:text-4xl font-black leading-tight mb-4">
                हर नागरिक एक{" "}
                <span className="text-[#f47920]">रक्षक</span>
              </h2>
              <p className="text-white/75 text-sm leading-relaxed mb-6 max-w-lg">
                कई बार दुर्घटना होने पर सही अधिकारी को समय पर सूचना नहीं मिल पाती। इससे बचाव कार्य में देरी होती है
                और कीमती जान जा सकती है।{" "}
                <strong className="text-white">यह पोर्टल इसी समस्या का समाधान है।</strong>{" "}
                घटना की रिपोर्ट सीधे संबंधित अधिकारियों को भेजें।
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setActiveTab("report")}
                  className="bg-[#f47920] hover:bg-[#d9660e] text-white font-black px-7 py-3 rounded text-sm flex items-center gap-2 transition-all shadow-lg shadow-[#f47920]/30"
                >
                  <FileText className="h-4 w-4" />
                  अभी रिपोर्ट करें
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setActiveTab("track")}
                  className="border-2 border-white/40 hover:border-white text-white font-bold px-7 py-3 rounded text-sm flex items-center gap-2 transition-all hover:bg-white/10"
                >
                  <Search className="h-4 w-4" />
                  स्टेटस ट्रैक करें
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-3">
              {stats.map((s, i) => (
                <div key={i} className="bg-white/10 backdrop-blur border border-white/20 rounded p-4 text-center hover:bg-white/15 transition-all">
                  <p className="text-3xl font-black" style={{ color: s.color === "#003580" ? "#fff" : s.color }}>
                    {s.value}
                  </p>
                  <p className="text-sm font-bold text-white mt-0.5">{s.label}</p>
                  <p className="text-[10px] text-white/50 uppercase tracking-widest">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Incident Types ── */}
      <section className="bg-white border-b border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-black text-[#003580]">किस प्रकार की घटना रिपोर्ट करें?</h3>
              <p className="text-xs text-slate-500">Click on incident type to file a report</p>
            </div>
            <button
              onClick={() => setActiveTab("report")}
              className="text-[#003580] hover:text-[#f47920] text-xs font-bold flex items-center gap-1 transition-colors"
            >
              सभी देखें <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {incidentTypes.map((t, i) => (
              <button
                key={i}
                onClick={() => setActiveTab("report")}
                className="group flex flex-col items-center gap-2 p-4 rounded border border-slate-200 hover:border-[#003580] hover:bg-[#003580] bg-slate-50 transition-all"
              >
                <div
                  className="h-10 w-10 rounded flex items-center justify-center text-white group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: t.color }}
                >
                  <t.icon className="h-5 w-5" />
                </div>
                <p className="text-[11px] font-black text-slate-800 group-hover:text-white text-center leading-tight transition-colors">{t.label}</p>
                <p className="text-[9px] text-slate-400 group-hover:text-white/60 transition-colors">{t.sub}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Success Modal ── */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded shadow-2xl p-8 max-w-md w-full border-t-4 border-[#138808]">
            <div className="flex flex-col items-center text-center gap-5">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle2 className="h-12 w-12 text-[#138808]" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">रिपोर्ट सफलतापूर्वक दर्ज की गई!</h3>
                <p className="text-slate-500 text-sm mt-1">Report Submitted Successfully</p>
              </div>
              <div className="bg-[#f0f4f8] p-5 rounded w-full border border-slate-200">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">संदर्भ संख्या / Reference No.</p>
                <p className="text-3xl font-mono font-black text-[#003580]">{showSuccess}</p>
              </div>
              <p className="text-xs text-slate-500 italic">
                कृपया यह नंबर सुरक्षित रखें। इससे आप अपनी रिपोर्ट ट्रैक कर सकते हैं।
              </p>
              <button
                onClick={() => setShowSuccess(null)}
                className="w-full bg-[#003580] hover:bg-[#002060] text-white font-bold py-3 rounded text-sm transition-all"
              >
                ठीक है, जारी रखें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <main className="bg-[#f0f4f8] py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
            <button onClick={() => setActiveTab("report")} className="hover:text-[#003580]">मुख्य पृष्ठ</button>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#003580] font-bold">
              {activeTab === "report" ? "शिकायत दर्ज करें" : activeTab === "view" ? "सभी रिपोर्ट" : "स्थिति जाँचें"}
            </span>
          </div>

          {/* Section heading */}
          <div className="bg-[#003580] text-white px-6 py-4 rounded-t flex items-center justify-between">
            <div className="flex items-center gap-3">
              {activeTab === "report" && <FileText className="h-5 w-5 text-[#f47920]" />}
              {activeTab === "view" && <Eye className="h-5 w-5 text-[#f47920]" />}
              {activeTab === "track" && <Search className="h-5 w-5 text-[#f47920]" />}
              <div>
                <h2 className="font-black text-base">
                  {activeTab === "report" && "नई शिकायत / रिपोर्ट दर्ज करें"}
                  {activeTab === "view" && `सार्वजनिक रिपोर्ट सूची (${reports.length})`}
                  {activeTab === "track" && "रिपोर्ट की स्थिति जाँचें"}
                </h2>
                <p className="text-white/60 text-xs">
                  {activeTab === "report" && "Submit New Incident Report — All fields are mandatory"}
                  {activeTab === "view" && "View all citizen filed incident reports"}
                  {activeTab === "track" && "Track your report using Reference Number"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {(["report","view","track"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`text-xs font-bold px-3 py-1.5 rounded transition-all ${
                    activeTab === t ? "bg-[#f47920] text-white" : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {t === "report" ? "रिपोर्ट" : t === "view" ? "सूची" : "ट्रैक"}
                </button>
              ))}
            </div>
          </div>

          {/* Content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-0">
            {/* Left panel */}
            <div className="bg-white border border-t-0 border-r-0 border-slate-200 min-h-[500px]">

              {/* Report Tab */}
              {activeTab === "report" && (
                <div className="animate-in fade-in duration-300">
                  <ReportForm onSubmit={handleSubmit} />
                </div>
              )}

              {/* View Tab */}
              {activeTab === "view" && (
                <div className="p-6 animate-in fade-in duration-300">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <div className="h-10 w-10 border-4 border-[#003580]/20 border-t-[#003580] rounded-full animate-spin" />
                      <p className="text-sm font-bold text-slate-500">डेटा लोड हो रहा है... Loading...</p>
                    </div>
                  ) : reports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                      <div className="bg-slate-100 p-6 rounded-full">
                        <AlertTriangle className="h-14 w-14 text-slate-300" />
                      </div>
                      <p className="text-xl font-black text-slate-700">कोई रिपोर्ट नहीं मिली</p>
                      <p className="text-sm text-slate-400">No reports have been filed yet.</p>
                      <button
                        onClick={() => setActiveTab("report")}
                        className="bg-[#f47920] hover:bg-[#d9660e] text-white font-bold px-6 py-2.5 rounded text-sm"
                      >
                        पहली रिपोर्ट दर्ज करें
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {reports.map((r) => <ReportCard key={r.id} report={r} />)}
                    </div>
                  )}
                </div>
              )}

              {/* Track Tab */}
              {activeTab === "track" && (
                <div className="p-6 animate-in fade-in duration-300">
                  <div className="max-w-xl">
                    <div className="bg-[#f0f4f8] border border-slate-200 rounded p-6 mb-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-[#003580] p-2.5 rounded">
                          <Search className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-black text-[#003580]">रिपोर्ट ट्रैक करें</h3>
                          <p className="text-xs text-slate-500">Enter your reference number to check status</p>
                        </div>
                      </div>
                      <form onSubmit={handleTrack} className="flex gap-3">
                        <Input
                          value={searchId}
                          onChange={(e) => setSearchId(e.target.value)}
                          placeholder="संदर्भ संख्या जैसे CAP-XXXXXX"
                          className="h-11 border-slate-300 bg-white font-bold text-slate-900 text-base rounded focus:ring-2 focus:ring-[#003580]"
                        />
                        <button
                          type="submit"
                          disabled={isTracking}
                          className="bg-[#f47920] hover:bg-[#d9660e] text-white font-black px-6 h-11 rounded text-sm flex items-center gap-2 transition-all shrink-0 disabled:opacity-60"
                        >
                          {isTracking ? (
                            <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                          ट्रैक करें
                        </button>
                      </form>
                    </div>

                    {/* Steps guide */}
                    <div className="bg-white border border-slate-200 rounded p-5">
                      <h4 className="font-black text-sm text-[#003580] mb-4 flex items-center gap-2">
                        <Info className="h-4 w-4 text-[#f47920]" /> ट्रैकिंग गाइड
                      </h4>
                      <div className="space-y-3">
                        {[
                          { step: "1", text: "रिपोर्ट जमा करने के बाद मिली संदर्भ संख्या दर्ज करें।" },
                          { step: "2", text: "ऊपर खोज बॉक्स में नंबर टाइप करें (जैसे CAP-AB1234)।" },
                          { step: "3", text: "ट्रैक करें बटन दबाएं और रिपोर्ट की स्थिति देखें।" },
                        ].map((s) => (
                          <div key={s.step} className="flex gap-3 items-start">
                            <div className="h-6 w-6 rounded-full bg-[#003580] text-white text-[10px] font-black flex items-center justify-center shrink-0">
                              {s.step}
                            </div>
                            <p className="text-xs text-slate-600 font-medium pt-0.5">{s.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {trackedReport && (
                      <div className="mt-6 animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-2 mb-4 text-[#003580] font-bold text-xs uppercase tracking-wider">
                          <Info className="h-4 w-4" /> रिपोर्ट विवरण / Report Details
                        </div>
                        <ReportCard report={trackedReport} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="border border-t-0 border-slate-200 bg-[#f8fafc]">
              <div className="sticky top-[calc(2.75rem+1px)] space-y-0 divide-y divide-slate-200">

                {/* Authority Login */}
                <div className="p-4">
                  <AuthorityLoginBox />
                </div>

                {/* Emergency */}
                <div className="bg-red-600 p-4 flex items-center gap-4">
                  <div className="bg-white p-2.5 rounded">
                    <PhoneCall className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="text-white">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">आपातकालीन</p>
                    <p className="text-3xl font-black leading-none">112</p>
                    <p className="text-[10px] opacity-70">Emergency Helpline</p>
                  </div>
                  <div className="ml-auto text-white/60 text-[10px] font-bold text-right">
                    <p>24/7</p>
                    <p>FREE</p>
                  </div>
                </div>

                {/* How it works */}
                <div className="p-4 bg-white">
                  <h4 className="font-black text-[#003580] text-sm mb-4 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-[#f47920]" /> यह कैसे काम करता है?
                  </h4>
                  <div className="space-y-3">
                    {[
                      { n: "01", title: "घटना की फोटो लें", sub: "GPS के साथ फोटो कैप्चर करें" },
                      { n: "02", title: "विवरण भरें", sub: "घटना का प्रकार और विवरण दें" },
                      { n: "03", title: "रिपोर्ट जमा करें", sub: "अधिकारी को तुरंत सूचना भेजी जाएगी" },
                      { n: "✓", title: "त्वरित कार्यवाही", sub: "संबंधित विभाग एक्शन लेगा", green: true },
                    ].map((s, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className={`h-7 w-7 rounded text-white text-[10px] font-black flex items-center justify-center shrink-0 ${s.green ? "bg-[#138808]" : "bg-[#003580]"}`}>
                          {s.n}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800">{s.title}</p>
                          <p className="text-[10px] text-slate-400">{s.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info points */}
                <div className="p-4 bg-white space-y-3">
                  <h4 className="font-black text-[#003580] text-sm mb-3 flex items-center gap-2">
                    <Bell className="h-4 w-4 text-[#f47920]" /> महत्वपूर्ण जानकारी
                  </h4>
                  {[
                    { icon: Bell, title: "तुरंत सूचना", sub: "रिपोर्ट संबंधित अधिकारियों को तुरंत भेजी जाती है", color: "#f47920" },
                    { icon: MapPin, title: "GPS लोकेशन", sub: "फोटो खींचते समय GPS ऑन रखें — सटीक लोकेशन के लिए", color: "#003580" },
                    { icon: Clock, title: "24×7 सेवा", sub: "यह सेवा दिन-रात उपलब्ध है, छुट्टियों में भी", color: "#138808" },
                    { icon: Users, title: "गोपनीयता", sub: "आपकी व्यक्तिगत जानकारी सुरक्षित रखी जाती है", color: "#7c3aed" },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3 items-start p-3 rounded bg-slate-50 border border-slate-100">
                      <div className="h-8 w-8 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: item.color }}>
                        <item.icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-800">{item.title}</p>
                        <p className="text-[10px] text-slate-500 leading-relaxed">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Toll-free */}
                <div className="p-4 bg-[#003580] text-white">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Toll Free Helpline</p>
                  <p className="text-xl font-black">1800-111-222</p>
                  <p className="text-[10px] opacity-60 mt-0.5">Mon–Sat, 9 AM – 6 PM IST</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* ── Departments ── */}
      <section className="bg-white py-10 border-t-2 border-[#003580]/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black text-[#003580]">संबंधित विभाग</h3>
              <p className="text-xs text-slate-500">Associated Government Departments</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {departments.map((d, i) => (
              <div key={i} className="group flex flex-col items-center gap-2.5 p-4 rounded border border-slate-200 hover:border-[#003580] hover:bg-[#003580] bg-white transition-all cursor-default">
                <div className="h-12 w-12 rounded bg-[#003580] group-hover:bg-white flex items-center justify-center transition-all">
                  <d.icon className="h-6 w-6 text-white group-hover:text-[#003580] transition-all" />
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-black text-slate-800 group-hover:text-white transition-colors">{d.name}</p>
                  <p className="text-[9px] text-slate-400 group-hover:text-white/60 transition-colors">{d.eng}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Report Section ── */}
      <section className="bg-[#f0f4f8] py-10 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-xl font-black text-[#003580]">रिपोर्ट क्यों करें?</h3>
            <p className="text-sm text-slate-500">Why should you report incidents?</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: Clock,
                title: "समय पर कार्यवाही",
                eng: "Timely Action",
                desc: "रिपोर्ट मिलते ही संबंधित अधिकारी तुरंत एक्शन लेते हैं। समय पर सूचना से जान और संपत्ति बचाई जा सकती है।",
                color: "#003580",
              },
              {
                icon: Users,
                title: "सामुदायिक सुरक्षा",
                eng: "Community Safety",
                desc: "आपकी एक रिपोर्ट से पूरे इलाके की सुरक्षा सुनिश्चित होती है। जागरूक नागरिक सुरक्षित समाज बनाते हैं।",
                color: "#138808",
              },
              {
                icon: CheckCircle2,
                title: "पारदर्शिता",
                eng: "Transparency",
                desc: "आप अपनी रिपोर्ट की स्थिति ट्रैक कर सकते हैं। प्रत्येक रिपोर्ट पर की गई कार्यवाही का रिकॉर्ड रहता है।",
                color: "#f47920",
              },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded p-6 hover:shadow-md transition-all">
                <div className="h-12 w-12 rounded flex items-center justify-center mb-4" style={{ backgroundColor: item.color }}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-black text-[#003580] text-base mb-0.5">{item.title}</h4>
                <p className="text-[10px] text-[#f47920] font-bold uppercase tracking-widest mb-3">{item.eng}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#002060] text-white border-t-4 border-[#f47920]">
        {/* Main footer content */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Brand col */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
                  alt="Emblem"
                  className="h-14 w-auto brightness-0 invert"
                />
                <div>
                  <h5 className="font-black text-lg">नागरिक सूचना पोर्टल</h5>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">Citizen Incident Reporting Portal</p>
                </div>
              </div>
              <p className="text-white/60 text-xs leading-relaxed max-w-sm mb-5">
                यह पोर्टल भारत सरकार के डिजिटल इंडिया पहल के अंतर्गत नागरिकों को आपातकालीन घटनाओं की
                सूचना सीधे अधिकारियों तक पहुंचाने के लिए विकसित किया गया है।
              </p>
              <div className="flex items-center gap-2">
                <img
                  src="https://upload.wikimedia.org/wikipedia/en/thumb/9/95/Digital_India_logo.svg/1200px-Digital_India_logo.svg.png"
                  alt="Digital India"
                  className="h-8 w-auto opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all"
                />
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h6 className="font-black text-[10px] uppercase tracking-widest text-white/40 mb-4">त्वरित लिंक</h6>
              <ul className="space-y-2.5 text-sm">
                {[
                  { label: "मुख्य पृष्ठ", action: () => setActiveTab("report") },
                  { label: "रिपोर्ट दर्ज करें", action: () => setActiveTab("report") },
                  { label: "स्थिति जाँचें", action: () => setActiveTab("track") },
                  { label: "सभी रिपोर्ट", action: () => setActiveTab("view") },
                ].map((l, i) => (
                  <li key={i}>
                    <button
                      onClick={l.action}
                      className="text-white/60 hover:text-white flex items-center gap-2 transition-colors text-xs font-medium"
                    >
                      <ChevronRight className="h-3 w-3 text-[#f47920]" />
                      {l.label}
                    </button>
                  </li>
                ))}
                <li>
                  <Link href="/authority/login" className="text-white/60 hover:text-white flex items-center gap-2 transition-colors text-xs font-medium">
                    <ChevronRight className="h-3 w-3 text-[#f47920]" />
                    अधिकारी लॉगिन
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h6 className="font-black text-[10px] uppercase tracking-widest text-white/40 mb-4">सम्पर्क / Contact</h6>
              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded p-3">
                  <PhoneCall className="h-4 w-4 text-[#f47920] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Toll Free</p>
                    <p className="text-sm font-black">1800-111-222</p>
                    <p className="text-[10px] text-white/40">Mon-Sat, 9AM-6PM</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-red-600/20 border border-red-500/20 rounded p-3">
                  <PhoneCall className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Emergency</p>
                    <p className="text-2xl font-black text-red-400">112</p>
                    <p className="text-[10px] text-white/40">24/7 Available</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-[#f47920] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-white/60">Ministry of Home Affairs,</p>
                    <p className="text-xs text-white/60">North Block, New Delhi - 110001</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 bg-[#001540]">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-[10px] text-white/30 font-medium">
              © 2024 नागरिक सूचना पोर्टल | भारत सरकार | Government of India
            </p>
            <div className="flex items-center gap-5 text-[10px] text-white/30">
              <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms of Use</Link>
              <Link href="#" className="hover:text-white transition-colors">Disclaimer</Link>
              <Link href="#" className="hover:text-white transition-colors">Sitemap</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
