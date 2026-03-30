const pdfParseNode = require('pdf-parse/node');
console.log('Full keys of pdfParseNode:', JSON.stringify(Object.keys(pdfParseNode)));
for (const key of Object.keys(pdfParseNode)) {
    console.log(`Key: ${key}, Type: ${typeof pdfParseNode[key]}`);
}
if (pdfParseNode.default) {
    console.log('pdfParseNode.default keys:', Object.keys(pdfParseNode.default));
}
