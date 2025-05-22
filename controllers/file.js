import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const saveFile = async (req, res) => {
  try {
    const user = req.user;
    const { prompt, response, language = "txt" } = req.body;

    if (!user || !prompt || !response) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const userId = user._id?.toString() || "unknown_user";
    const timestamp = Date.now();
    const dir = path.join(__dirname, "..", "user_files", userId);
    const filename = `${timestamp}.${language}`;
    const filepath = path.join(dir, filename);

    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const contentToSave = `Prompt:\n${prompt}\n\nResponse:\n${response}`;
    fs.writeFileSync(filepath, contentToSave);

    res.json({ success: true, path: filepath });
  } catch (error) {
    console.error("Save file error:", error.message);
    res.status(500).json({ error: "Failed to save response" });
  }
};

const saveExtractedCode = async (req, res) => {
  try {
    const user = req.user;
    const userId = user._id?.toString();
    const { htmlBlocks, css, js } = req.body;

    if (!userId || !Array.isArray(htmlBlocks) || htmlBlocks.length === 0) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    const userDir = path.join(__dirname, "..", "sites", userId);

    // Create directory if it doesn't exist
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    } else {
      // Clean old files
      fs.readdirSync(userDir).forEach((file) => {
        fs.unlinkSync(path.join(userDir, file));
      });
    }

    // Save HTML blocks
    htmlBlocks.forEach((block) => {
      const filename = block.filename || `page-${Date.now()}.html`;
      const filepath = path.join(userDir, filename);
      fs.writeFileSync(filepath, block.code || "");
    });

    // Save CSS
    if (css?.trim()) {
      fs.writeFileSync(path.join(userDir, "styles.css"), css.trim());
    }

    // Save JS
    if (js?.trim()) {
      fs.writeFileSync(path.join(userDir, "script.js"), js.trim());
    }

    res.status(200).json({
      message: "Code saved",
      url: `http://${userId}.localhost:3001`,
    });
  } catch (error) {
    console.error("Error saving extracted code:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

export default {
  saveFile,
  saveExtractedCode,
};
