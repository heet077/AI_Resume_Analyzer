interface Resume {
    id: string;
    companyName?: string;
    jobTitle?: string;
    imagePath: string;
    resumePath: string;
    feedback: Feedback;
    createdAt?: string;
    updatedAt?: string;
    status?: 'draft' | 'analyzed' | 'archived';
    tags?: string[];
    notes?: string;
}

interface Feedback {
    overallScore: number;
    ATS: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
        }[];
    };
    toneAndStyle: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
    content: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
    structure: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
    skills: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
    summary?: {
        strengths: string[];
        weaknesses: string[];
        recommendations: string[];
    };
    keywords?: {
        found: string[];
        missing: string[];
        suggested: string[];
    };
}

interface PuterUser {
    id: string;
    username: string;
    email?: string;
    avatar?: string;
    plan?: string;
    storageUsed?: number;
    storageLimit?: number;
}

interface FSItem {
    id: string;
    name: string;
    path: string;
    type: 'file' | 'directory';
    size?: number;
    created?: string;
    modified?: string;
    mime?: string;
}

interface KVItem {
    key: string;
    value: string;
    created?: string;
    modified?: string;
}

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string | Array<{
        type: 'text' | 'file';
        text?: string;
        puter_path?: string;
    }>;
}

interface PuterChatOptions {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
}

interface AIResponse {
    message: {
        content: string | Array<{
            type: 'text' | 'file';
            text?: string;
            puter_path?: string;
        }>;
        role: string;
    };
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    model?: string;
}

// Form validation types
interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

// Error handling types
interface AppError {
    code: string;
    message: string;
    details?: string;
    retry?: boolean;
    timestamp?: string;
}

// Progress tracking types
interface ProgressStep {
    id: string;
    label: string;
    status: 'pending' | 'active' | 'completed' | 'error';
    progress?: number;
}

// File upload types
interface FileUploadResult {
    success: boolean;
    file?: File;
    error?: string;
    progress?: number;
}

// Resume analysis types
interface AnalysisOptions {
    jobTitle: string;
    jobDescription: string;
    focusAreas?: string[];
    customInstructions?: string;
}

interface AnalysisResult {
    success: boolean;
    feedback?: Feedback;
    error?: string;
    processingTime?: number;
}

// User preferences types
interface UserPreferences {
    theme?: 'light' | 'dark' | 'auto';
    language?: string;
    notifications?: boolean;
    autoSave?: boolean;
    defaultScale?: number;
    defaultQuality?: number;
}

// Export types
interface ExportOptions {
    format: 'pdf' | 'json' | 'csv';
    includeFeedback?: boolean;
    includeMetadata?: boolean;
    customFields?: string[];
}

// Search and filter types
interface SearchFilters {
    query?: string;
    company?: string;
    jobTitle?: string;
    scoreRange?: {
        min: number;
        max: number;
    };
    dateRange?: {
        start: Date;
        end: Date;
    };
    tags?: string[];
    status?: string[];
}

interface SearchResult {
    resumes: Resume[];
    total: number;
    page: number;
    pageSize: number;
    filters: SearchFilters;
}

// API response types
interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp: string;
}

// Pagination types
interface PaginationOptions {
    page: number;
    pageSize: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
