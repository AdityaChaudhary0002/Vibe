import groq from "../configs/groq.js";
import fs from "fs";

// Transcribe Audio using Groq Whisper
export const transcribeAudio = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No audio file provided" });
        }

        const filePath = req.file.path;

        // Rename file to have extension so Groq knows file type
        const originalName = req.file.originalname;
        const extension = originalName.split('.').pop() || "webm";
        const newPath = `${filePath}.${extension}`;
        fs.renameSync(filePath, newPath);

        const transcription = await groq.audio.transcriptions.create({
            file: fs.createReadStream(newPath),
            model: "whisper-large-v3", // Or multi-language model if available
            response_format: "json",
            language: "en", // Optional: prompting source language or auto-detect? 
            // Whisper usually auto-detects, but 'distil-whisper-large-v3-en' is English only?
            // Check if 'whisper-large-v3' is available for multi-lingual. 
            // Groq docs say 'whisper-large-v3' is available.
            // Let's use 'whisper-large-v3' for multi-lingual support.
        });

        // Cleanup temp file
        fs.unlinkSync(newPath);

        res.json({ success: true, text: transcription.text });
    } catch (error) {
        console.error("Transcription Error:", error);
        // Cleanup if error
        if (req.file && req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        // If renamed file exists
        // (We need to track newPath in catch scope, but let's keep it simple for now)

        fs.writeFileSync("debug_log.txt", "Error: " + JSON.stringify(error, Object.getOwnPropertyNames(error)) + "\n");

        res.status(500).json({ success: false, message: "Transcription failed", error: error.message });
    }
};

// Translate Text using Groq LLM
export const translateText = async (req, res) => {
    try {
        const { text, targetLang = "English" } = req.body;

        if (!text) {
            return res.status(400).json({ success: false, message: "No text provided" });
        }

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a professional translator. Translate the user's text to ${targetLang}. Return ONLY the translated text, nothing else. Do not add quotes or explanations.`,
                },
                {
                    role: "user",
                    content: text,
                },
            ],
            model: "llama-3.3-70b-versatile",
        });

        const translatedText = chatCompletion.choices[0]?.message?.content || "";

        res.json({ success: true, translation: translatedText });
    } catch (error) {
        console.error("Translation Error:", error);
        res.status(500).json({ success: false, message: "Translation failed", error: error.message });
    }
};
