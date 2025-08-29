import {type FormEvent, useState} from 'react'
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import ProgressIndicator from "~/components/ProgressIndicator";
import {usePuterStore} from "~/lib/puter";
import {useNavigate} from "react-router";
import {convertPdfToImage} from "~/lib/pdf2img";
import {generateUUID} from "~/lib/utils";
import {prepareInstructions} from "../../constants";
import { InputValidator } from "~/lib/validation";
import { ErrorHandler, CommonErrors } from "~/lib/errorHandler";

interface FormData {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
}

interface FormErrors {
    companyName?: string;
    jobTitle?: string;
    jobDescription?: string;
    general?: string;
}

const Upload = () => {
    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentStep, setCurrentStep] = useState<string>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [uploadError, setUploadError] = useState<string>('');

    const progressSteps = [
        { id: 'upload', label: 'Uploading file' },
        { id: 'convert', label: 'Converting PDF to image' },
        { id: 'analyze', label: 'AI analysis in progress' },
        { id: 'complete', label: 'Analysis complete' }
    ];

    const handleFileSelect = (file: File | null) => {
        setFile(file);
        setUploadError('');
        setFormErrors(prev => ({ ...prev, general: undefined }));
    }

    const handleFileError = (error: string) => {
        setUploadError(error);
        setFormErrors(prev => ({ ...prev, general: error }));
    }

    const validateForm = (): boolean => {
        if (!file) {
            setFormErrors({ general: 'Please select a file to upload' });
            return false;
        }

        const formData = {
            companyName: (document.getElementById('company-name') as HTMLInputElement)?.value || '',
            jobTitle: (document.getElementById('job-title') as HTMLInputElement)?.value || '',
            jobDescription: (document.getElementById('job-description') as HTMLTextAreaElement)?.value || '',
            file
        };

        const validation = InputValidator.validateFormData(formData);
        
        if (!validation.isValid) {
            const errors: FormErrors = {};
            validation.errors.forEach(error => {
                if (error.includes('Company name')) errors.companyName = error;
                else if (error.includes('Job title')) errors.jobTitle = error;
                else if (error.includes('Job description')) errors.jobDescription = error;
                else errors.general = error;
            });
            setFormErrors(errors);
            return false;
        }

        setFormErrors({});
        return true;
    }

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file: File  }) => {
        setIsProcessing(true);
        setCurrentStep('upload');

        try {
            // Step 1: Upload file
            setCurrentStep('upload');
            const uploadedFile = await fs.upload([file]);
            if(!uploadedFile) {
                throw new Error('Failed to upload file');
            }

            // Step 2: Convert PDF to image
            setCurrentStep('convert');
            const imageFile = await convertPdfToImage(file);
            if(!imageFile.file) {
                throw new Error('Failed to convert PDF to image');
            }

            // Step 3: Upload image
            const uploadedImage = await fs.upload([imageFile.file]);
            if(!uploadedImage) {
                throw new Error('Failed to upload image');
            }

            // Step 4: Prepare data
            const uuid = generateUUID();
            const data = {
                id: uuid,
                resumePath: uploadedFile.path,
                imagePath: uploadedImage.path,
                companyName, 
                jobTitle, 
                jobDescription,
                feedback: '',
                createdAt: new Date().toISOString(),
            }
            await kv.set(`resume:${uuid}`, JSON.stringify(data));

            // Step 5: AI Analysis
            setCurrentStep('analyze');
            const feedback = await ai.feedback(
                uploadedFile.path,
                prepareInstructions({ jobTitle, jobDescription })
            )
            if (!feedback) {
                throw new Error('Failed to analyze resume');
            }

            const feedbackText = typeof feedback.message.content === 'string'
                ? feedback.message.content
                : feedback.message.content[0].text;

            data.feedback = JSON.parse(feedbackText);
            await kv.set(`resume:${uuid}`, JSON.stringify(data));
            
            setCurrentStep('complete');
            setTimeout(() => {
                navigate(`/resume/${uuid}`);
            }, 1000);

        } catch (error) {
            const errorMessage = ErrorHandler.getErrorMessage(error);
            setUploadError(errorMessage);
            setFormErrors({ general: errorMessage });
            setIsProcessing(false);
        }
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        const formData = new FormData(e.currentTarget);
        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        handleAnalyze({ companyName, jobTitle, jobDescription, file: file! });
    }

    const handleRetry = () => {
        setUploadError('');
        setFormErrors({});
        setIsProcessing(false);
        setCurrentStep('upload');
    }

    const getInputErrorClass = (fieldName: keyof FormErrors) => {
        return formErrors[fieldName] ? 'border-red-300 bg-red-50' : '';
    }

    if (!auth.isAuthenticated) {
        return null; // Will redirect via useEffect in parent
    }

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Smart feedback for your dream job</h1>
                    
                    {isProcessing ? (
                        <div className="space-y-6">
                            <h2>Processing your resume...</h2>
                            <ProgressIndicator 
                                steps={progressSteps}
                                currentStep={currentStep}
                                error={uploadError}
                                onRetry={handleRetry}
                            />
                        </div>
                    ) : (
                        <>
                            <h2>Drop your resume for an ATS score and improvement tips</h2>
                            
                            {formErrors.general && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg max-w-2xl">
                                    <div className="flex items-center space-x-2">
                                        <img src="/icons/warning.svg" alt="error" className="w-5 h-5 text-red-500" />
                                        <p className="text-red-700">{formErrors.general}</p>
                                    </div>
                                </div>
                            )}

                            <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-6 mt-8 max-w-2xl w-full">
                                <div className="form-div">
                                    <label htmlFor="company-name">Company Name *</label>
                                    <input 
                                        type="text" 
                                        name="company-name" 
                                        placeholder="e.g., Google, Microsoft" 
                                        id="company-name"
                                        className={getInputErrorClass('companyName')}
                                    />
                                    {formErrors.companyName && (
                                        <p className="text-red-600 text-sm mt-1">{formErrors.companyName}</p>
                                    )}
                                </div>
                                
                                <div className="form-div">
                                    <label htmlFor="job-title">Job Title *</label>
                                    <input 
                                        type="text" 
                                        name="job-title" 
                                        placeholder="e.g., Frontend Developer, Software Engineer" 
                                        id="job-title"
                                        className={getInputErrorClass('jobTitle')}
                                    />
                                    {formErrors.jobTitle && (
                                        <p className="text-red-600 text-sm mt-1">{formErrors.jobTitle}</p>
                                    )}
                                </div>
                                
                                <div className="form-div">
                                    <label htmlFor="job-description">Job Description *</label>
                                    <textarea 
                                        rows={5} 
                                        name="job-description" 
                                        placeholder="Paste the job description here..." 
                                        id="job-description"
                                        className={getInputErrorClass('jobDescription')}
                                    />
                                    {formErrors.jobDescription && (
                                        <p className="text-red-600 text-sm mt-1">{formErrors.jobDescription}</p>
                                    )}
                                </div>

                                <div className="form-div">
                                    <label htmlFor="uploader">Upload Resume *</label>
                                    <FileUploader 
                                        onFileSelect={handleFileSelect} 
                                        onError={handleFileError}
                                    />
                                </div>

                                <button 
                                    className="primary-button disabled:opacity-50 disabled:cursor-not-allowed" 
                                    type="submit"
                                    disabled={!file || isProcessing}
                                >
                                    {isProcessing ? 'Processing...' : 'Analyze Resume'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </section>
        </main>
    )
}

export default Upload
