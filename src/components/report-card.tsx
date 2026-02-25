"use client";

import { useState } from "react";
import {
  Clock, MapPin, User, Phone, CheckCircle2, AlertCircle,
  Loader2, UserPlus, ShieldAlert, Trash2, X, Check, Shield, Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { IncidentReport } from "@/lib/incident-data";

type ReportCardProps = {
  report: IncidentReport;
  showActions?: boolean;
  onStatusChange?: (id: string, status: IncidentReport["status"], action?: string) => void;
  onAssign?: (report: IncidentReport) => void;
  onDelete?: (id: string) => void;
};

const statusConfig = {
  pending: { label: "लंबित / Pending", color: "bg-orange-500", border: "border-orange-400", icon: AlertCircle },
  "in-progress": { label: "कार्यवाही में / In Progress", color: "bg-blue-600", border: "border-blue-500", icon: Loader2 },
  resolved: { label: "समाधान / Resolved", color: "bg-[#138808]", border: "border-green-600", icon: CheckCircle2 },
};

const priorityConfig = {
  low: { label: "कम / Low", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  medium: { label: "मध्यम / Medium", bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
  high: { label: "उच्च / High", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  critical: { label: "गंभीर / Critical", bg: "bg-red-50", text: "text-red-700", border: "border-red-300" },
};

export function ReportCard({ report, showActions, onStatusChange, onAssign, onDelete }: ReportCardProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showResolveInput, setShowResolveInput] = useState(false);
  const [resolveAction, setResolveAction] = useState("");

  const status = statusConfig[report.status];
  const StatusIcon = status.icon;
  const priority = report.priority ? priorityConfig[report.priority] : null;

  const handleResolve = () => {
    if (onStatusChange && resolveAction.trim()) {
      onStatusChange(report.id, "resolved", resolveAction);
      setShowResolveInput(false);
      setResolveAction("");
    }
  };

  return (
    <div className={`bg-white border border-slate-200 rounded overflow-hidden hover:shadow-md transition-all ${
      report.priority === "critical" ? "border-l-4 border-l-red-600" : "border-l-4 border-l-[#003580]"
    }`}>
      {/* Card Header */}
      <div className="bg-[#f0f4f8] border-b border-slate-200 px-4 py-3 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Status + Priority badges */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1.5 ${status.color} text-white text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider`}>
              <StatusIcon className={`h-3 w-3 ${report.status === "in-progress" ? "animate-spin" : ""}`} />
              {status.label}
            </span>
            {priority && (
              <span className={`text-[10px] font-black px-2.5 py-1 rounded border ${priority.bg} ${priority.text} ${priority.border} uppercase tracking-wider`}>
                {priority.label}
              </span>
            )}
          </div>
          {/* Category */}
          <h3 className="font-black text-[#003580] text-base leading-tight">
            {report.category.nameHindi}
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{report.category.name}</span>
          </h3>
        </div>

        {/* Delete button */}
        {showActions && onDelete && (
          <div className="shrink-0">
            {!showConfirmDelete ? (
              <button
                onClick={(e) => { e.stopPropagation(); setShowConfirmDelete(true); }}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition-all"
                title="Delete Report"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : (
              <div className="flex items-center gap-1.5 bg-white border border-red-200 rounded p-1.5 shadow-sm animate-in fade-in zoom-in-95 duration-150">
                <span className="text-[10px] font-black text-red-600 px-1">Delete?</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(report.id); setShowConfirmDelete(false); }}
                  className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  <Check className="h-3 w-3" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowConfirmDelete(false); }}
                  className="p-1.5 bg-slate-100 text-slate-500 rounded hover:bg-slate-200 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ref ID + Time */}
      <div className="px-4 py-2 bg-white border-b border-slate-100 flex items-center justify-between">
        <span className="text-[10px] font-black font-mono text-[#003580] bg-[#003580]/5 border border-[#003580]/10 px-2 py-1 rounded">
          REF: {report.id}
        </span>
          <span className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400" suppressHydrationWarning>
            <Clock className="h-3 w-3 text-[#f47920]" />
            {new Date(report.createdAt).toLocaleDateString("hi-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </span>
      </div>

      {/* Photo */}
      <div className="relative aspect-video bg-slate-100 border-b border-slate-200 overflow-hidden">
        <img
          src={report.imageUrl}
          alt="Incident"
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#003580]/30 to-transparent" />
        <div className="absolute bottom-2 left-2">
          <span className="bg-white/90 backdrop-blur text-[10px] font-black text-[#003580] px-2 py-1 rounded flex items-center gap-1">
            <MapPin className="h-3 w-3" /> Geotagged
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Description */}
        <div className="bg-[#f0f4f8] border-l-2 border-[#f47920] px-3 py-2 rounded-r">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">विवरण / Description</p>
          <p className="text-xs text-slate-700 font-medium leading-relaxed line-clamp-3">
            {report.description}
          </p>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 p-2.5 bg-white border border-slate-100 rounded">
          <MapPin className="h-4 w-4 text-[#003580] mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">स्थान / Location</p>
            <p className="text-[11px] font-medium text-slate-700 leading-relaxed line-clamp-2">{report.location}</p>
          </div>
        </div>

        {/* Reporter info */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2.5 bg-white border border-slate-100 rounded">
            <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Reporter</p>
              <p className="text-[11px] font-bold text-slate-800 truncate">{report.reporterName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-white border border-slate-100 rounded">
            <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Contact</p>
              <p className="text-[11px] font-bold text-slate-800 truncate">{report.reporterPhone}</p>
            </div>
          </div>
        </div>

        {/* Assigned officer / Awaiting */}
        {report.assignedToName ? (
          <div className="bg-[#003580] text-white px-3 py-2.5 rounded flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded shrink-0">
              <Shield className="h-4 w-4 text-[#f47920]" />
            </div>
            <div>
              <p className="text-[9px] font-black opacity-60 uppercase tracking-widest">Assigned Officer</p>
              <p className="text-sm font-black">{report.assignedToName}</p>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 px-3 py-2.5 rounded flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-slate-300 shrink-0" />
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Awaiting Assignment</p>
              <p className="text-xs font-bold text-slate-700">{report.category.authority}</p>
              <p className="text-[9px] text-slate-400">{report.category.email}</p>
            </div>
          </div>
        )}

        {/* Action taken */}
        {report.actionTaken && (
          <div className="bg-green-50 border border-green-200 px-3 py-2.5 rounded flex gap-3">
            <CheckCircle2 className="h-5 w-5 text-[#138808] shrink-0 mt-0.5" />
            <div>
              <p className="text-[9px] font-black text-green-700 uppercase tracking-widest mb-1">कार्यवाही / Action Taken</p>
              <p className="text-xs text-slate-700 font-medium italic">"{report.actionTaken}"</p>
            </div>
          </div>
        )}

        {/* Admin actions */}
        {showActions && report.status !== "resolved" && (
          <div className="pt-2 space-y-2 border-t border-slate-100">
            <div className="flex gap-2">
              {onAssign && (
                <button
                  onClick={() => onAssign(report)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded transition-all"
                >
                  <UserPlus className="h-4 w-4" />
                  Assign Officer
                </button>
              )}
              {onStatusChange && report.status === "in-progress" && !showResolveInput && (
                <button
                  onClick={() => setShowResolveInput(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#138808] hover:bg-green-700 text-white text-xs font-black rounded transition-all"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark Resolved
                </button>
              )}
            </div>

            {onStatusChange && report.status === "in-progress" && showResolveInput && (
              <div className="bg-green-50 border border-green-200 rounded p-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-2">
                  <Info className="h-3.5 w-3.5 text-green-600" />
                  <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">Official Action Log</p>
                </div>
                <textarea
                  placeholder="की गई कार्यवाही का विवरण लिखें / Describe the action taken..."
                  className="w-full p-3 text-xs bg-white border border-green-200 rounded focus:ring-2 focus:ring-green-500/30 outline-none text-slate-800 font-medium min-h-20 resize-none"
                  value={resolveAction}
                  onChange={(e) => setResolveAction(e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleResolve}
                    disabled={!resolveAction.trim()}
                    className="flex-[2] py-2.5 bg-[#138808] text-white text-xs font-black rounded hover:bg-green-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="h-3.5 w-3.5" />
                    पुष्टि करें / Confirm
                  </button>
                  <button
                    onClick={() => { setShowResolveInput(false); setResolveAction(""); }}
                    className="flex-1 py-2.5 bg-white text-slate-500 text-xs font-black rounded border border-slate-200 hover:bg-slate-50 transition-all"
                  >
                    रद्द करें
                  </button>
                </div>
              </div>
            )}

            {onStatusChange && report.status === "pending" && !report.assignedToName && (
              <button
                onClick={() => onStatusChange(report.id, "in-progress")}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#003580] hover:bg-[#002060] text-white text-xs font-black rounded transition-all"
              >
                <Shield className="h-4 w-4 text-[#f47920]" />
                Take Immediate Action
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
