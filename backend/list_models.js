require('dotenv').config();
async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const flashModels = data.models.filter(m => m.name.includes('flash')).map(m => m.name);
        require('fs').writeFileSync('models.json', JSON.stringify(flashModels, null, 2));
        console.log("Wrote full names to models.json");
    } catch (e) {
        console.error(e);
    }
}
listModels();
