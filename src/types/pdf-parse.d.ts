declare module 'pdf-parse' {
  interface PDFInfo {
    [key: string]: any;
  }
  interface PDFData {
    numpages: number;
    numrender: number;
    info: PDFInfo;
    metadata: any;
    text: string;
    version: string;
  }
  function pdf(dataBuffer: Buffer | Uint8Array, options?: any): Promise<PDFData>;
  export = pdf;
}
