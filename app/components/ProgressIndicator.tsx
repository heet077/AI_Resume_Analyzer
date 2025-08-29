import React from 'react';

interface ProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  currentStep: string;
  error?: string;
  onRetry?: () => void;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ 
  steps, 
  currentStep, 
  error, 
  onRetry 
}) => {
  const getStepIcon = (status: ProgressStep['status']) => {
    switch (status) {
      case 'completed':
        return (
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <img src="/icons/check.svg" alt="completed" className="w-4 h-4" />
          </div>
        );
      case 'error':
        return (
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <img src="/icons/cross.svg" alt="error" className="w-4 h-4" />
          </div>
        );
      case 'active':
        return (
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full" />
          </div>
        );
    }
  };

  const getStepStatus = (step: ProgressStep) => {
    if (step.id === currentStep) return 'active';
    if (steps.findIndex(s => s.id === step.id) < steps.findIndex(s => s.id === currentStep)) {
      return 'completed';
    }
    return 'pending';
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="space-y-4">
        {steps.map((step, index) => {
          const status = getStepStatus(step);
          const isLast = index === steps.length - 1;
          
          return (
            <div key={step.id} className="flex items-start space-x-4">
              <div className="flex flex-col items-center">
                {getStepIcon(status)}
                {!isLast && (
                  <div className={`w-0.5 h-8 mt-2 ${
                    status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
              
              <div className="flex-1 pt-1">
                <h3 className={`font-medium ${
                  status === 'active' ? 'text-blue-600' :
                  status === 'completed' ? 'text-green-600' :
                  status === 'error' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {step.label}
                </h3>
                
                {status === 'active' && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <img src="/icons/warning.svg" alt="error" className="w-5 h-5 text-red-500" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Operation failed</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressIndicator;
