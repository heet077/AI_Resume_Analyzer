export interface AppError {
  code: string;
  message: string;
  details?: string;
  retry?: boolean;
}

export class ErrorHandler {
  static createError(code: string, message: string, details?: string, retry = false): AppError {
    return { code, message, details, retry };
  }

  static getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'An unexpected error occurred';
  }

  static isRetryableError(error: AppError): boolean {
    return error.retry ?? false;
  }

  static getFriendlyMessage(error: AppError): string {
    const errorMessages: Record<string, string> = {
      'UPLOAD_FAILED': 'Failed to upload file. Please try again.',
      'CONVERSION_FAILED': 'Failed to convert PDF. Please check your file.',
      'ANALYSIS_FAILED': 'AI analysis failed. Please try again.',
      'AUTH_FAILED': 'Authentication failed. Please sign in again.',
      'NETWORK_ERROR': 'Network error. Please check your connection.',
      'FILE_TOO_LARGE': 'File is too large. Maximum size is 20MB.',
      'INVALID_FILE_TYPE': 'Invalid file type. Please upload a PDF.',
      'PUTER_UNAVAILABLE': 'Service temporarily unavailable. Please try again.',
      'QUOTA_EXCEEDED': 'Storage quota exceeded. Please upgrade your plan.',
    };

    return errorMessages[error.code] || error.message;
  }
}

export const CommonErrors = {
  UPLOAD_FAILED: ErrorHandler.createError('UPLOAD_FAILED', 'File upload failed', undefined, true),
  CONVERSION_FAILED: ErrorHandler.createError('CONVERSION_FAILED', 'PDF conversion failed', undefined, true),
  ANALYSIS_FAILED: ErrorHandler.createError('ANALYSIS_FAILED', 'AI analysis failed', undefined, true),
  AUTH_FAILED: ErrorHandler.createError('AUTH_FAILED', 'Authentication failed', undefined, false),
  NETWORK_ERROR: ErrorHandler.createError('NETWORK_ERROR', 'Network error', undefined, true),
  FILE_TOO_LARGE: ErrorHandler.createError('FILE_TOO_LARGE', 'File too large', undefined, false),
  INVALID_FILE_TYPE: ErrorHandler.createError('INVALID_FILE_TYPE', 'Invalid file type', undefined, false),
  PUTER_UNAVAILABLE: ErrorHandler.createError('PUTER_UNAVAILABLE', 'Service unavailable', undefined, true),
  QUOTA_EXCEEDED: ErrorHandler.createError('QUOTA_EXCEEDED', 'Storage quota exceeded', undefined, false),
};
