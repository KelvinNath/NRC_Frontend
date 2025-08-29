import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { type JobPlan, type JobPlanStep, type PaperStorePayload, type CorrugationPayload, type PrintingDetailsPayload, type FluteLaminationPayload, type PunchingPayload, type FlapPastingPayload, type QCDetailsPayload, type DispatchDetailsPayload } from '../Types/job.ts';
import StartWorkConfirmModal from '../modal/StartWorkConfirmModal.tsx';
import PaperStoreForm from '../Form/StepForms/PaperStoreForm.tsx';
import GenericStepForm from '../Form/GenericStepForm.tsx'; // IMPORTED: The new Generic Form
import { CheckCircle, PlayCircle, Pencil, Eye } from "lucide-react";
import JobPlanningDetailModal from '../modal/JobPlanningDetailModal.tsx';


interface JobStepsViewProps {
  // No props needed as it fetches data based on URL param
}

const JobStepsView: React.FC<JobStepsViewProps> = () => {
  const { jobPlanId } = useParams<{ jobPlanId: string }>();
  const navigate = useNavigate();

  const [jobPlan, setJobPlan] = useState<JobPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [showStartConfirmModal, setShowStartConfirmModal] = useState(false);
  const [stepToStart, setStepToStart] = useState<JobPlanStep | null>(null);

  const [showStepSpecificForm, setShowStepSpecificForm] = useState<string | null>(null);
  const [stepToEdit, setStepToEdit] = useState<JobPlanStep | null>(null);

  const [selectedJobPlanForDetail, setSelectedJobPlanForDetail] = useState<JobPlan | null>(null);


  // Removed formatDateForDisplay as it was unused in JSX
  // const formatDateForDisplay = (dateString: string | null) => {
  //   if (!dateString) return 'N/A';
  //   try {
  //     return new Date(dateString).toLocaleString('en-US', {
  //       year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  //     });
  //   } catch {
  //     return 'Invalid Date';
  //   }
  // };

  // Removed toISOString as it was unused directly in JSX
  // const toISOString = (dateString: string) => {
  //   if (!dateString) return null;
  //   return new Date(dateString + 'T00:00:00.000Z').toISOString();
  // };

        // Helper to fetch step-specific details
      const fetchStepDetails = async (stepName: string, stepId: number, jobNrcJobNo: string): Promise<PaperStorePayload | CorrugationPayload | PrintingDetailsPayload | FluteLaminationPayload | PunchingPayload | FlapPastingPayload | QCDetailsPayload | DispatchDetailsPayload | null> => {
        try {
          const accessToken = localStorage.getItem('accessToken');
          if (!accessToken) throw new Error('Authentication token not found.');

          // Properly encode the jobNrcJobNo for URL construction
          const encodedJobNrcJobNo = (jobNrcJobNo);
          let endpoint = '';
          switch (stepName) {
            case 'PaperStore':
              endpoint = `https://nrprod.nrcontainers.com/api/paper-store/by-job/${encodedJobNrcJobNo}`;
              break;
            case 'Corrugation':
              endpoint = `https://nrprod.nrcontainers.com/api/corrugation/by-job/${encodedJobNrcJobNo}`;
              break;
            case 'PrintingDetails':
              endpoint = `https://nrprod.nrcontainers.com/api/printing-details/by-job/${encodedJobNrcJobNo}`;
              break;
            case 'FluteLamination':
              endpoint = `https://nrprod.nrcontainers.com/api/flute-laminate-board-conversion/by-job/${encodedJobNrcJobNo}`;
              break;
            case 'Punching':
              endpoint = `https://nrprod.nrcontainers.com/api/punching/by-job/${encodedJobNrcJobNo}`;
              break;
            case 'FlapPasting':
              endpoint = `https://nrprod.nrcontainers.com/api/side-flap-pasting/by-job/${encodedJobNrcJobNo}`;
              break;
            case 'QualityDept':
              endpoint = `https://nrprod.nrcontainers.com/api/quality-dept/by-job/${encodedJobNrcJobNo}`;
              break;
            case 'DispatchProcess':
              endpoint = `https://nrprod.nrcontainers.com/api/dispatch-process/by-job/${encodedJobNrcJobNo}`;
              break;
            default:
              return null;
          }

          console.log(`🔍 [fetchStepDetails] ${stepName} - Step ID: ${stepId}, Job NRC: ${jobNrcJobNo}`);
          console.log(`🔍 [fetchStepDetails] ${stepName} - Encoded Job NRC: ${encodedJobNrcJobNo}`);
          console.log(`🔍 [fetchStepDetails] ${stepName} - Full Endpoint: ${endpoint}`);

      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch ${stepName} details: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success && data.data) {
        return data.data;
      }
      return null;
    } catch (err) {
      console.error(`Error fetching ${stepName} details for step ${stepId}:`, err);
      return null;
    }
  };


  // --- Data Fetching ---
  const fetchJobPlanDetails = async () => {
    if (!jobPlanId) {
      setError("Job Plan ID not provided in URL.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('Authentication token not found.');

      const jobPlanningEndpoint = `https://nrprod.nrcontainers.com/api/job-planning/`;
      console.log(`🔍 [fetchJobPlanDetails] - Endpoint: ${jobPlanningEndpoint}`);
      console.log(`🔍 [fetchJobPlanDetails] - Method: GET`);
      console.log(`🔍 [fetchJobPlanDetails] - Job Plan ID from URL: ${jobPlanId}`);
      
      const response = await fetch(jobPlanningEndpoint, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch job plan details: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        const foundJobPlan = data.data.find((plan: JobPlan) => plan.jobPlanId === Number(jobPlanId));
        if (foundJobPlan) {
          foundJobPlan.steps.sort((a: JobPlanStep, b: JobPlanStep) => a.stepNo - b.stepNo);

          const stepsWithDetails = await Promise.all(foundJobPlan.steps.map(async (step: { status: string; stepName: string; id: number; }) => {
            let details = null;
            if (step.status === 'start' || step.status === 'stop') {
              details = await fetchStepDetails(step.stepName, step.id, decodeURIComponent(foundJobPlan.nrcJobNo));
            }
            switch (step.stepName) {
              case 'PaperStore':
                return { ...step, paperStoreDetails: details as PaperStorePayload || undefined };
              case 'Corrugation':
                return { ...step, corrugationDetails: details as CorrugationPayload || undefined };
              case 'PrintingDetails':
                return { ...step, printingDetails: details as PrintingDetailsPayload || undefined };
              case 'FluteLamination':
                return { ...step, fluteLaminationDetails: details as FluteLaminationPayload || undefined };
              case 'Punching':
                return { ...step, punchingDetails: details as PunchingPayload || undefined };
              case 'FlapPasting':
                return { ...step, flapPastingDetails: details as FlapPastingPayload || undefined };
              case 'QualityDept':
                return { ...step, qcDetails: details as QCDetailsPayload || undefined };
              case 'DispatchProcess':
                return { ...step, dispatchDetails: details as DispatchDetailsPayload || undefined };
              default:
                return step;
            }
          }));

          // Decode the nrcJobNo when we first receive the data
          const decodedJobPlan = { 
            ...foundJobPlan, 
            nrcJobNo: decodeURIComponent(foundJobPlan.nrcJobNo),
            steps: stepsWithDetails 
          };
          setJobPlan(decodedJobPlan);
        } else {
          setError('Job Plan not found.');
        }
      } else {
        setError('Unexpected API response format for job plans.');
      }
    } catch (err) {
      setError(`Failed to load job plan: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('Fetch Job Plan Details Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobPlanDetails();
  }, [jobPlanId]);


  // --- Step Status Update (PATCH - for start/stop status in JobPlanStep) ---
  const updateJobPlanStepStatus = async (step: JobPlanStep, newStatus: 'start' | 'stop') => {
    setMessage(null);
    setError(null);
    if (!jobPlan) return;

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('Authentication token not found.');

      const payload: { status: 'start' | 'stop'; startDate?: string; endDate?: string; user?: string } = { status: newStatus };
      if (newStatus === 'start') {
        payload.startDate = new Date().toISOString();
        const userDataString = localStorage.getItem('userData');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          payload.user = userData.id; // User is updated here on start
        }
      } else if (newStatus === 'stop') {
        payload.endDate = new Date().toISOString();
      }

      console.log('🔍 [updateJobPlanStepStatus] - nrcJobNo being used:', jobPlan.nrcJobNo);
      console.log('🔍 [updateJobPlanStepStatus] - jobPlanId being used:', jobPlan.jobPlanId);
      console.log('🔍 [updateJobPlanStepStatus] - Step ID:', step.id);
      console.log('🔍 [updateJobPlanStepStatus] - Step Name:', step.stepName);
      console.log('🔍 [updateJobPlanStepStatus] - New Status:', newStatus);
      
      // Try using jobPlanId only in the path (backend might not support nrcJobNo in path)
      const url = `https://nrprod.nrcontainers.com/api/job-planning/${jobPlan.nrcJobNo}/steps/${step.stepNo}`;
      console.log('🔍 [updateJobPlanStepStatus] - Full URL being called:', url);
      
      // First PUT request to update step status
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update step status: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      if (result.success) {
        // If starting work, also create step-specific record with status "in_progress"
        if (newStatus === 'start') {
          await createStepSpecificRecord(step, jobPlan.nrcJobNo, accessToken);
        }
        
        setMessage(`Step "${step.stepName}" status updated to "${newStatus}".`);
        setJobPlan(prevJobPlan => {
          if (!prevJobPlan) return null;
          const updatedSteps = prevJobPlan.steps.map(s =>
            s.id === step.id ? { ...s, status: newStatus, startDate: payload.startDate || s.startDate, endDate: payload.endDate || s.endDate, user: payload.user || s.user } : s
          );
          return { ...prevJobPlan, steps: updatedSteps };
        });
        return true;
      } else {
        throw new Error(result.message || `Failed to update step "${step.stepName}" status.`);
      }
    } catch (err) {
      setError(`Status Update Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('Step Status Update Error:', err);
      return false;
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // --- Helper function to create step-specific records ---
  const createStepSpecificRecord = async (step: JobPlanStep,  jobNrcJobNo: string, accessToken: string) => {
    console.log(`🚀 [createStepSpecificRecord] ===== STARTING POST REQUEST =====`);
    console.log(`🚀 [createStepSpecificRecord] - Step Name: ${step.stepName}`);
    console.log(`🚀 [createStepSpecificRecord] - Step ID: ${step.id}`);
    console.log(`🚀 [createStepSpecificRecord] - Job NRC: ${jobNrcJobNo}`);
    
    try {
      let endpoint = '';
      let payload: any = {
        jobNrcJobNo:  jobNrcJobNo,
        status: 'in_progress',
        jobStepId: step.id,  // Use jobStepId if available, otherwise fallback to step.id
      };

      console.log(`🔍 [createStepSpecificRecord] - Base payload created:`, payload);

      // Determine endpoint and payload based on step type
      switch (step.stepName) {
        case 'PaperStore':
          endpoint = 'https://nrprod.nrcontainers.com/api/paper-store';
          console.log(`📝 [createStepSpecificRecord] - PAPER STORE step detected`);
          console.log(`📝 [createStepSpecificRecord] - POST endpoint: ${endpoint}`);
          payload = {
            ...payload,
            sheetSize: '', // Will be filled by user in form
            quantity: 0, // Will be filled by user in form (number)
            available: 0, // Will be filled by user in form (number)
            issuedDate: new Date().toISOString(), // Current timestamp
            mill: '', // Will be filled by user in form
            extraMargin: '', // Will be filled by user in form
            gsm: '', // Will be filled by user in form
            quality: '', // Will be filled by user in form
          };
          break;
        case 'Corrugation':
          endpoint = 'https://nrprod.nrcontainers.com/api/corrugation';
          console.log(`📝 [createStepSpecificRecord] - CORRUGATION step detected`);
          console.log(`📝 [createStepSpecificRecord] - POST endpoint: ${endpoint}`);
          payload = {
            ...payload,
            date: new Date().toISOString(), // Current timestamp
            shift: '', // Will be filled by user in form
            oprName: '', // Will be filled by user in form
            machineNo: '', // Will be filled by user in form
            quantity: 0, // Will be filled by user in form (number)
            size: '', // Will be filled by user in form
            gsm1: '', // Will be filled by user in form
            gsm2: '', // Will be filled by user in form
            flute: '', // Will be filled by user in form
            remarks: '', // Will be filled by user in form
            qcCheckSignBy: '', // Will be filled by user in form
          };
          break;
        case 'PrintingDetails':
          endpoint = 'https://nrprod.nrcontainers.com/api/printing-details';
          console.log(`📝 [createStepSpecificRecord] - PRINTING DETAILS step detected`);
          console.log(`📝 [createStepSpecificRecord] - POST endpoint: ${endpoint}`);
          payload = {
            ...payload,
            date: new Date().toISOString(), // Current timestamp
            shift: '', // Will be filled by user in form
            oprName: '', // Will be filled by user in form
            noOfColours: 0, // Will be filled by user in form (number)
            inksUsed: '', // Will be filled by user in form
            postPrintingFinishingOkQty: 0, // Will be filled by user in form (number)
            wastage: 0, // Will be filled by user in form (number)
            coatingType: '', // Will be filled by user in form
            separateSheets: 0, // Will be filled by user in form (number)
            extraSheets: 0, // Will be filled by user in form (number)
            machine: '', // Will be filled by user in form
          };
          break;
        case 'FluteLamination':
          endpoint = 'https://nrprod.nrcontainers.com/api/flute-laminate-board-conversion';
          console.log(`📝 [createStepSpecificRecord] - FLUTE LAMINATION step detected`);
          console.log(`📝 [createStepSpecificRecord] - POST endpoint: ${endpoint}`);
          payload = {
            ...payload,
            date: new Date().toISOString(), // Current timestamp
            shift: '', // Will be filled by user in form
            operatorName: '', // Will be filled by user in form
            film: '', // Will be filled by user in form
            okQty: 0, // Will be filled by user in form (number)
            qcCheckSignBy: '', // Will be filled by user in form
            adhesive: '', // Will be filled by user in form
            wastage: 0, // Will be filled by user in form (number)
          };
          break;
        case 'Punching':
          endpoint = 'https://nrprod.nrcontainers.com/api/punching';
          console.log(`📝 [createStepSpecificRecord] - PUNCHING step detected`);
          console.log(`📝 [createStepSpecificRecord] - POST endpoint: ${endpoint}`);
          payload = {
            ...payload,
            date: new Date().toISOString(), // Current timestamp
            shift: '', // Will be filled by user in form
            operatorName: '', // Will be filled by user in form
            okQty: 0, // Will be filled by user in form (number)
            machine: '', // Will be filled by user in form
            qcCheckSignBy: '', // Will be filled by user in form
            die: '', // Will be filled by user in form
            wastage: 0, // Will be filled by user in form (number)
            remarks: '', // Will be filled by user in form
          };
          break;
        case 'FlapPasting':
          endpoint = 'https://nrprod.nrcontainers.com/api/side-flap-pasting';
          console.log(`📝 [createStepSpecificRecord] - FLAP PASTING step detected`);
          console.log(`📝 [createStepSpecificRecord] - POST endpoint: ${endpoint}`);
          payload = {
            ...payload,
            machineNo: '', // Will be filled by user in form
            date: new Date().toISOString(), // Current timestamp
            shift: '', // Will be filled by user in form
            operatorName: '', // Will be filled by user in form
            adhesive: '', // Will be filled by user in form
            quantity: 0, // Will be filled by user in form (number)
            wastage: 0, // Will be filled by user in form (number)
            qcCheckSignBy: '', // Will be filled by user in form
            remarks: '', // Will be filled by user in form
          };
          break;
        case 'QualityDept':
          endpoint = 'https://nrprod.nrcontainers.com/api/quality-dept';
          console.log(`📝 [createStepSpecificRecord] - QUALITY DEPT step detected`);
          console.log(`📝 [createStepSpecificRecord] - POST endpoint: ${endpoint}`);
          payload = {
            ...payload,
            date: new Date().toISOString(), // Current timestamp
            shift: '', // Will be filled by user in form
            operatorName: '', // Will be filled by user in form
            checkedBy: '', // Will be filled by user in form
            rejectedQty: 0, // Will be filled by user in form (number)
            passQty: 0, // Will be filled by user in form (number)
            reasonForRejection: '', // Will be filled by user in form
            remarks: '', // Will be filled by user in form
            qcCheckSignBy: '', // Will be filled by user in form
          };
          break;
        case 'DispatchProcess':
          endpoint = 'https://nrprod.nrcontainers.com/api/dispatch-process';
          console.log(`📝 [createStepSpecificRecord] - DISPATCH PROCESS step detected`);
          console.log(`📝 [createStepSpecificRecord] - POST endpoint: ${endpoint}`);
          payload = {
            ...payload,
            date: new Date().toISOString(), // Current timestamp
            shift: '', // Will be filled by user in form
            operatorName: '', // Will be filled by user in form
            noOfBoxes: 0, // Will be filled by user in form (number)
            dispatchNo: '', // Will be filled by user in form
            dispatchDate: new Date().toISOString(), // Current timestamp
            remarks: '', // Will be filled by user in form
            balanceQty: 0, // Will be filled by user in form (number)
            qcCheckSignBy: '', // Will be filled by user in form
          };
          break;
        default:
          console.warn(`⚠️ [createStepSpecificRecord] - Unknown step type: ${step.stepName}`);
          return;
      }

      console.log(`🔍 [createStepSpecificRecord] - Final payload prepared:`, payload);
      console.log(`🔍 [createStepSpecificRecord] - About to make POST request to: ${endpoint}`);

      console.log(`🌐 [createStepSpecificRecord] - Making POST request...`);
      console.log(`🌐 [createStepSpecificRecord] - Method: POST`);
      console.log(`🌐 [createStepSpecificRecord] - Headers:`, {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken.substring(0, 20)}...` // Show first 20 chars of token
      });
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      console.log(`📡 [createStepSpecificRecord] - Response received!`);
      console.log(`📡 [createStepSpecificRecord] - Status: ${response.status}`);
      console.log(`📡 [createStepSpecificRecord] - Status Text: ${response.statusText}`);
      console.log(`📡 [createStepSpecificRecord] - Response OK: ${response.ok}`);

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`❌ [createStepSpecificRecord] - POST request FAILED for ${step.stepName}`);
        console.error(`❌ [createStepSpecificRecord] - Error: ${errorData.message || response.statusText}`);
        console.error(`❌ [createStepSpecificRecord] - Status: ${response.status}`);
        // Don't throw error here as the main step status update was successful
        return;
      }

      const result = await response.json();
      console.log(`📄 [createStepSpecificRecord] - Response body:`, result);
      
      if (result.success) {
        console.log(`✅ [createStepSpecificRecord] - SUCCESS! ${step.stepName} record created successfully`);
        console.log(`✅ [createStepSpecificRecord] - Response data:`, result.data);
      } else {
        console.warn(`⚠️ [createStepSpecificRecord] - ${step.stepName} record creation returned success: false`);
        console.warn(`⚠️ [createStepSpecificRecord] - Response message:`, result.message);
      }
    } catch (err) {
      console.error(`💥 [createStepSpecificRecord] - EXCEPTION occurred while creating ${step.stepName} record:`, err);
      // Don't throw error here as the main step status update was successful
    } finally {
      console.log(`🏁 [createStepSpecificRecord] ===== POST REQUEST COMPLETED =====`);
    }
  };

  // --- Step Property Update (PUT 1 - for Tick/Cross/Emp ID) ---
  // CORRECTED: Added 'status' to the allowed properties in the type definition
  const handleUpdateStepProperty = async (stepNo: number, property: 'startDate' | 'endDate' | 'user' | 'status', value: string | null) => {
    setMessage(null);
    setError(null);
    if (!jobPlan) return;

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('Authentication token not found.');

      const payload: Partial<JobPlanStep> = { [property]: value };
      if (property === 'user' && value === null) {
        payload.user = null;
      } else if (property === 'user' && value !== null) {
        payload.user = value;
      }


      console.log('🔍 [handleUpdateStepProperty] - nrcJobNo:', jobPlan.nrcJobNo);
      console.log('🔍 [handleUpdateStepProperty] - jobPlanId:', jobPlan.jobPlanId);
      console.log('🔍 [handleUpdateStepProperty] - Step No:', stepNo);
      console.log('🔍 [handleUpdateStepProperty] - Property:', property);
      console.log('🔍 [handleUpdateStepProperty] - Value:', value);
      // Try using jobPlanId only in the path (backend might not support nrcJobNo in path)
      const endpoint = `https://nrprod.nrcontainers.com/api/job-planning/${encodeURIComponent(jobPlan.nrcJobNo)}/steps/${stepNo}`;
      console.log('🔍 [handleUpdateStepProperty] - Full Endpoint:', endpoint);
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update step property: ${response.status} ${response.statusText}`);
      }
      const result = await response.json();
      if (result.success) {
        setMessage(`Step ${property} updated successfully!`);
        setJobPlan(prevJobPlan => {
          if (!prevJobPlan) return null;
          const updatedSteps = prevJobPlan.steps.map(s =>
            s.stepNo === stepNo ? { ...s, [property]: value } : s
          );
          return { ...prevJobPlan, steps: updatedSteps };
        });
        return ;
      } else {
        throw new Error(result.message || `Failed to update step property.`);
      }
    } catch (err) {
      setError(`Property Update Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
;
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  };


  // --- Step-Specific Form Submission (Complete Work) ---
  const handleCompleteWork = async (step: JobPlanStep, put2Payload: any, put2Endpoint: string, empId: string) => {
    console.log('🔍 [handleCompleteWork] - Starting complete work for step:', step.stepName);
    console.log('🔍 [handleCompleteWork] - Step ID:', step.id);
    console.log('🔍 [handleCompleteWork] - Employee ID:', empId);
    console.log('🔍 [handleCompleteWork] - PUT2 Endpoint:', put2Endpoint);
    console.log('🔍 [handleCompleteWork] - PUT2 Payload:', put2Payload);
    
    setMessage(null);
    setError(null);
    if (!jobPlan) return;

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) throw new Error('Authentication token not found.');

      await Promise.all([
        // PUT 1: Update JobPlanStep properties (user, status, endDate)
        handleUpdateStepProperty(step.stepNo, 'user', empId),
        handleUpdateStepProperty(step.stepNo, 'status', 'stop'),
        handleUpdateStepProperty(step.stepNo, 'endDate', new Date().toISOString()),

        // PUT 2: Update step-specific details
        (async () => {
          console.log('🔍 [handleCompleteWork] - Making PUT request to:', put2Endpoint);
          console.log('🔍 [handleCompleteWork] - PUT payload:', put2Payload);
          
          const detailsUpdateResponse = await fetch(put2Endpoint, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(put2Payload),
          });

          console.log('🔍 [handleCompleteWork] - PUT response status:', detailsUpdateResponse.status);
          console.log('🔍 [handleCompleteWork] - PUT response ok:', detailsUpdateResponse.ok);

          if (!detailsUpdateResponse.ok) {
            const errorData = await detailsUpdateResponse.json();
            console.error('🔍 [handleCompleteWork] - PUT request failed:', errorData);
            throw new Error(errorData.message || `Failed to update ${step.stepName} details: ${detailsUpdateResponse.status} ${detailsUpdateResponse.statusText}`);
          }
          const detailsUpdateResult = await detailsUpdateResponse.json();
          console.log('🔍 [handleCompleteWork] - PUT response data:', detailsUpdateResult);
          
          if (!detailsUpdateResult.success) {
            throw new Error(detailsUpdateResult.message || `Failed to update ${step.stepName} details.`);
          }
          return detailsUpdateResult;
        })(),
      ]);

      setMessage(`Work for "${step.stepName}" completed successfully!`);
      setShowStepSpecificForm(null); // Close the step-specific form modal
      setStepToEdit(null);
      fetchJobPlanDetails(); // Re-fetch job plan details to get updated step-specific data
    } catch (err) {
      setError(`Complete Work Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('Complete Work Error:', err);
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // --- Conditional Form Rendering ---
  const renderStepSpecificForm = () => {
    console.log('🔍 [renderStepSpecificForm] - Rendering form for step:', stepToEdit?.stepName);
    console.log('🔍 [renderStepSpecificForm] - Step ID:', stepToEdit?.id);
    console.log('🔍 [renderStepSpecificForm] - Form type:', showStepSpecificForm);
    
    if (!stepToEdit || !jobPlan) return null;

    const commonFormProps = {
      jobPlanId: jobPlan.jobPlanId,
      nrcJobNo: jobPlan.nrcJobNo,
      step: stepToEdit,
      onClose: () => { setShowStepSpecificForm(null); setStepToEdit(null); },
      isReadOnly: stepToEdit.status === 'stop',
      onUpdateStepProperty: handleUpdateStepProperty,
    };

    switch (showStepSpecificForm) {
      case 'PaperStore':
        return <PaperStoreForm {...commonFormProps} onCompleteWork={(payload) => {
          console.log('🔍 [PaperStore onCompleteWork] - Step:', stepToEdit);
          console.log('🔍 [PaperStore onCompleteWork] - PaperStore Details:', stepToEdit.paperStoreDetails);
          console.log('🔍 [PaperStore onCompleteWork] - Payload:', payload);
          
          // Use the step-specific record ID if available, otherwise use the by-job endpoint
          const endpoint = stepToEdit.paperStoreDetails?.id 
            ? `https://nrprod.nrcontainers.com/api/paper-store/${stepToEdit.paperStoreDetails.id}`
            : `https://nrprod.nrcontainers.com/api/paper-store/by-job/${encodeURIComponent(jobPlan.nrcJobNo)}`;
          
          console.log('🔍 [PaperStore onCompleteWork] - Using endpoint:', endpoint);
          return handleCompleteWork(stepToEdit, payload, endpoint, stepToEdit.user || '');
        }} />;
      case 'Corrugation':
      case 'PrintingDetails':
      case 'FluteLamination':
      case 'Punching':
      case 'FlapPasting':
      case 'QualityDept':
      case 'DispatchProcess':
        return <GenericStepForm {...commonFormProps} onCompleteWork={(payload, endpoint, empId) => handleCompleteWork(stepToEdit, payload, endpoint, empId)} />;
      default:
        return null;
    }
  };

  // --- Step Card Rendering Logic ---
  const getStepStatusVisual = (step: JobPlanStep, isPreviousStepCompleted: boolean, isNextPlannedStep: boolean) => {
    let isDetailStatusAccepted = false;
    switch (step.stepName) {
      case 'PaperStore':
        isDetailStatusAccepted = step.paperStoreDetails?.status === 'accept';
        break;
      case 'Corrugation':
        isDetailStatusAccepted = step.corrugationDetails?.status === 'accept';
        break;
      case 'PrintingDetails':
        isDetailStatusAccepted = step.printingDetails?.status === 'accept';
        break;
      case 'FluteLamination':
        isDetailStatusAccepted = step.fluteLaminationDetails?.status === 'accept';
        break;
      case 'Punching':
        isDetailStatusAccepted = step.punchingDetails?.status === 'accept';
        break;
      case 'FlapPasting':
        isDetailStatusAccepted = step.flapPastingDetails?.status === 'accept';
        break;
      case 'QualityDept':
        isDetailStatusAccepted = step.qcDetails?.status === 'accept';
        break;
      case 'DispatchProcess':
        isDetailStatusAccepted = step.dispatchDetails?.status === 'accept';
        break;
      default:
        isDetailStatusAccepted = step.status === 'stop' && step.endDate !== null;
        break;
    }

    const isCompleted = isDetailStatusAccepted;
    const isStarted = step.status === 'start' && step.startDate !== null;

    let icon = null;
    let statusText = '';
    let cardClasses = 'bg-white';
    let actionButton = null;

    if (isCompleted) {
      icon = <CheckCircle className="text-green-600 text-3xl" />;
      statusText = 'Work completed';
      cardClasses += ' border-green-300';
    } else if (isStarted) {
      icon = <PlayCircle className="text-orange-500 text-3xl" />;
      statusText = 'Work started - Click to add/edit details';
      cardClasses += ' border-orange-300';
      actionButton = (
        <button
          className="ml-auto p-2 rounded-full hover:bg-gray-100"
          onClick={(e) => {
            e.stopPropagation();
            console.log('🔍 [Step Edit Button] - Opening form for step:', step.stepName);
            console.log('🔍 [Step Edit Button] - Step ID:', step.id);
            console.log('🔍 [Step Edit Button] - Step Status:', step.status);
            setStepToEdit(step);
            setShowStepSpecificForm(step.stepName);
          }}
        >
          <Pencil className="text-gray-600 text-xl" />
        </button>
      );
    } else if (isNextPlannedStep && isPreviousStepCompleted) {
      icon = <PlayCircle className="text-blue-600 text-3xl" />;
      statusText = 'Ready to start - Click to begin work';
      cardClasses += ' border-blue-300';
      actionButton = (
        <button
          className="ml-auto p-2 rounded-full hover:bg-gray-100"
          onClick={(e) => {
            e.stopPropagation();
            console.log('🔍 [Start Work Button] - Starting work for step:', step.stepName);
            console.log('🔍 [Start Work Button] - Step ID:', step.id);
            console.log('🔍 [Start Work Button] - Step Status:', step.status);
            setStepToStart(step);
            setShowStartConfirmModal(true);
          }}
        >
          <PlayCircle className="text-blue-600 text-xl" />
        </button>
      );
    } else {
      icon = <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">{step.stepNo}</div>;
      statusText = 'Planned';
      cardClasses += ' border-gray-200';
    }

    return { icon, statusText, cardClasses, actionButton, isCompleted };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        <p className="ml-4 text-lg text-gray-600">Loading job steps...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 bg-[#00AEEF] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#0099cc] transition"
        >
          Back to Job Plans
        </button>
      </div>
    );
  }

  if (!jobPlan) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <p className="text-gray-500">Job Plan not found or invalid URL.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 bg-[#00AEEF] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#0099cc] transition"
        >
          Back to Job Plans
        </button>
      </div>
    );
  }

  // Calculate progress
  const completedStepsCount = jobPlan.steps.filter(step => {
    let isDetailStatusAccepted = false;
    switch (step.stepName) {
      case 'PaperStore':
        isDetailStatusAccepted = step.paperStoreDetails?.status === 'accept';
        break;
      case 'Corrugation':
        isDetailStatusAccepted = step.corrugationDetails?.status === 'accept';
        break;
      case 'PrintingDetails':
        isDetailStatusAccepted = step.printingDetails?.status === 'accept';
        break;
      case 'FluteLamination':
        isDetailStatusAccepted = step.fluteLaminationDetails?.status === 'accept';
        break;
      case 'Punching':
        isDetailStatusAccepted = step.punchingDetails?.status === 'accept';
        break;
      case 'FlapPasting':
        isDetailStatusAccepted = step.flapPastingDetails?.status === 'accept';
        break;
      case 'QualityDept':
        isDetailStatusAccepted = step.qcDetails?.status === 'accept';
        break;
      case 'DispatchProcess':
        isDetailStatusAccepted = step.dispatchDetails?.status === 'accept';
        break;
      default:
        isDetailStatusAccepted = step.status === 'stop' && step.endDate !== null;
        break;
    }
    return isDetailStatusAccepted;
  }).length;
  const totalSteps = jobPlan.steps.length;
  const progressPercentage = totalSteps > 0 ? (completedStepsCount / totalSteps) * 100 : 0;

  // Find the next planned step for sequential access
  let nextPlannedStep: JobPlanStep | null = null;
  let previousStepCompleted = true;

  for (let i = 0; i < jobPlan.steps.length; i++) {
    const step = jobPlan.steps[i];
    let currentStepIsCompletedByDetail = false;
    switch (step.stepName) {
      case 'PaperStore':
        currentStepIsCompletedByDetail = step.paperStoreDetails?.status === 'accept';
        break;
      case 'Corrugation':
        currentStepIsCompletedByDetail = step.corrugationDetails?.status === 'accept';
        break;
      case 'PrintingDetails':
        currentStepIsCompletedByDetail = step.printingDetails?.status === 'accept';
        break;
      case 'FluteLamination':
        currentStepIsCompletedByDetail = step.fluteLaminationDetails?.status === 'accept';
        break;
      case 'Punching':
        currentStepIsCompletedByDetail = step.punchingDetails?.status === 'accept';
        break;
      case 'FlapPasting':
        currentStepIsCompletedByDetail = step.flapPastingDetails?.status === 'accept';
        break;
      case 'QualityDept':
        currentStepIsCompletedByDetail = step.qcDetails?.status === 'accept';
        break;
      case 'DispatchProcess':
        currentStepIsCompletedByDetail = step.dispatchDetails?.status === 'accept';
        break;
      default:
        currentStepIsCompletedByDetail = step.status === 'stop' && step.endDate !== null;
        break;
    }

    if (step.status === 'planned') {
      if (previousStepCompleted) {
        nextPlannedStep = step;
        break;
      }
    } else if (step.status === 'start') {
      nextPlannedStep = step;
      break;
    }
    previousStepCompleted = currentStepIsCompletedByDetail;
  }


  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen">
      {/* Header with Job Name and Progress */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Job {jobPlan.nrcJobNo}</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-500 hover:text-gray-700 text-lg font-bold"
            aria-label="Back to Job Plans"
          >
            &times;
          </button>
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Job Progress</h2>
          <div className="flex items-center mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-4">
              <div
                className="bg-[#00AEEF] h-2.5 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-700">{Math.round(progressPercentage)}% Complete</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">{completedStepsCount} of {totalSteps} steps completed</p>
        </div>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded relative mb-6 ${message.includes('Error') ? 'bg-red-100 border border-red-400 text-red-700' : 'bg-green-100 border border-green-400 text-green-700'}`} role="alert">
          <span className="block sm:inline">{message}</span>
        </div>
      )}

      {/* Step Cards */}
      <div className="space-y-4">
        {jobPlan.steps.map((step, index) => {
          // Determine if previous step is completed based on detail status
          let isPreviousStepCompleted = true;
          if (index > 0) {
            const prevStep = jobPlan.steps[index - 1];
            switch (prevStep.stepName) {
              case 'PaperStore':
                isPreviousStepCompleted = prevStep.paperStoreDetails?.status === 'accept';
                break;
              case 'Corrugation':
                isPreviousStepCompleted = prevStep.corrugationDetails?.status === 'accept';
                break;
              case 'PrintingDetails':
                isPreviousStepCompleted = prevStep.printingDetails?.status === 'accept';
                break;
              case 'FluteLamination':
                isPreviousStepCompleted = prevStep.fluteLaminationDetails?.status === 'accept';
                break;
              case 'Punching':
                isPreviousStepCompleted = prevStep.punchingDetails?.status === 'accept';
                break;
              case 'FlapPasting':
                isPreviousStepCompleted = prevStep.flapPastingDetails?.status === 'accept';
                break;
              case 'QualityDept':
                isPreviousStepCompleted = prevStep.qcDetails?.status === 'accept';
                break;
              case 'DispatchProcess':
                isPreviousStepCompleted = prevStep.dispatchDetails?.status === 'accept';
                break;
              default:
                isPreviousStepCompleted = prevStep.status === 'stop' && prevStep.endDate !== null;
                break;
            }
          }

          const isNextPlannedStep = step.id === nextPlannedStep?.id;

          const { icon, statusText, cardClasses, actionButton } = getStepStatusVisual(step, isPreviousStepCompleted, isNextPlannedStep);

          return (
            <div
              key={step.id}
              className={`flex items-center bg-white rounded-lg shadow-sm p-4 border-l-4 ${cardClasses} flex-wrap sm:flex-nowrap`}
            >
              <div className="flex-shrink-0 mr-4 mb-2 sm:mb-0">
                {icon}
              </div>
              <div className="flex-1 min-w-0 pr-4">
                <h3 className="text-lg font-semibold text-gray-800 break-words">{step.stepName}</h3>
                <p className="text-sm text-gray-600 break-words">{statusText}</p>
                {step.machineDetails && step.machineDetails.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1 break-words">
                    Machine: {step.machineDetails.map(md => `${md.machineCode || md.id} (${md.machineType})`).join(', ')}
                  </p>
                )}
              </div>
              <div className="flex items-center ml-auto mt-2 sm:mt-0">
                {actionButton}
                {(step.status === 'stop' || step.status === 'start') && (
                  <button
                    className="ml-2 p-2 rounded-full hover:bg-gray-100 flex-shrink-0"
                                      onClick={(e) => {
                    e.stopPropagation();
                    console.log('🔍 [View Details Button] - Viewing details for step:', step.stepName);
                    console.log('🔍 [View Details Button] - Step ID:', step.id);
                    console.log('🔍 [View Details Button] - Step Status:', step.status);
                    setSelectedJobPlanForDetail(jobPlan);
                    setStepToEdit(step);
                  }}
                  >
                    <Eye className="text-gray-600 text-xl" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {showStartConfirmModal && stepToStart && (
        <StartWorkConfirmModal
          stepName={stepToStart.stepName}
          onConfirm={async () => {
            console.log('🔍 [StartWorkConfirmModal] - Confirming start for step:', stepToStart.stepName);
            console.log('🔍 [StartWorkConfirmModal] - Step ID:', stepToStart.id);
            console.log('🔍 [StartWorkConfirmModal] - Step Name:', stepToStart.stepName);
            
            const success = await updateJobPlanStepStatus(stepToStart, 'start');
            setShowStartConfirmModal(false);
            setStepToStart(null);
            if (success) {
              switch (stepToStart.stepName) {
                case 'PaperStore':
                  setStepToEdit(stepToStart);
                  setShowStepSpecificForm('PaperStore');
                  break;
                case 'Corrugation':
                  setStepToEdit(stepToStart);
                  setShowStepSpecificForm('Corrugation');
                  break;
                case 'PrintingDetails': // Added for generic form
                  setStepToEdit(stepToStart);
                  setShowStepSpecificForm('PrintingDetails');
                  break;
                case 'FluteLamination': // Added for generic form
                  setStepToEdit(stepToStart);
                  setShowStepSpecificForm('FluteLamination');
                  break;
                case 'Punching': // Added for generic form
                  setStepToEdit(stepToStart);
                  setShowStepSpecificForm('Punching');
                  break;
                case 'FlapPasting': // Added for generic form
                  setStepToEdit(stepToStart);
                  setShowStepSpecificForm('FlapPasting');
                  break;
                case 'QualityDept': // Added for generic form
                  setStepToEdit(stepToStart);
                  setShowStepSpecificForm('QualityDept');
                  break;
                case 'DispatchProcess': // Added for generic form
                  setStepToEdit(stepToStart);
                  setShowStepSpecificForm('DispatchProcess');
                  break;
                default:
                  break;
              }
            }
          }}
          onCancel={() => {
            setShowStartConfirmModal(false);
            setStepToStart(null);
          }}
        />
      )}

      {showStepSpecificForm && stepToEdit && (
        renderStepSpecificForm()
      )}

      {selectedJobPlanForDetail && (
        <JobPlanningDetailModal
          jobPlan={selectedJobPlanForDetail}
          onClose={() => { setSelectedJobPlanForDetail(null); setStepToEdit(null); }}
        />
      )}
    </div>
  );
};

export default JobStepsView;
