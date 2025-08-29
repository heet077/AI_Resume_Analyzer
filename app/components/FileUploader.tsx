import {useState, useCallback} from 'react'
import {useDropzone} from 'react-dropzone'
import { formatSize } from '../lib/utils'
import { InputValidator } from '../lib/validation'
import { CommonErrors } from '../lib/errorHandler'

interface FileUploaderProps {
    onFileSelect?: (file: File | null) => void;
    onError?: (error: string) => void;
    maxSize?: number;
}

const FileUploader = ({ 
    onFileSelect, 
    onError, 
    maxSize = 20 * 1024 * 1024 
}: FileUploaderProps) => {
    const [validationError, setValidationError] = useState<string>('');

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0] || null;
        
        if (file) {
            const validation = InputValidator.validateFile(file);
            if (!validation.isValid) {
                setValidationError(validation.errors[0]);
                onError?.(validation.errors[0]);
                return;
            }
            setValidationError('');
        }
        
        onFileSelect?.(file);
    }, [onFileSelect, onError]);

    const onDropRejected = useCallback((rejectedFiles: any[]) => {
        const rejection = rejectedFiles[0];
        let errorMessage = 'File upload failed';
        
        if (rejection.errors) {
            if (rejection.errors.some((e: any) => e.code === 'file-too-large')) {
                errorMessage = `File is too large. Maximum size is ${formatSize(maxSize)}`;
            } else if (rejection.errors.some((e: any) => e.code === 'file-invalid-type')) {
                errorMessage = 'Only PDF files are allowed';
            } else if (rejection.errors.some((e: any) => e.code === 'too-many-files')) {
                errorMessage = 'Only one file can be uploaded at a time';
            }
        }
        
        setValidationError(errorMessage);
        onError?.(errorMessage);
    }, [maxSize, onError]);

    const {getRootProps, getInputProps, isDragActive, acceptedFiles, isDragReject} = useDropzone({
        onDrop,
        onDropRejected,
        multiple: false,
        accept: { 'application/pdf': ['.pdf']},
        maxSize: maxSize,
    })

    const file = acceptedFiles[0] || null;

    const handleRemoveFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setValidationError('');
        onFileSelect?.(null);
    };

    const getDropzoneClasses = () => {
        let baseClasses = "w-full gradient-border transition-all duration-200 cursor-pointer";
        
        if (isDragReject) {
            baseClasses += " border-red-300 bg-red-50";
        } else if (isDragActive) {
            baseClasses += " border-blue-300 bg-blue-50 scale-105";
        } else if (validationError) {
            baseClasses += " border-red-300 bg-red-50";
        }
        
        return baseClasses;
    };

    return (
        <div className="space-y-3">
            <div {...getRootProps()} className={getDropzoneClasses()}>
                <input {...getInputProps()} />

                <div className="space-y-4 p-6">
                    {file ? (
                        <div className="uploader-selected-file" onClick={(e) => e.stopPropagation()}>
                            <img src="/images/pdf.png" alt="pdf" className="size-10" />
                            <div className="flex items-center space-x-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-700 truncate max-w-xs">
                                        {file.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {formatSize(file.size)}
                                    </p>
                                </div>
                            </div>
                            <button 
                                className="p-2 cursor-pointer hover:bg-gray-100 rounded-full transition-colors" 
                                onClick={handleRemoveFile}
                                aria-label="Remove file"
                            >
                                <img src="/icons/cross.svg" alt="remove" className="w-4 h-4" />
                            </button>
                        </div>
                    ): (
                        <div className="text-center">
                            <div className="mx-auto w-16 h-16 flex items-center justify-center mb-2">
                                <img 
                                    src={isDragReject ? "/icons/warning.svg" : "/icons/info.svg"} 
                                    alt="upload" 
                                    className={`size-20 ${isDragReject ? 'text-red-500' : 'text-gray-400'}`} 
                                />
                            </div>
                            <p className="text-lg text-gray-500">
                                <span className="font-semibold">
                                    {isDragActive ? 'Drop your PDF here' : 'Click to upload'}
                                </span>
                                {!isDragActive && ' or drag and drop'}
                            </p>
                            <p className="text-lg text-gray-500">
                                PDF (max {formatSize(maxSize)})
                            </p>
                            {isDragReject && (
                                <p className="text-red-500 text-sm mt-2">
                                    Only PDF files are allowed
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {validationError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <img src="/icons/warning.svg" alt="error" className="w-4 h-4 text-red-500" />
                        <p className="text-red-700 text-sm">{validationError}</p>
                    </div>
                </div>
            )}

            <div className="text-xs text-gray-500 text-center">
                Supported format: PDF • Max size: {formatSize(maxSize)}
            </div>
        </div>
    )
}

export default FileUploader
