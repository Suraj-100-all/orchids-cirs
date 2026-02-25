"use client";

import { useState, useRef } from "react";
import {
  Camera as LucideCamera, MapPin, Phone, User, Send,
  Loader2, RefreshCcw, Info, FileText, Clock, Shield, AlertTriangle
} from "lucide-react";
import exifr from "exifr";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { incidentCategories, type IncidentCategory } from "@/lib/incident-data";

type ReportFormProps = {
  onSubmit: (data: {
    category: IncidentCategory; description: string; location: string;
    reporterName: string; reporterPhone: string; imageUrl: string;
  }) => void;
};

export function ReportForm({ onSubmit }: ReportFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtractingLocation, setIsExtractingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getCurrentLocation = (timeout = 8000): Promise<{ latitude: number; longitude: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        toast.error("आपका ब्राउज़र लोकेशन सपोर्ट नहीं करता।");
        resolve(null); return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
          (err) => { if (err.code === 1) toast.error("लोकेशन परमिशन नहीं दी गई।"); resolve(null); },
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
        ),
        { enableHighAccuracy: true, timeout, maximumAge: 0 }
      );
    });
  };

  const fetchAndSetLocation = async (file?: File, silent = false) => {
    setIsExtractingLocation(true);
    try {
      let coords: { latitude: number; longitude: number } | null = null;
      if (file) {
        try {
          const exif = await exifr.gps(file);
          if (exif?.latitude && exif?.longitude) coords = { latitude: exif.latitude, longitude: exif.longitude };
        } catch {}
      }
      if (!coords) coords = await getCurrentLocation();
      if (coords) {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}&accept-language=hi,en`,
          { headers: { "User-Agent": "CitizenIncidentReportingApp/1.0" } }
        );
        if (res.ok) {
          const data = await res.json();
          if (data?.display_name) {
            setLocation(data.display_name);
            if (!silent) toast.success("लोकेशन अपडेट हो गई!");
          } else {
            setLocation(`${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`);
          }
        }
      } else if (!file && !silent) {
        toast.info("लोकेशन नहीं मिल सकी। कृपया मैन्युअली भरें।");
      }
    } catch { if (!silent) toast.error("लोकेशन लोड करने में समस्या आई।"); }
    finally { setIsExtractingLocation(false); }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      await fetchAndSetLocation(file, true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !description || !location || !reporterName || !reporterPhone || !imagePreview) {
      toast.error("कृपया सभी अनिवार्य फील्ड भरें। / Please fill all mandatory fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      const category = incidentCategories.find((c) => c.id === selectedCategory);
      if (category) {
        await onSubmit({ category, description, location, reporterName, reporterPhone, imageUrl: imagePreview });
        setSelectedCategory(""); setDescription(""); setLocation("");
        setReporterName(""); setReporterPhone(""); setImagePreview(null);
      }
    } finally { setIsSubmitting(false); }
  };

  const selectedCategoryData = incidentCategories.find((c) => c.id === selectedCategory);

  const fieldClass = "h-11 rounded border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-[#003580] focus:border-[#003580] transition-all text-sm";
  const labelClass = "text-xs font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5 mb-2";
  const requiredDot = <span className="text-red-500 text-sm leading-none">*</span>;

  return (
    <div className="bg-white">
      {/* Form header */}
      <div className="bg-[#003580] px-6 py-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <FileText className="h-5 w-5 text-[#f47920]" />
            <h3 className="text-white font-black text-lg">नई शिकायत / रिपोर्ट दर्ज करें</h3>
          </div>
          <p className="text-white/50 text-xs">Submit New Incident Report — सभी (*) अनिवार्य हैं</p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-2 rounded shrink-0">
          <Shield className="h-4 w-4 text-[#f47920]" />
          <span className="text-[10px] font-black text-white uppercase tracking-wider">Secure</span>
        </div>
      </div>

      {/* Important notice */}
      <div className="bg-[#fff8e1] border-b border-[#f47920]/30 px-6 py-3 flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-[#f47920] mt-0.5 shrink-0" />
        <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
          <strong>ध्यान दें:</strong> यदि कोई आपात स्थिति हो, तो पहले <strong>112</strong> पर कॉल करें। यह पोर्टल गैर-आपातकालीन घटनाओं की सूचना के लिए है।
        </p>
      </div>

      {/* Form body */}
      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">

        {/* Row 1 — Category + Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}><span className="w-1 h-3 bg-[#f47920] rounded-full" /> घटना की श्रेणी {requiredDot}</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className={`${fieldClass} w-full`}>
                <SelectValue placeholder="— श्रेणी चुनें / Select Category —" />
              </SelectTrigger>
              <SelectContent>
                {incidentCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="font-medium text-sm">
                    {c.nameHindi} / {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCategoryData && (
              <div className="mt-2 bg-blue-50 border border-blue-200 px-3 py-2 rounded flex items-center gap-2 animate-in fade-in duration-200">
                <Shield className="h-3.5 w-3.5 text-[#003580] shrink-0" />
                <p className="text-[10px] text-[#003580] font-bold">{selectedCategoryData.authority}</p>
              </div>
            )}
          </div>
          <div>
            <label className={labelClass}><span className="w-1 h-3 bg-[#f47920] rounded-full" /> रिपोर्ट समय</label>
            <div className={`${fieldClass} flex items-center gap-3 px-3 bg-slate-50 cursor-default`}>
              <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="text-sm font-medium text-slate-700" suppressHydrationWarning>
                  {new Date().toLocaleString("hi-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 ml-1">समय स्वचालित रूप से दर्ज होता है।</p>
          </div>
        </div>

        {/* Photo upload */}
        <div>
          <label className={labelClass}><span className="w-1 h-3 bg-[#f47920] rounded-full" /> घटना की फोटो / Incident Photo {requiredDot}</label>
          <div
            onClick={() => { if (!imagePreview) fetchAndSetLocation(); fileInputRef.current?.click(); }}
            className={`relative border-2 border-dashed rounded cursor-pointer transition-all overflow-hidden ${
              imagePreview ? "border-[#138808] bg-green-50" : "border-slate-300 bg-slate-50 hover:border-[#003580] hover:bg-white"
            }`}
          >
            {imagePreview ? (
              <div className="flex items-start gap-4 p-4">
                <img src={imagePreview} alt="Preview" className="h-32 w-48 object-cover rounded border border-slate-200 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-[#138808] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">फोटो अपलोड हुई</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mb-3">फोटो सफलतापूर्वक अपलोड हो गई। बदलने के लिए क्लिक करें।</p>
                  <p className="text-[10px] text-slate-400">Photo uploaded. Click to replace.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="bg-[#003580]/10 p-4 rounded-full">
                  <LucideCamera className="h-8 w-8 text-[#003580]" />
                </div>
                <div className="text-center">
                  <p className="font-black text-slate-700 text-sm">फोटो कैप्चर करें या अपलोड करें</p>
                  <p className="text-[11px] text-slate-400 mt-1">Click to capture / upload incident photo (with GPS metadata)</p>
                </div>
              </div>
            )}
            {isExtractingLocation && (
              <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center gap-3 z-20">
                <Loader2 className="h-8 w-8 text-[#003580] animate-spin" />
                <p className="text-xs font-bold text-[#003580]">GPS लोकेशन प्राप्त हो रही है...</p>
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}><span className="w-1 h-3 bg-[#f47920] rounded-full" /> घटना का विवरण / Description {requiredDot}</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="घटना के बारे में स्पष्ट रूप से लिखें — क्या हुआ, कब हुआ, कितने लोग प्रभावित हैं... / Describe the incident clearly for authorities..."
            className="min-h-28 rounded border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-[#003580] text-sm resize-none"
          />
        </div>

        {/* Location */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={labelClass}><span className="w-1 h-3 bg-[#f47920] rounded-full" /> घटना का स्थान / Location {requiredDot}</label>
            <button
              type="button"
              onClick={() => fetchAndSetLocation()}
              disabled={isExtractingLocation}
              className="flex items-center gap-1.5 text-[10px] font-black text-[#003580] hover:text-[#f47920] bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded border border-slate-200 transition-all disabled:opacity-50 uppercase tracking-widest"
            >
              <RefreshCcw className={`h-3 w-3 ${isExtractingLocation ? "animate-spin" : ""}`} />
              GPS से पता पाएं
            </button>
          </div>
          <div className="relative">
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={isExtractingLocation ? "GPS डेटा प्राप्त हो रहा है..." : "पूरा पता / Complete Address with Landmark"}
              className={`${fieldClass} pl-10`}
              disabled={isExtractingLocation}
            />
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#003580]" />
          </div>
        </div>

        {/* Reporter info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}><span className="w-1 h-3 bg-[#f47920] rounded-full" /> रिपोर्टर का नाम {requiredDot}</label>
            <div className="relative">
              <Input
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="पूरा नाम / Full Name"
                className={`${fieldClass} pl-10`}
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
          </div>
          <div>
            <label className={labelClass}><span className="w-1 h-3 bg-[#f47920] rounded-full" /> मोबाइल नंबर {requiredDot}</label>
            <div className="relative">
              <Input
                value={reporterPhone}
                onChange={(e) => setReporterPhone(e.target.value)}
                placeholder="10 अंकों का मोबाइल नंबर"
                type="tel"
                maxLength={10}
                className={`${fieldClass} pl-10`}
              />
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Declaration */}
        <div className="bg-[#f0f4f8] border border-slate-200 rounded p-4 flex gap-3">
          <Info className="h-4 w-4 text-[#003580] mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-black text-[#003580] mb-1 uppercase tracking-wide">घोषणा / Declaration</p>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              मैं पुष्टि करता/करती हूँ कि दी गई जानकारी मेरी जानकारी के अनुसार सत्य है।
              असत्य सूचना देना कानूनी अपराध है।{" "}
              <span className="italic opacity-70">I confirm the information is true. False reporting is a punishable offence.</span>
            </p>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting || isExtractingLocation}
          className="w-full bg-[#003580] hover:bg-[#002060] disabled:opacity-60 text-white font-black text-base py-4 rounded flex items-center justify-center gap-3 transition-all hover:shadow-lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              रिपोर्ट जमा की जा रही है...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              रिपोर्ट जमा करें / Submit Official Report
            </>
          )}
        </button>

        <p className="text-center text-[10px] text-slate-400">
          रिपोर्ट जमा करने पर आपको एक संदर्भ संख्या मिलेगी जिससे आप अपनी रिपोर्ट की स्थिति ट्रैक कर सकते हैं।
        </p>
      </form>
    </div>
  );
}
