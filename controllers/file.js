import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const saveFile = async (req, res, next) => {
  try {
    const user = req.user;
    const { prompt, response, language = "txt" } = req.body;

    const userId = user.id || "unknown_user"; // adapt to your token payload
    const timestamp = Date.now();
    const dir = path.join("user_files", userId.toString());
    const filename = `${timestamp}.${language}`;
    const filepath = path.join(dir, filename);

    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const contentToSave = `Prompt:\n${prompt}\n\nResponse:\n${response}`;

    fs.writeFile(filepath, contentToSave, (err) => {
      if (err) {
        console.error("File save error:", err);
        return res.status(500).json({ error: "Failed to save response" });
      }
      return res.json({ success: true, path: filepath });
    });
  } catch (error) {
    console.error(error.message);
  }
};

const saveExtractedCode = async (req, res, next) => {
  try {
    const user = req.user;
    const userId = user.id.toString();
    const { htmlBlocks, css, js } = req.body;
    
    if (
      !userId ||
      !htmlBlocks ||
      !Array.isArray(htmlBlocks) ||
      htmlBlocks.length === 0
    ) {
      return res.status(400).json({ error: "Missing or invalid data" });
    }
    
    const userDir = path.join(__dirname, "../sites", userId);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    } else {
      // Clean up previous files before saving new ones
      const existingFiles = fs.readdirSync(userDir);
      existingFiles.forEach(file => {
        fs.unlinkSync(path.join(userDir, file));
      });
    }
    
    // Save each HTML file using its specified filename
    htmlBlocks.forEach((block) => {
      const filename = block.filename || `page-${Date.now()}.html`;
      const filepath = path.join(userDir, filename);
      fs.writeFileSync(filepath, block.code || "");
    });
    
    // Save CSS if provided
    if (css && css.trim()) {
      fs.writeFileSync(path.join(userDir, "styles.css"), css.trim());
    }
    
    // Save JS if provided
    if (js && js.trim()) {
      fs.writeFileSync(path.join(userDir, "script.js"), js.trim());
    }
    
    res
      .status(200)
      .json({ message: "Code saved", url: `http://${userId}.localhost:3001` });
  } catch (error) {
    console.error("Error saving extracted code:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};



const fileController = {
  saveFile,
  saveExtractedCode
};

export default fileController;
