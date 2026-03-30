const pdfParseModule = require('pdf-parse');
console.log('PDFParse export:', pdfParseModule.PDFParse);
console.log('Type of PDFParse:', typeof pdfParseModule.PDFParse);
if (pdfParseModule.PDFParse) {
    console.log('PDFParse is definitely an export!');
} else {
    console.log('PDFParse is NOT an export. Available keys:', Object.keys(pdfParseModule));
}
