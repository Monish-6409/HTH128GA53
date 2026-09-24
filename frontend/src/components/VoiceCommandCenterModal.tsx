import React, { useState } from "react";
import { 
  Mic, MicOff, Send, Volume2, X, Command, Sparkles, 
  CheckCircle, ArrowRight, ShieldAlert, Cpu
} from "lucide-react";
import { VoiceCommandResponse } from "../types";

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendCommand: (cmd: string) => Promise<VoiceCommandResponse | void>;
}

export const VoiceCommandCenterModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  onSendCommand
}) => {
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [lastResponse, setLastResponse] = useState<VoiceCommandResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const quickCommands = [
    "Show critical zones",
    "Show available rescue boats",
    "Generate situation report",
    "Recalculate response plan",
    "Show nearby hospitals",
    "Activate evacuation plan"
  ];

  const handleExecute = async (cmd: string) => {
    if (!cmd.trim()) return;
    setIsLoading(true);
    try {
      const res = await onSendCommand(cmd);
      if (res) {
        setLastResponse(res);
        // Play synthetic voice if available in browser
        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(res.speech_response);
          utterance.rate = 1.05;
          window.speechSynthesis.speak(utterance);
        }
      }
    } finally {
      setIsLoading(false);
      setInputText("");
    }
  };

  const handleStartListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Web Speech Recognition API is not supported in this browser. Please use text input or quick command buttons.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);

    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript;
      setInputText(speechResult);
      handleExecute(speechResult);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Command className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm tracking-wide uppercase flex items-center gap-2">
                Voice Command Center & Tactical Assistant
              </h3>
              <p className="text-xs text-slate-400">
                Natural Language Command Parser & Bull; Speech-to-Text & Synthetic Feedback
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Microphone Interactive Radar */}
        <div className="text-center py-3 bg-slate-950/80 rounded-lg border border-slate-800 flex flex-col items-center justify-center space-y-2">
          <button
            onClick={handleStartListening}
            className={`relative p-4 rounded-full transition-all border ${
              isListening
                ? "bg-red-600 text-white border-red-400 animate-pulse glow-red"
                : "bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-400 glow-cyan"
            }`}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          <span className="text-xs font-mono text-slate-300">
            {isListening ? "Listening... Speak your command now" : "Click to Speak Voice Command"}
          </span>
        </div>

        {/* Quick Command Presets */}
        <div>
          <span className="text-slate-400 text-xs font-mono block mb-1.5 font-semibold">
            Common Tactical Voice Directives:
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {quickCommands.map((cmd) => (
              <button
                key={cmd}
                onClick={() => handleExecute(cmd)}
                className="text-left p-2 rounded bg-slate-950/70 hover:bg-slate-800 border border-slate-800/80 hover:border-cyan-800 text-xs text-slate-200 transition-colors truncate"
              >
                &bull; "{cmd}"
              </button>
            ))}
          </div>
        </div>

        {/* Text Input Fallback */}
        <div className="flex gap-2">
          <input 
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleExecute(inputText)}
            placeholder="Type voice directive (e.g., 'Recalculate response plan')..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          />
          <button
            onClick={() => handleExecute(inputText)}
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors disabled:opacity-40"
          >
            Send
          </button>
        </div>

        {/* Last Command Response Output */}
        {lastResponse && (
          <div className="bg-slate-950 border border-cyan-900/60 p-3 rounded-lg text-xs font-mono space-y-1.5">
            <div className="flex items-center justify-between text-cyan-400 text-[11px]">
              <span className="flex items-center gap-1 font-bold">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                Intent: {lastResponse.intent}
              </span>
              <span className="text-slate-500">Action: {lastResponse.action_taken}</span>
            </div>
            <p className="text-slate-200 font-sans text-xs bg-slate-900/80 p-2 rounded border border-slate-800 leading-relaxed">
              <Volume2 className="w-3.5 h-3.5 inline text-cyan-400 mr-1.5 -mt-0.5" />
              "{lastResponse.speech_response}"
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
