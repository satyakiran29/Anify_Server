const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const widgetsDir = path.join(__dirname, 'KWGT-Widgets-Temp', 'widgets');
const previewsDir = path.join(__dirname, 'KWGT-Widgets-Temp', 'docs', 'previews');
const targetDir = path.join(__dirname, 'public', 'uploads', 'kwgt');
const jsonFile = path.join(__dirname, 'kwgts.json');

// Ensure target directory exists
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

// Read existing kwgts
let kwgts = [];
if (fs.existsSync(jsonFile)) {
    kwgts = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
}

// Get list of widgets
const files = fs.readdirSync(widgetsDir);

files.forEach(file => {
    if (file.endsWith('.kwgt')) {
        const widgetPath = path.join(widgetsDir, file);
        const targetWidgetPath = path.join(targetDir, file);

        // Copy widget file
        fs.copyFileSync(widgetPath, targetWidgetPath);

        // Check for preview
        const previewFile = file + '.png';
        const previewPath = path.join(previewsDir, previewFile);
        const targetPreviewPath = path.join(targetDir, previewFile);

        let hasPreview = false;
        if (fs.existsSync(previewPath)) {
            fs.copyFileSync(previewPath, targetPreviewPath);
            hasPreview = true;
        } else {
            // Check for Dark variant if normal doesn't exist?
            // Just copy the one that exists if any
        }

        // Name from filename
        let name = file.replace('.kwgt', '').replace(/_/g, ' ');

        // Check if already exists
        const exists = kwgts.find(k => k.name === name || k.url.includes(file));
        if (!exists) {
            kwgts.push({
                name: name,
                author: "Anify",
                authorUrl: "https://github.com/satyakiran29",
                url: `https://raw.githubusercontent.com/satyakiran29/Anify_Server/main/public/uploads/kwgt/${file}`,
                thumbnail: hasPreview ? `https://raw.githubusercontent.com/satyakiran29/Anify_Server/main/public/uploads/kwgt/${previewFile}` : "",
                copyright: "Free",
                category: "General",
                id: crypto.randomBytes(16).toString('hex')
            });
        }
    }
});

fs.writeFileSync(jsonFile, JSON.stringify(kwgts, null, 2));
console.log('Widgets added successfully!');
