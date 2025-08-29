export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class InputValidator {
  static validateCompanyName(name: string): ValidationResult {
    const errors: string[] = [];
    
    if (!name.trim()) {
      errors.push('Company name is required');
    } else if (name.length < 2) {
      errors.push('Company name must be at least 2 characters');
    } else if (name.length > 100) {
      errors.push('Company name must be less than 100 characters');
    } else if (!/^[a-zA-Z0-9\s\-&.,()]+$/.test(name)) {
      errors.push('Company name contains invalid characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateJobTitle(title: string): ValidationResult {
    const errors: string[] = [];
    
    if (!title.trim()) {
      errors.push('Job title is required');
    } else if (title.length < 3) {
      errors.push('Job title must be at least 3 characters');
    } else if (title.length > 100) {
      errors.push('Job title must be less than 100 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateJobDescription(description: string): ValidationResult {
    const errors: string[] = [];
    
    if (!description.trim()) {
      errors.push('Job description is required');
    } else if (description.length < 50) {
      errors.push('Job description must be at least 50 characters');
    } else if (description.length > 5000) {
      errors.push('Job description must be less than 5000 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateFile(file: File): ValidationResult {
    const errors: string[] = [];
    const maxSize = 20 * 1024 * 1024; // 20MB
    
    if (!file) {
      errors.push('File is required');
      return { isValid: false, errors };
    }

    // Check file type
    if (file.type !== 'application/pdf') {
      errors.push('Only PDF files are allowed');
    }

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size must be less than ${(maxSize / 1024 / 1024).toFixed(0)}MB`);
    }

    // Check file name
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      errors.push('File must have a .pdf extension');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateFormData(data: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File | null;
  }): ValidationResult {
    const allErrors: string[] = [];
    
    const companyValidation = this.validateCompanyName(data.companyName);
    const titleValidation = this.validateJobTitle(data.jobTitle);
    const descriptionValidation = this.validateJobDescription(data.jobDescription);
    const fileValidation = this.validateFile(data.file!);

    allErrors.push(...companyValidation.errors);
    allErrors.push(...titleValidation.errors);
    allErrors.push(...descriptionValidation.errors);
    allErrors.push(...fileValidation.errors);

    return {
      isValid: allErrors.length === 0,
      errors: allErrors
    };
  }
}
