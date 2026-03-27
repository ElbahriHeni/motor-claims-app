import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Car, FileText, Upload, CheckCircle } from 'lucide-react';
import { useClaimContext } from '../context/ClaimContext';
import { API_URL } from '../config';

export default function WelcomePage() {
  const navigate = useNavigate();
  const { updateClaimData, resetClaimData } = useClaimContext();
  const [isStarting, setIsStarting] = useState(false);

  const steps = [
    {
      icon: FileText,
      title: 'Claim Details',
      description: 'Provide information about the incident',
    },
    {
      icon: Car,
      title: 'Vehicle Information',
      description: 'Tell us about your vehicle',
    },
    {
      icon: Upload,
      title: 'Upload Documents',
      description: 'Add photos and supporting documents',
    },
    {
      icon: CheckCircle,
      title: 'Review & Submit',
      description: 'Review and submit your claim',
    },
  ];

  const handleStartClaim = async () => {
    try {
      setIsStarting(true);

      resetClaimData();

      const response = await fetch(`${API_URL}/claims`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create claim');
      }

      const data = await response.json();

      updateClaimData({
        claimId: data.id,
        referenceNumber: data.reference_number,
        status: data.status,
      });

      navigate('/claim/details');
    } catch (error) {
      console.error('Error creating claim:', error);
      alert('Could not start claim. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="border-2">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Car className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl">File a Motor Claim</CardTitle>
          <CardDescription className="text-base">
            We&apos;re here to help you through the claims process. Follow the steps below to submit your motor claim.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex gap-3 p-4 bg-slate-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">{step.title}</h3>
                    <p className="text-sm text-slate-600">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-900 mb-2">Before you start, have ready:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your policy number</li>
              <li>• Details about the incident (date, time, location)</li>
              <li>• Vehicle information (make, model, license plate)</li>
              <li>• Photos of any damage</li>
              <li>• Police report or incident documentation (if applicable)</li>
            </ul>
          </div>

          <Button
            onClick={handleStartClaim}
            className="w-full"
            size="lg"
            disabled={isStarting}
          >
            {isStarting ? 'Starting Claim...' : 'Start Your Claim'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 