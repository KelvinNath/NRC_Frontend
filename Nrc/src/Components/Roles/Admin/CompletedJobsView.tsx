import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import JobSearchBar from './JobDetailsComponents/JobSearchBar';
import JobBarsChart from './JobDetailsComponents/JobBarsChart';
import DetailedJobModal from './JobDetailsComponents/DetailedJobModal';

interface CompletedJob {
  id: number;
  nrcJobNo: string;
  jobPlanId: number;
  jobDemand: string;
  jobDetails: {
    id: number;
    srNo: number;
    noUps: string;
    width: number;
    height: string;
    length: number;
    status: string;
    preRate: number;
    styleId: string;
    clientId: string;
    boardSize: string;
    jobDemand: string;
    customerName: string;
    boxDimensions: string;
    processColors: string;
    artworkApprovedDate: string;
    artworkReceivedDate: string;
    shadeCardApprovalDate: string;
  };
  purchaseOrderDetails: {
    id: number;
    unit: string;
    poDate: string;
    status: string;
    customer: string;
    poNumber: string;
    noOfSheets: number;
    totalPOQuantity: number;
    deliveryDate: string;
  };
  allSteps: Array<{
    id: number;
    stepName: string;
    status: string;
    startDate: string;
    endDate: string;
    machineDetails: Array<{
      unit: string;
      machineId: string;
      machineCode: string;
      machineType: string;
    }>;
  }>;
  completedAt: string;
  completedBy: string;
  finalStatus: string;
  createdAt: string;
  // Keep the optional properties for backward compatibility
  status?: string;
  company?: string;
  customerName?: string;
  totalDuration?: number;
  steps?: any[];
}

interface JobPlan {
  id: number;
  nrcJobNo: string;
  company: string;
  boardSize: string;
  gsm: string;
  artwork: string;
  approvalDate: string;
  dispatchDate: string;
  status: string;
  steps: JobPlanStep[];
  createdAt: string;
}

interface JobPlanStep {
  id: number;
  stepName: string;
  status: string;
  stepDetails?: any;
}

const CompletedJobsView: React.FC = () => {
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  // Update this line to accept both types
  const [selectedJob, setSelectedJob] = useState<CompletedJob | JobPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedJobs, setCompletedJobs] = useState<CompletedJob[]>([]);

  const fetchCompletedJobs = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('http://nrc-backend-alb-174636098.ap-south-1.elb.amazonaws.com/api/completed-jobs', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Completed jobs data:', result);
      
      // Extract the data array from the response
      if (result.success && Array.isArray(result.data)) {
        setCompletedJobs(result.data);
      } else {
        setCompletedJobs([]);
      }
    } catch (error) {
      console.error('Error fetching completed jobs:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch completed jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedJobs();
  }, []);

  const handleJobClick = (job: CompletedJob | JobPlan) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading completed jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error</p>
            <p>{error}</p>
            <button 
              onClick={fetchCompletedJobs}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header with Back Button */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={handleBackToDashboard}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors hover:cursor-pointer"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Search Bar - Only for completed jobs */}
        <div className="mb-8">
          <JobSearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Search by NRC Job Number..."
          />
        </div>

        {/* Job Bars for Completed Jobs */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Completed Jobs</h3>
              <p className="text-3xl font-bold text-green-600">{completedJobs.length}</p>
            </div>
          </div>

          <JobBarsChart
            jobs={completedJobs}
            category="completed"
            onJobClick={handleJobClick}
            searchTerm={searchTerm}
          />
        </div>

        {/* Detailed Job Modal */}
        <DetailedJobModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          job={selectedJob}
        />
      </div>
    </div>
  );
};

export default CompletedJobsView; 