import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import {usePuterStore} from "~/lib/puter";
import {Link, useNavigate} from "react-router";
import {useEffect, useState, useMemo} from "react";
import { ErrorHandler } from "~/lib/errorHandler";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterScore, setFilterScore] = useState<number | ''>('');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'company'>('date');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if(!auth.isAuthenticated) navigate('/auth?next=/');
  }, [auth.isAuthenticated, navigate]);

  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);
      setError('');

      try {
        const resumesData = (await kv.list('resume:*', true)) as KVItem[];
        
        if (!resumesData) {
          setResumes([]);
          return;
        }

        const parsedResumes = resumesData
          .map((resume) => {
            try {
              return JSON.parse(resume.value) as Resume;
            } catch (parseError) {
              console.error('Failed to parse resume:', parseError);
              return null;
            }
          })
          .filter((resume): resume is Resume => resume !== null)
          .sort((a, b) => {
            // Sort by creation date (newest first)
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
          });

        setResumes(parsedResumes);
      } catch (err) {
        const errorMessage = ErrorHandler.getErrorMessage(err);
        setError(`Failed to load resumes: ${errorMessage}`);
        console.error('Error loading resumes:', err);
      } finally {
        setLoadingResumes(false);
      }
    };

    if (auth.isAuthenticated) {
      loadResumes();
    }
  }, [auth.isAuthenticated, kv]);

  // Filter and search resumes
  const filteredResumes = useMemo(() => {
    let filtered = resumes;

    // Search by company name or job title
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(resume => 
        (resume.companyName?.toLowerCase().includes(term) || false) ||
        (resume.jobTitle?.toLowerCase().includes(term) || false)
      );
    }

    // Filter by company
    if (filterCompany) {
      filtered = filtered.filter(resume => 
        resume.companyName?.toLowerCase().includes(filterCompany.toLowerCase())
      );
    }

    // Filter by score
    if (filterScore !== '') {
      filtered = filtered.filter(resume => 
        resume.feedback.overallScore >= filterScore
      );
    }

    // Sort resumes
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.feedback.overallScore - a.feedback.overallScore;
        case 'company':
          return (a.companyName || '').localeCompare(b.companyName || '');
        case 'date':
        default:
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
      }
    });

    return filtered;
  }, [resumes, searchTerm, filterCompany, filterScore, sortBy]);

  // Get unique companies for filter dropdown
  const uniqueCompanies = useMemo(() => {
    const companies = resumes
      .map(resume => resume.companyName)
      .filter((company): company is string => !!company);
    return [...new Set(companies)].sort();
  }, [resumes]);

  const handleRetry = () => {
    setError('');
    // Reload resumes
    window.location.reload();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCompany('');
    setFilterScore('');
    setSortBy('date');
  };

  if (!auth.isAuthenticated) {
    return null;
  }

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />

      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Track Your Applications & Resume Ratings</h1>
          {!loadingResumes && resumes?.length === 0 ? (
            <h2>No resumes found. Upload your first resume to get feedback.</h2>
          ) : (
            <h2>Review your submissions and check AI-powered feedback.</h2>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="w-full max-w-4xl mx-auto mb-8">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src="/icons/warning.svg" alt="error" className="w-5 h-5 text-red-500" />
                  <p className="text-red-700">{error}</p>
                </div>
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        {resumes.length > 0 && (
          <div className="w-full max-w-4xl mx-auto mb-8 space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by company or job title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Company Filter */}
              <select
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Companies</option>
                {uniqueCompanies.map(company => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>

              {/* Score Filter */}
              <select
                value={filterScore}
                onChange={(e) => setFilterScore(e.target.value === '' ? '' : Number(e.target.value))}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Scores</option>
                <option value="80">80+ (Excellent)</option>
                <option value="60">60+ (Good)</option>
                <option value="40">40+ (Fair)</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'score' | 'company')}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Sort by Date</option>
                <option value="score">Sort by Score</option>
                <option value="company">Sort by Company</option>
              </select>
            </div>

            {/* Clear Filters */}
            {(searchTerm || filterCompany || filterScore !== '') && (
              <div className="flex justify-center">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Results Count */}
            <div className="text-center text-gray-600">
              Showing {filteredResumes.length} of {resumes.length} resumes
            </div>
          </div>
        )}

        {/* Loading State */}
        {loadingResumes && (
          <div className="flex flex-col items-center justify-center">
            <img src="/images/resume-scan-2.gif" className="w-[200px]" alt="Loading resumes" />
            <p className="text-gray-600 mt-4">Loading your resumes...</p>
          </div>
        )}

        {/* Resumes Grid */}
        {!loadingResumes && filteredResumes.length > 0 && (
          <div className="resumes-section">
            {filteredResumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loadingResumes && resumes.length > 0 && filteredResumes.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10 gap-4">
            <img src="/icons/info.svg" alt="No results" className="w-16 h-16 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-600">No resumes match your filters</h3>
            <p className="text-gray-500">Try adjusting your search criteria or clear the filters</p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loadingResumes && resumes?.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10 gap-4">
            <img src="/icons/info.svg" alt="No resumes" className="w-16 h-16 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-600">No resumes yet</h3>
            <p className="text-gray-500">Upload your first resume to get started with AI-powered feedback</p>
            <Link to="/upload" className="primary-button w-fit text-xl font-semibold">
              Upload Resume
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
