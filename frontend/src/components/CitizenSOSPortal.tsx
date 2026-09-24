import React, { useState } from "react";
import { 
  AlertOctagon, Mic, Send, Globe, Phone, MapPin, 
  Users, HeartPulse, Check, CopyCheck, AlertCircle, Volume2
} from "lucide-react";
import { CitizenSOS, PriorityLevel } from "../types";

interface SOSPortalProps {
  sosReports: CitizenSOS[];
  onSubmitSOS: (data: Partial<CitizenSOS>) => void;
  onVoiceReport: (text: string, lang: string) => void;
  isSubmitting: boolean;
}

export const CitizenSOSPortal: React.FC<SOSPortalProps> = ({
  sosReports,
  onSubmitSOS,
  onVoiceReport,
  isSubmitting
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<"English" | "Tamil" | "Hindi">("English");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState<CitizenSOS["emergency_type"]>("Trapped");
  const [peopleCount, setPeopleCount] = useState<number>(2);
  const [medicalEmergency, setMedicalEmergency] = useState(false);
  const [trappedStatus, setTrappedStatus] = useState(true);
  const [description, setDescription] = useState("");
  const [voiceText, setVoiceText] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  // Localization strings
  const i18n = {
    English: {
      portalTitle: "Citizen Emergency SOS Portal",
      desc: "Instant lifeline for stranded citizens & field scouts. Automatically triaged by TRIAGE & CONVOY agents.",
      nameLabel: "Your Name",
      phoneLabel: "Phone Number",
      locLabel: "Exact Location / Landmark",
      catLabel: "Emergency Category",
      countLabel: "Number of People",
      medLabel: "Critical Medical Emergency?",
      trapLabel: "Physically Trapped by Floodwaters?",
      descLabel: "Urgent Details",
      descPlaceholder: "Describe water height, medical conditions, power status...",
      submitBtn: "Transmit Emergency SOS Beacon",
      voiceTab: "Voice Emergency SOS",
      voicePrompt: "Press microphone to speak your emergency report or enter transcript below:",
      recentReports: "Live SOS Inflow Stream",
      duplicateDetected: "Duplicate report cluster matched — consolidated with primary beacon"
    },
    Tamil: {
      portalTitle: "பொதுமக்கள் அவசர SOS தளம்",
      desc: "வெள்ளத்தில் சிக்கிய மக்களுக்கான நேரடி அவசர உதவி தளம். ஏஜெண்டுகளால் உடனடியாக வகைப்படுத்தப்படும்.",
      nameLabel: "உங்கள் பெயர்",
      phoneLabel: "தொலைபேசி எண்",
      locLabel: "இடம் / அடையாளம்",
      catLabel: "அவசர வகை",
      countLabel: "நபர்களின் எண்ணிக்கை",
      medLabel: "அவசர மருத்துவ தேவையா?",
      trapLabel: "வெள்ளத்தில் சிக்கியுள்ளீர்களா?",
      descLabel: "விவரங்கள்",
      descPlaceholder: "தண்ணீரின் அளவு, முதியவர்கள்/குழந்தைகள் உள்ளார்களா என்பதை குறிப்பிடவும்...",
      submitBtn: "அவசர உதவி கோரிக்கை அனுப்புக",
      voiceTab: "குரல் வழி அவசர செய்தி",
      voicePrompt: "மைக்ரோஃபோனை அழுத்தி அவசர தகவலை பேசவும்:",
      recentReports: "நேரடி அவசர கோரிக்கைகள்",
      duplicateDetected: "ஒரே பகுதியில் ஒரே மாதிரியான கோரிக்கை கண்டறியப்பட்டது"
    },
    Hindi: {
      portalTitle: "नागरिक आपातकालीन SOS पोर्टल",
      desc: "बाढ़ में फंसे नागरिकों के लिए त्वरित आपातकालीन सहायता सेवा।",
      nameLabel: "आपका नाम",
      phoneLabel: "फ़ोन नंबर",
      locLabel: "सटीक स्थान / पता",
      catLabel: "आपातकाल श्रेणी",
      countLabel: "लोगों की संख्या",
      medLabel: "क्या गंभीर चिकित्सा आपातकाल है?",
      trapLabel: "क्या आप पानी में फंसे हुए हैं?",
      descLabel: "विवरण",
      descPlaceholder: "पानी का स्तर, चिकित्सा स्थिति आदि का विवरण दें...",
      submitBtn: "आपातकालीन SOS भेजें",
      voiceTab: "वॉयस आपातकालीन रिपोर्ट",
      voicePrompt: "आपातकालीन संदेश रिकॉर्ड करने के लिए माइक दबाएं:",
      recentReports: "लाइव आपातकालीन रिपोर्ट",
      duplicateDetected: "समान क्षेत्र की रिपोर्ट पहचानी गई"
    }
  };

  const t = i18n[selectedLanguage];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description && !address) return;

    onSubmitSOS({
      name: name || "Anonymous Citizen",
      phone: phone || "+91-98000-00000",
      address: address || "Zone A — Marina Sector",
      lat: 13.0830 + (Math.random() * 0.008 - 0.004),
      lng: 80.2780 + (Math.random() * 0.008 - 0.004),
      emergency_type: category,
      people_count: Number(peopleCount),
      medical_emergency: medicalEmergency,
      trapped_status: trappedStatus,
      description: description,
      language: selectedLanguage
    });

    setDescription("");
    setName("");
    setPhone("");
    setAddress("");
  };

  const handleSimulateVoice = () => {
    let sample = "";
    if (selectedLanguage === "Tamil") {
      sample = "நாங்கள் மெரினா சாலையில் உள்ள அடுக்குமாடி குடியிருப்பின் 2வது மாடியில் 5 பேர் சிக்கியுள்ளோம். ஒருவருக்கு ஆஸ்துமா அட்டாக் வந்துள்ளது. உடனடியாக படகு தேவை.";
    } else if (selectedLanguage === "Hindi") {
      sample = "हम रीवरव्यू अपार्टमेंट में 4 लोग फंसे हुए हैं। पानी पहली मंजिल तक आ गया है। हमें तुरंत बचाव नाव चाहिए।";
    } else {
      sample = "We are 6 people trapped on the second floor balcony at Riverview Marina. Water level is 2.5 meters. One senior citizen has acute chest pain. Need emergency rescue boat immediately!";
    }
    setVoiceText(sample);
  };

  const handleSendVoice = () => {
    if (!voiceText) return;
    const langCode = selectedLanguage === "Tamil" ? "ta" : (selectedLanguage === "Hindi" ? "hi" : "en");
    onVoiceReport(voiceText, langCode);
    setVoiceText("");
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 shadow-xl space-y-4">
      
      {/* Header & Language Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-red-950/80 border border-red-500/40 text-red-400">
            <AlertOctagon className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-bold text-slate-100 text-sm tracking-wide uppercase flex items-center gap-2">
              {t.portalTitle}
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800/50">
                Multilingual SOS
              </span>
            </h2>
            <p className="text-xs text-slate-400">{t.desc}</p>
          </div>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-md border border-slate-800 text-xs">
          <Globe className="w-3.5 h-3.5 text-cyan-400 ml-1 mr-0.5" />
          {(["English", "Tamil", "Hindi"] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${
                selectedLanguage === lang
                  ? "bg-cyan-600 text-white font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {lang === "Tamil" ? "தமிழ்" : lang === "Hindi" ? "हिन्दी" : "English"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="space-y-3 bg-slate-950/70 p-3.5 rounded-lg border border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-mono text-[11px]">{t.nameLabel}</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1 font-mono text-[11px]">{t.phoneLabel}</label>
              <input 
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91-98765-43210"
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="text-slate-400 block mb-1 font-mono text-[11px]">{t.locLabel}</label>
            <input 
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Riverview Apartments, Block 4, Marina Sector"
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-mono text-[11px]">{t.catLabel}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
              >
                <option value="Trapped">Trapped (High Water)</option>
                <option value="Medical">Medical Emergency</option>
                <option value="Flood">Flood Inundation</option>
                <option value="Food/Water">Food / Clean Water</option>
                <option value="Evacuation">Evacuation Assistance</option>
                <option value="Fire">Fire / Electrical Hazard</option>
                <option value="Missing Person">Missing Person</option>
                <option value="Other">Other Emergency</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-mono text-[11px]">{t.countLabel}</label>
              <input 
                type="number"
                min="1"
                max="100"
                value={peopleCount}
                onChange={(e) => setPeopleCount(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
              />
            </div>
          </div>

          {/* Critical Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
            <label className="flex items-center gap-2 p-2 rounded bg-slate-900 border border-slate-800 cursor-pointer">
              <input 
                type="checkbox"
                checked={medicalEmergency}
                onChange={(e) => setMedicalEmergency(e.target.checked)}
                className="rounded border-slate-700 text-red-500 focus:ring-0"
              />
              <span className="text-red-300 font-medium text-[11px]">{t.medLabel}</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded bg-slate-900 border border-slate-800 cursor-pointer">
              <input 
                type="checkbox"
                checked={trappedStatus}
                onChange={(e) => setTrappedStatus(e.target.checked)}
                className="rounded border-slate-700 text-amber-500 focus:ring-0"
              />
              <span className="text-amber-300 font-medium text-[11px]">{t.trapLabel}</span>
            </label>
          </div>

          {/* Description */}
          <div className="text-xs">
            <label className="text-slate-400 block mb-1 font-mono text-[11px]">{t.descLabel}</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.descPlaceholder}
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs shadow-md transition-all border border-red-500/40 glow-red disabled:opacity-50"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>{t.submitBtn}</span>
          </button>
        </form>

        {/* Voice SOS & Stream Column */}
        <div className="space-y-3">
          
          {/* Voice Emergency Section */}
          <div className="bg-slate-950/70 p-3.5 rounded-lg border border-cyan-900/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-cyan-400" />
                <h4 className="font-mono text-xs font-bold text-cyan-300 uppercase">
                  {t.voiceTab}
                </h4>
              </div>
              <button
                type="button"
                onClick={handleSimulateVoice}
                className="text-[10px] text-cyan-400 hover:underline font-mono"
              >
                Insert Sample ({selectedLanguage})
              </button>
            </div>

            <p className="text-[11px] text-slate-400 mb-2">{t.voicePrompt}</p>

            <textarea
              rows={2}
              value={voiceText}
              onChange={(e) => setVoiceText(e.target.value)}
              placeholder="e.g. 'Trapped on 2nd floor, 5 people, water 2.5m, medical need'..."
              className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 mb-2 font-mono"
            />

            <button
              onClick={handleSendVoice}
              disabled={!voiceText.trim() || isSubmitting}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded bg-cyan-900/60 hover:bg-cyan-800/80 text-cyan-200 text-xs font-semibold border border-cyan-700/60 transition-colors disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Transcribe & Dispatch to Agent Council</span>
            </button>
          </div>

          {/* Active SOS Stream */}
          <div>
            <h4 className="font-mono text-xs font-bold text-slate-300 uppercase mb-2 flex items-center justify-between">
              <span>{t.recentReports} ({sosReports.length})</span>
              <span className="text-[10px] text-slate-500 font-mono">Real-Time Inflow</span>
            </h4>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {sosReports.slice(0, 5).map((sos) => {
                const isDup = Boolean(sos.duplicate_of);
                return (
                  <div 
                    key={sos.id}
                    className={`p-2.5 rounded-lg border text-xs transition-colors ${
                      isDup 
                        ? "bg-slate-950/40 border-slate-800 text-slate-400" 
                        : "bg-slate-950 border-slate-800 text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 font-mono text-[11px] mb-1">
                      <span className="font-bold text-slate-100 flex items-center gap-1">
                        {sos.name}
                        {sos.duplicate_of && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800">
                            Duplicate Cluster
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500">{sos.timestamp}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          sos.severity === "CRITICAL" ? "bg-red-950 text-red-400 border border-red-800" : "bg-amber-950 text-amber-400 border border-amber-800"
                        }`}>
                          {sos.emergency_type}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-tight mb-1">
                      {sos.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>People: <strong>{sos.people_count}</strong> {sos.medical_emergency && "&bull; Urgent Medical"}</span>
                      <span className="text-cyan-400">Status: {sos.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
