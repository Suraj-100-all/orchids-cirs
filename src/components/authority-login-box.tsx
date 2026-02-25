"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Lock, User, UserPlus, Info, LogIn } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { incidentCategories, getOfficerByEmail } from "@/lib/incident-data";

export function AuthorityLoginBox() {
  const router = useRouter();
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!department || !email || !password) {
      setError("कृपया सभी जानकारी भरें।");
      return;
    }
    setIsLoading(true);
    try {
      const officer = await getOfficerByEmail(email);
      if (!officer) { setError("अधिकारी नहीं मिला। कृपया पंजीकरण करें।"); return; }
      if (officer.status !== "approved") { setError("आपका खाता अभी स्वीकृत नहीं हुआ है।"); return; }
      if (password === "admin123") {
        localStorage.setItem("authority_auth", JSON.stringify({
          isLoggedIn: true, department, email,
          username: officer.fullName, id: officer.id
        }));
        router.push("/authority/dashboard");
      } else {
        setError("गलत पासवर्ड। कृपया पुनः प्रयास करें।");
      }
    } catch { setError("लॉगिन में तकनीकी समस्या आई।"); }
    finally { setIsLoading(false); }
  };

  const inputClass = "h-10 rounded border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-[#003580] focus:border-[#003580] text-sm transition-all";

  return (
    <div className="bg-white border border-slate-200 rounded overflow-hidden">
      {/* Header */}
      <div className="bg-[#003580] px-4 py-3 flex items-center gap-2.5">
        <div className="bg-[#f47920] p-1.5 rounded">
          <Shield className="h-4 w-4 text-white" />
        </div>
        <div>
          <h4 className="text-white font-black text-sm">अधिकारी लॉगिन</h4>
          <p className="text-white/50 text-[9px] uppercase tracking-widest">Authorized Authority Access</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="p-4 space-y-3">
        {/* Department */}
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1 mb-1.5">
            <span className="w-1 h-2.5 bg-[#f47920] rounded-full" /> विभाग / Department
          </label>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className={`${inputClass} w-full`}>
              <SelectValue placeholder="विभाग चुनें" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="font-bold text-sm">सभी विभाग / All</SelectItem>
              {incidentCategories.map((c) => (
                <SelectItem key={c.id} value={c.id} className="text-sm">{c.authority}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Email */}
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1 mb-1.5">
            <span className="w-1 h-2.5 bg-[#f47920] rounded-full" /> ईमेल / Email
          </label>
          <div className="relative">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@gov.in"
              className={`${inputClass} pl-9`}
            />
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1 mb-1.5">
            <span className="w-1 h-2.5 bg-[#f47920] rounded-full" /> पासवर्ड
          </label>
          <div className="relative">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`${inputClass} pl-9`}
            />
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-600 p-2.5 rounded-r flex items-start gap-2 animate-in fade-in duration-200">
            <Info className="h-3.5 w-3.5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-[11px] font-bold text-red-700">{error}</p>
          </div>
        )}

        {/* Login button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#003580] hover:bg-[#002060] disabled:opacity-60 text-white font-black text-sm py-2.5 rounded flex items-center justify-center gap-2 transition-all"
        >
          {isLoading ? (
            <>
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              लॉगिन हो रहा है...
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              लॉगिन करें / Secure Login
            </>
          )}
        </button>

        {/* Register link */}
        <div className="pt-2 border-t border-slate-100">
          <Link href="/authority/register">
            <button
              type="button"
              className="w-full border border-slate-200 text-slate-500 hover:text-[#003580] hover:border-[#003580] hover:bg-slate-50 text-[11px] font-black uppercase tracking-wider py-2 rounded flex items-center justify-center gap-2 transition-all"
            >
              <UserPlus className="h-3.5 w-3.5" />
              नया पंजीकरण / Register
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
}
