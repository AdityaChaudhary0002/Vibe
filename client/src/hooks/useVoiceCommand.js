
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const useVoiceCommand = () => {
    const navigate = useNavigate();
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");

    const processCommand = (command) => {
        command = command.toLowerCase();

        // Hinglish & English Commands
        if (command.includes("home") || command.includes("feed") || command.includes("ghar")) {
            navigate("/");
            toast.success("Navigating to Feed 🏠");
        } else if (command.includes("profile") || command.includes("account") || command.includes("apna") || command.includes("meri profile")) {
            navigate("/profile");
            toast.success("Opening Profile 👤");
        } else if (command.includes("message") || command.includes("chat") || command.includes("baat")) {
            navigate("/messages");
            toast.success("Opening Messages 💬");
        } else if (command.includes("discover") || command.includes("search") || command.includes("dhundo")) {
            navigate("/discover");
            toast.success("Opening Discover 🔍");
        } else if (command.includes("notification") || command.includes("alert") || command.includes("khabar")) {
            navigate("/notifications");
            toast.success("Checking Notifications 🔔");
        } else if (command.includes("connections") || command.includes("network") || command.includes("dost")) {
            navigate("/connections");
            toast.success("Opening Connections 🤝");
        } else if (command.includes("create") || (command.includes("new") && command.includes("post")) || command.includes("likho") || command.includes("post karo")) {
            navigate("/create-post");
            toast.success("Let's Create a Post ✍️");
        } else if (command.includes("dark mode") || command.includes("andhera") || command.includes("kala")) {
            document.documentElement.classList.add("dark");
            toast.success("Dark Mode Enabled 🌙");
        } else if (command.includes("light mode") || command.includes("ujala") || command.includes("safed")) {
            document.documentElement.classList.remove("dark");
            toast.success("Light Mode Enabled ☀️");
        } else if (command.includes("caption") || command.includes("ai")) {
            navigate("/create-post");
            setTimeout(() => {
                toast("Click '✨ AI Generate' to create caption!", { icon: "🤖" });
            }, 800);
        } else {
            toast("Did not catch that: " + command, { icon: "🤷‍♂️" });
        }
    };

    const startListening = useCallback(() => {
        if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
            toast.error("Voice recognition not supported in this browser.");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.lang = "en-US"; // Can be dynamic based on preference
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event) => {
            const command = event.results[0][0].transcript;
            setTranscript(command);
            processCommand(command);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
            if (event.error === 'not-allowed') {
                toast.error("Please allow microphone access.");
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    }, [navigate]);

    return { isListening, transcript, startListening };
};

export default useVoiceCommand;
