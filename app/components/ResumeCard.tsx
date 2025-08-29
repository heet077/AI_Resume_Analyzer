import {Link} from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import {useEffect, useState} from "react";
import {usePuterStore} from "~/lib/puter";

interface ResumeCardProps {
    resume: Resume;
}

const ResumeCard: React.FC<ResumeCardProps> = ({ resume: { id, companyName, jobTitle, feedback, imagePath } }) => {
    const { fs } = usePuterStore();
    const [resumeUrl, setResumeUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [hasError, setHasError] = useState<boolean>(false);

    useEffect(() => {
        const loadResume = async () => {
            try {
                setIsLoading(true);
                setHasError(false);
                
                const blob = await fs.read(imagePath);
                if (!blob) {
                    throw new Error('Failed to load resume image');
                }
                
                const url = URL.createObjectURL(blob);
                setResumeUrl(url);
            } catch (error) {
                console.error('Error loading resume image:', error);
                setHasError(true);
            } finally {
                setIsLoading(false);
            }
        };

        loadResume();

        // Cleanup function to revoke object URL
        return () => {
            if (resumeUrl) {
                URL.revokeObjectURL(resumeUrl);
            }
        };
    }, [imagePath, fs]);

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return '';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Needs Work';
    };

    return (
        <Link to={`/resume/${id}`} className="resume-card animate-in fade-in duration-1000 hover:shadow-lg transition-shadow">
            <div className="resume-card-header">
                <div className="flex flex-col gap-2 flex-1">
                    {companyName && (
                        <h2 className="!text-black font-bold break-words text-lg">
                            {companyName}
                        </h2>
                    )}
                    {jobTitle && (
                        <h3 className="text-lg break-words text-gray-600 font-medium">
                            {jobTitle}
                        </h3>
                    )}
                    {!companyName && !jobTitle && (
                        <h2 className="!text-black font-bold">Resume</h2>
                    )}
                    
                    {/* Score breakdown */}
                    <div className="flex flex-wrap gap-2 mt-2">
                        <div className={`text-xs px-2 py-1 rounded-full ${getScoreColor(feedback.ATS.score)} bg-opacity-10`}>
                            ATS: {feedback.ATS.score}/100
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${getScoreColor(feedback.skills.score)} bg-opacity-10`}>
                            Skills: {feedback.skills.score}/100
                        </div>
                    </div>
                </div>
                
                <div className="flex-shrink-0">
                    <ScoreCircle score={feedback.overallScore} />
                    <div className="text-center mt-2">
                        <p className={`text-sm font-medium ${getScoreColor(feedback.overallScore)}`}>
                            {getScoreLabel(feedback.overallScore)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Resume Image */}
            <div className="gradient-border animate-in fade-in duration-1000 flex-1">
                {isLoading ? (
                    <div className="w-full h-[350px] max-sm:h-[200px] flex items-center justify-center bg-gray-100 rounded-lg">
                        <div className="flex flex-col items-center space-y-2">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-500 text-sm">Loading...</p>
                        </div>
                    </div>
                ) : hasError ? (
                    <div className="w-full h-[350px] max-sm:h-[200px] flex items-center justify-center bg-gray-100 rounded-lg">
                        <div className="flex flex-col items-center space-y-2 text-center">
                            <img src="/icons/warning.svg" alt="error" className="w-8 h-8 text-gray-400" />
                            <p className="text-gray-500 text-sm">Failed to load image</p>
                            <p className="text-gray-400 text-xs">Click to view details</p>
                        </div>
                    </div>
                ) : resumeUrl ? (
                    <div className="w-full h-full">
                        <img
                            src={resumeUrl}
                            alt="resume preview"
                            className="w-full h-[350px] max-sm:h-[200px] object-cover object-top rounded-lg"
                            loading="lazy"
                        />
                    </div>
                ) : null}
            </div>

            {/* Footer with additional info */}
            <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                <span>Click to view full analysis</span>
                {formatDate() && <span>{formatDate()}</span>}
            </div>
        </Link>
    );
};

export default ResumeCard;
