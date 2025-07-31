// src/Components/Roles/Planner/JobPlanningDetailModal.tsx
import React from 'react';
import {type  JobPlan, type JobPlanStep } from '../Types/job.ts'; // Adjust path as needed

interface JobPlanningDetailModalProps {
  jobPlan: JobPlan;
  onClose: () => void;
}

const JobPlanningDetailModal: React.FC<JobPlanningDetailModalProps> = ({ jobPlan, onClose }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const renderField = (label: string, value: string | number | null) => (
    <div className="flex flex-col mb-3">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <p className="text-gray-800 bg-gray-50 p-2 rounded-md border border-gray-200">
        {value !== null && value !== '' ? value : 'N/A'}
      </p>
    </div>
  );

  // Sort the steps by stepNo before rendering
  const sortedSteps = [...jobPlan.steps].sort((a, b) => a.stepNo - b.stepNo);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-transparent bg-opacity-30 backdrop-blur-sm min-h-screen">
      <div className="relative w-full max-w-2xl mx-2 sm:mx-auto bg-white rounded-2xl shadow-2xl p-0 flex flex-col items-center">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold hover:cursor-pointer"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="w-full px-8 pt-10 pb-8 flex flex-col items-center overflow-y-auto max-h-[85vh]">
          <h2 className="text-2xl font-bold mb-2 text-center text-gray-900">Job Plan Details: {jobPlan.nrcJobNo}</h2>
          <p className="text-gray-500 text-center mb-6">Complete information for Job Plan ID: {jobPlan.jobPlanId}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 w-full mb-6 border-b pb-4">
            {renderField('Job Plan ID', jobPlan.jobPlanId)}
            {renderField('NRC Job No', jobPlan.nrcJobNo)}
            {renderField('Job Demand', jobPlan.jobDemand)}
            {renderField('Created At', formatDate(jobPlan.createdAt))}
            {renderField('Updated At', formatDate(jobPlan.updatedAt))}
          </div>

          <h3 className="text-xl font-bold text-gray-800 mb-4 w-full">Job Steps</h3>
          {sortedSteps.length === 0 ? ( // Use sortedSteps here
            <p className="text-gray-500 w-full text-center">No steps planned for this job.</p>
          ) : (
            <div className="w-full space-y-4">
              {sortedSteps.map(step => ( // Use sortedSteps here
                <div key={step.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-semibold text-gray-800">Step {step.stepNo}: {step.stepName}</h4>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize
                      ${step.status === 'start' ? 'bg-green-100 text-green-800' :
                        step.status === 'stop' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'}`}>
                      {step.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700">
                    <p><strong>Machine Details:</strong> {step.machineDetails && step.machineDetails.length > 0 ? step.machineDetails.join(', ') : 'N/A'}</p>
                    <p><strong>User:</strong> {step.user || 'N/A'}</p>
                    <p><strong>Start Date:</strong> {formatDate(step.startDate)}</p>
                    <p><strong>End Date:</strong> {formatDate(step.endDate)}</p>
                    <p><strong>Created:</strong> {formatDate(step.createdAt)}</p>
                    <p><strong>Updated:</strong> {formatDate(step.updatedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobPlanningDetailModal;
