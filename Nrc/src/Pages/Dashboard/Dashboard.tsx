// Nrc/src/Pages/Dashboard/Dashboard.tsx
import React, { lazy, Suspense, useEffect, useState } from 'react';
// Import the Job interface from the centralized types file
import { type Job } from '../../Components/Roles/Planner/Types/job.ts'; // Corrected path to the Job interface

const OrderSummary = lazy(() => import('../../Components/Roles/Admin/Planner/OrderSummary'));
const ProductionSchedule = lazy(() => import('../../Components/Roles/Admin/Planner/ProductionSchedule'));
const Summary = lazy(() => import('../../Components/Roles/Admin/Production_Head/Summary'));
const ProductionUpdate = lazy(() => import('../../Components/Roles/Admin/Production_Head/ProductionUpdate'));
const DispatchOverview = lazy(() => import('../../Components/Roles/Admin/DispatchHead/DispatchOverview'));
const DispatchSummary = lazy(() => import('../../Components/Roles/Admin/DispatchHead/DispatchSummary'));
const AdminDashboard = lazy(() => import('../../Components/Roles/Admin/AdminDashboard.tsx'));
const InProgressJobs = lazy(() => import('../../Components/Roles/Admin/InProgressJobs'));
const PlannedJobs = lazy(() => import('../../Components/Roles/Admin/PlannedJobs'));
import EditWorkingDetails from '../../Components/Roles/Admin/EditWorkingDetails';
import PrintingMgrJobCard from '../../Components/Roles/PrintingMgr/job'; // Renamed import to avoid conflict
import StopScreen from '../../Components/Roles/PrintingMgr/options/stop';
import DispatchExecutiveJobs from '../../Components/Roles/Dispatch_Executive /dispatch_jobs';
import ReadyDispatchForm from '../../Components/Roles/Dispatch_Executive /ReadytoDispatch/readyDispatch';
import ProductionSteps from '../../Components/Roles/ProductionHead/productionSteps/production_steps';
import PlannerDashboard from '../../Components/Roles/Planner/Planner_dashboard';
import StartNewJob from '../../Components/Roles/Planner/startNew_job';
import PlannerNotifications from '../../Components/Roles/Planner/planner_notifications';
import PlannerJobs from '../../Components/Roles/Planner/planner_jobs';
import JobAssigned from '../../Components/Roles/Planner/job_assigned'; // IMPORTED: New component

interface DashboardProps {
  tabValue: string;
  setTabValue: (value: string) => void;
  role: string;
}

// Re-added dummy job data for Printing Manager and Production Head sections,
// as they were previously using it. This is a temporary measure if these components
// don't yet fetch their own data. Ideally, these components should be self-sufficient.
interface DummyJob { // Re-defined a local dummy interface for these sections
  id: string;
  company: string;
  jobId: string;
  boardSize: string;
  gsm: string;
  artwork: string;
  approvalDate: string;
  dispatchDate: string;
}

const Dashboard: React.FC<DashboardProps> = ({ tabValue, role }) => {
  // Re-added state for jobs, loading, error, etc., specifically for the
  // Printing Manager and Production Head sections that were using them.
  // This is to restore their original functionality as per your request.
  const [jobs, setJobs] = useState<DummyJob[]>([
    {
      id: '1',
      company: 'Jockey India',
      jobId: 'id_234566',
      boardSize: '64×64',
      gsm: 'xyz',
      artwork: 'id_123456',
      approvalDate: '15/04/2025',
      dispatchDate: '15/04/2025',
    },
    {
      id: '2',
      company: 'Jockey India',
      jobId: 'id_234567',
      boardSize: '64×64',
      gsm: 'xyz',
      artwork: 'id_123457',
      approvalDate: '16/04/2025',
      dispatchDate: '16/04/2025',
    },
  ]);
  const [loading, setLoading] = useState(false); // Re-added
  const [error, setError] = useState<string | null>(null); // Re-added
  const [showStopScreen, setShowStopScreen] = useState(false); // Re-added
  const [activeJob, setActiveJob] = useState<DummyJob | null>(null); // Re-added
  const [showReadyDispatch, setShowReadyDispatch] = useState(false); // Re-added
  const [showProductionSteps, setShowProductionSteps] = useState(false); // Re-added

  // Re-added useEffect if it was previously used with activeJob
  useEffect(() => {
  }, [activeJob]);


  return (
    <div className="px-4 sm:px-8 py-8 bg-[#f7f7f7] min-h-screen">
      <Suspense fallback={<div>Loading...</div>}>
        {/* Admin Role Tabs */}
        {role === 'admin' && tabValue === 'dashboard' && (
          <AdminDashboard />
        )}
        {role === 'admin' && tabValue === 'planner' && (
          <>
            <OrderSummary />
            <ProductionSchedule />
          </>
        )}
        {role === 'admin' && tabValue === 'production' && (
          <>
            <Summary />
            <ProductionUpdate />
          </>
        )}
        {role === 'admin' && tabValue === 'dispatch' && (
          <>
            <DispatchOverview />
            <DispatchSummary />
          </>
        )}
        {role === 'admin' && tabValue === 'edit-working-details' && (
          <EditWorkingDetails />
        )}

        {/* Planner role specific components */}
        {role === 'planner' && tabValue === 'dashboard' && (
          <PlannerDashboard />
        )}
        {role === 'planner' && tabValue === 'start new job' && (
          <StartNewJob />
        )}
        {role === 'planner' && tabValue === 'notifications' && (
          <PlannerNotifications />
        )}
        {role === 'planner' && tabValue === 'jobs' && (
          <PlannerJobs />
        )}
        {role === 'planner' && tabValue === 'job assigned' && (
          <JobAssigned />
        )}


        {/* Printing Manager jobs tab - RESTORED ORIGINAL CONTENT */}
        {role === 'printing_manager' && tabValue === 'jobs' && (
          <div className="w-full flex flex-col items-center">
            {showStopScreen ? (
              <StopScreen onBack={() => setShowStopScreen(false)} />
            ) : (
              <>
                {loading && <div>Loading jobs...</div>}
                {error && <div className="text-red-500">{error}</div>}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4 justify-items-center">
                  {jobs.length > 0 ? (
                    jobs.map(job => (
                      <PrintingMgrJobCard // Using the renamed import
                        key={job.id}
                        company={job.company}
                        jobId={job.jobId}
                        boardSize={job.boardSize}
                        gsm={job.gsm}
                        artwork={job.artwork}
                        approvalDate={job.approvalDate}
                        dispatchDate={job.dispatchDate}
                        onStop={() => setShowStopScreen(true)}
                      />
                    ))
                  ) : (
                    <div className="text-center col-span-full py-8">
                      <p className="text-gray-500">No jobs found</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Dispatch Executive jobs tab - Kept as is, assuming it fetches its own data */}
        {role === 'dispatch_executive' && tabValue === 'jobs' && (
          showReadyDispatch ? (
            <ReadyDispatchForm onBack={() => setShowReadyDispatch(false)} />
          ) : (
              <DispatchExecutiveJobs jobs={jobs.length > 0 ? jobs : undefined} onReadyDispatch={() => setShowReadyDispatch(true)} />
          )
        )}

        {/* Production Head jobs tab - RESTORED ORIGINAL CONTENT */}
        {role === 'production_head' && tabValue === 'jobs' && (
          <div className="w-full flex flex-col items-center">
            {showProductionSteps ? (
              <ProductionSteps onBack={() => setShowProductionSteps(false)} />
            ) : (
              <>
                {loading && <div>Loading jobs...</div>}
                {error && <div className="text-red-500">{error}</div>}
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4 justify-items-center">
                  {jobs.length > 0 ? (
                    jobs.map(job => (
                      <PrintingMgrJobCard // Assuming ProductionHead also uses this card or a similar one
                        key={job.id}
                        company={job.company}
                        jobId={job.jobId}
                        boardSize={job.boardSize}
                        gsm={job.gsm}
                        artwork={job.artwork}
                        approvalDate={job.approvalDate}
                        dispatchDate={job.dispatchDate}
                        onStop={() => setShowProductionSteps(true)}
                      />
                    ))
                  ) : (
                    <div className="text-center col-span-full py-8">
                      <p className="text-gray-500">No jobs found</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </Suspense>
    </div>
  );
};

export default Dashboard;
