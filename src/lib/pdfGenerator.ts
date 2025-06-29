// PDF Generation Service using html2canvas and jsPDF
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

export interface PDFGenerationOptions {
    filename?: string;
    quality?: number;
    format?: 'a4' | 'letter';
    orientation?: 'portrait' | 'landscape';
}

export class PDFGenerator {
    /**
     * Generate PDF from HTML element
     * @param element - HTML element to convert to PDF
     * @param options - PDF generation options
     */
    static async generateFromElement(
        element: HTMLElement,
        options: PDFGenerationOptions = {}
    ): Promise<Blob> {
        const {
            filename = 'prescription.pdf',
            quality = 1.0,
            format = 'a4',
            orientation = 'portrait'
        } = options;

        try {
            // Hide print button and other non-printable elements
            const printHiddenElements = element.querySelectorAll('.print\\:hidden');
            const originalDisplays: string[] = [];

            printHiddenElements.forEach((el, index) => {
                const htmlEl = el as HTMLElement;
                originalDisplays[index] = htmlEl.style.display;
                htmlEl.style.display = 'none';
            });

            // Generate canvas from HTML element
            const canvas = await html2canvas(element, {
                scale: 2, // Higher scale for better quality
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
            });

            // Restore hidden elements
            printHiddenElements.forEach((el, index) => {
                const htmlEl = el as HTMLElement;
                htmlEl.style.display = originalDisplays[index];
            });

            // Create PDF
            const imgData = canvas.toDataURL('image/png', quality);
            const pdf = new jsPDF({
                orientation,
                unit: 'mm',
                format,
            });

            // Calculate dimensions
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 0;

            pdf.addImage(
                imgData,
                'PNG',
                imgX,
                imgY,
                imgWidth * ratio,
                imgHeight * ratio
            );

            // Return as blob
            return pdf.output('blob');
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw new Error('Failed to generate PDF');
        }
    }

    /**
     * Download PDF file
     * @param blob - PDF blob
     * @param filename - File name for download
     */
    static downloadPDF(blob: Blob, filename: string = 'prescription.pdf'): void {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}
