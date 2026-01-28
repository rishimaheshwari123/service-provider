const fs = require('fs');
const { jsPDF } = require('jspdf');

// Read the markdown file
const markdownContent = fs.readFileSync('API_Documentation.md', 'utf8');

// Create new PDF document
const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
});

// Set font
doc.setFont('helvetica');

// Title page
doc.setFontSize(24);
doc.setTextColor(0, 102, 204); // Blue color
doc.text('Service Provider Platform', 105, 40, { align: 'center' });

doc.setFontSize(20);
doc.setTextColor(0, 0, 0); // Black color
doc.text('Backend API Documentation', 105, 55, { align: 'center' });

doc.setFontSize(12);
doc.text('Complete Developer Guide', 105, 70, { align: 'center' });

// Add date
const currentDate = new Date().toLocaleDateString();
doc.setFontSize(10);
doc.text(`Generated on: ${currentDate}`, 105, 85, { align: 'center' });

// Add a line
doc.setLineWidth(0.5);
doc.line(20, 95, 190, 95);

// Convert markdown to plain text and format for PDF
let yPosition = 110;
const pageHeight = 297; // A4 height in mm
const margin = 20;
const lineHeight = 6;

// Split content into lines and process
const lines = markdownContent.split('\n');
let currentFontSize = 10;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if we need a new page
    if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
    }
    
    // Handle different markdown elements
    if (line.startsWith('# ')) {
        // Main heading
        doc.setFontSize(16);
        doc.setTextColor(0, 102, 204);
        doc.text(line.replace('# ', ''), margin, yPosition);
        yPosition += 10;
    } else if (line.startsWith('## ')) {
        // Sub heading
        doc.setFontSize(14);
        doc.setTextColor(0, 51, 102);
        doc.text(line.replace('## ', ''), margin, yPosition);
        yPosition += 8;
    } else if (line.startsWith('### ')) {
        // Sub-sub heading
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(line.replace('### ', ''), margin, yPosition);
        yPosition += 7;
    } else if (line.startsWith('#### ')) {
        // Minor heading
        doc.setFontSize(11);
        doc.setTextColor(51, 51, 51);
        doc.text(line.replace('#### ', ''), margin, yPosition);
        yPosition += 6;
    } else if (line.startsWith('```')) {
        // Code block
        if (line.includes('json') || line.includes('javascript') || line.includes('env')) {
            doc.setFontSize(9);
            doc.setTextColor(0, 100, 0);
            yPosition += 3;
        }
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
        // Bullet points
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text('• ' + line.replace(/^[- *] /, ''), margin + 5, yPosition);
        yPosition += 5;
    } else if (line.startsWith('**') && line.endsWith('**')) {
        // Bold text
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(line.replace(/\*\*/g, ''), margin, yPosition);
        yPosition += 5;
    } else if (line.trim() === '') {
        // Empty line
        yPosition += 3;
    } else if (line.trim() !== '' && !line.startsWith('---')) {
        // Regular text
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        
        // Handle long lines by splitting them
        const maxWidth = 170;
        const words = line.split(' ');
        let currentLine = '';
        
        for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const textWidth = doc.getTextWidth(testLine);
            
            if (textWidth > maxWidth && currentLine) {
                doc.text(currentLine, margin, yPosition);
                yPosition += 5;
                currentLine = word;
                
                // Check for new page
                if (yPosition > pageHeight - 30) {
                    doc.addPage();
                    yPosition = 20;
                }
            } else {
                currentLine = testLine;
            }
        }
        
        if (currentLine) {
            doc.text(currentLine, margin, yPosition);
            yPosition += 5;
        }
    }
}

// Add footer with page numbers
const pageCount = doc.internal.getNumberOfPages();
for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Page ${i} of ${pageCount}`, 105, pageHeight - 10, { align: 'center' });
    doc.text('Service Provider Platform - API Documentation', 105, pageHeight - 5, { align: 'center' });
}

// Save the PDF
doc.save('Service_Provider_API_Documentation.pdf');
console.log('PDF documentation generated successfully: Service_Provider_API_Documentation.pdf');