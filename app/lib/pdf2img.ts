export interface PdfConversionResult {
    imageUrl: string;
    file: File | null;
    error?: string;
}

interface PDFJSLib {
    getDocument: (options: any) => Promise<any>;
    GlobalWorkerOptions: { workerSrc: string };
}

let pdfjsLib: PDFJSLib | null = null;
let isLoading = false;
let loadPromise: Promise<PDFJSLib> | null = null;

async function loadPdfJs(): Promise<PDFJSLib> {
    if (pdfjsLib) return pdfjsLib;
    if (loadPromise) return loadPromise;

    isLoading = true;
    
    try {
        loadPromise = import("pdfjs-dist/build/pdf.mjs").then((lib) => {
            // Set the worker source to use local file
            lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
            pdfjsLib = lib;
            isLoading = false;
            return lib;
        });

        return await loadPromise;
    } catch (error) {
        isLoading = false;
        loadPromise = null;
        throw new Error(`Failed to load PDF.js library: ${error}`);
    }
}

export async function convertPdfToImage(
    file: File,
    options: {
        scale?: number;
        quality?: number;
        maxRetries?: number;
    } = {}
): Promise<PdfConversionResult> {
    const {
        scale = 2.0,
        quality = 0.9,
        maxRetries = 2
    } = options;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const lib = await loadPdfJs();

            // Validate file
            if (!file || file.size === 0) {
                throw new Error('Invalid or empty file');
            }

            // Check file type
            if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                throw new Error('File is not a valid PDF');
            }

            // Read file as array buffer
            const arrayBuffer = await file.arrayBuffer();
            if (!arrayBuffer || arrayBuffer.byteLength === 0) {
                throw new Error('Failed to read file content');
            }

            // Load PDF document
            const pdf = await lib.getDocument({ 
                data: arrayBuffer,
                disableWorker: false,
                disableRange: false,
                disableStream: false
            }).promise;

            // Get first page
            const page = await pdf.getPage(1);
            if (!page) {
                throw new Error('Failed to load PDF page');
            }

            // Create viewport with specified scale
            const viewport = page.getViewport({ scale });
            
            // Create canvas
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");

            if (!context) {
                throw new Error('Failed to create canvas context');
            }

            // Set canvas dimensions
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            // Configure context for high quality
            context.imageSmoothingEnabled = true;
            context.imageSmoothingQuality = "high";

            // Render page to canvas
            await page.render({ 
                canvasContext: context, 
                viewport 
            }).promise;

            // Convert to blob with specified quality
            return new Promise((resolve, reject) => {
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            try {
                                // Create a File from the blob with the same name as the pdf
                                const originalName = file.name.replace(/\.pdf$/i, "");
                                const imageFile = new File([blob], `${originalName}.png`, {
                                    type: "image/png",
                                });

                                const imageUrl = URL.createObjectURL(blob);

                                resolve({
                                    imageUrl,
                                    file: imageFile,
                                });
                            } catch (error) {
                                reject(new Error(`Failed to create image file: ${error}`));
                            }
                        } else {
                            reject(new Error('Failed to create image blob'));
                        }
                    },
                    "image/png",
                    quality
                );
            });

        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            
            console.warn(`PDF conversion attempt ${attempt} failed:`, lastError.message);
            
            if (attempt === maxRetries) {
                break;
            }
            
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
        }
    }

    // All attempts failed
    return {
        imageUrl: "",
        file: null,
        error: `PDF conversion failed after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`,
    };
}

// Utility function to check if PDF.js is loaded
export function isPdfJsLoaded(): boolean {
    return pdfjsLib !== null;
}

// Utility function to get loading status
export function getPdfJsLoadingStatus(): boolean {
    return isLoading;
}

// Utility function to preload PDF.js (useful for better UX)
export async function preloadPdfJs(): Promise<void> {
    if (!pdfjsLib && !isLoading && !loadPromise) {
        await loadPdfJs();
    }
}

// Cleanup function to free memory
export function cleanupPdfJs(): void {
    if (pdfjsLib) {
        // Clear any cached data
        pdfjsLib = null;
        loadPromise = null;
        isLoading = false;
    }
}
