
import React from "react";
import { Mic, MicOff } from "lucide-react";
import useVoiceCommand from "../hooks/useVoiceCommand";

const VoiceAssistant = () => {
    const { isListening, startListening } = useVoiceCommand();

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <button
                onClick={startListening}
                className={`p-4 rounded-full shadow-lg transition-all duration-300 ${isListening
                        ? "bg-red-500 hover:bg-red-600 animate-pulse scale-110"
                        : "bg-indigo-600 hover:bg-indigo-700 hover:scale-105"
                    }`}
                title="Voice Command"
            >
                {isListening ? (
                    <MicOff className="text-white w-6 h-6" />
                ) : (
                    <Mic className="text-white w-6 h-6" />
                )}
            </button>
            {isListening && (
                <span className="absolute -top-10 right-0 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    Listening...
                </span>
            )}
        </div>
    );
};

export default VoiceAssistant;
