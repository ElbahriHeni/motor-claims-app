import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useClaimContext } from '../context/ClaimContext';
import { ArrowLeft, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Separator } from '../components/ui/separator';
import { API_URL } from '../config';

export default function ReviewPage() {
  const navigate = useNavigate();
  const { claimData, updateClaimData } = useClaimContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      if (!claimData.claimId) {
        throw new Error('Claim ID is missing');
      }

      const response = await fetch(`${API_URL}/claims/${claimData.claimId}/submit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to submit claim');
      }

      const submittedClaim = await response.json();

      updateClaimData({
        status: submittedClaim.status,
        referenceNumber: submittedClaim.reference_number,
      });

      navigate('/claim/success');
    } catch (error) {
      console.error('Error submitting claim:', error);
      alert('Could not submit claim. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const claimTypeLabels: Record<string, string> = {
    collision: 'Collision',
    comprehensive: 'Comprehensive',
    theft: 'Theft',
    vandalism: 'Vandalism',
    weather: 'Weather Damage',
    other: 'Other',
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Review Your Claim</CardTitle>
          <CardDescription>
            Please review all information before submitting your claim
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium text-slate-900 mb-3">Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Full Name</p>
                <p className="font-medium">{claimData.fullName || '-'}</p>
              </div>
              <div>
                <p className="text-slate-500">Policy Number</p>
                <p className="font-medium">{claimData.policyNumber || '-'}</p>
              </div>
              <div>
                <p className="text-slate-500">Email</p>
                <p className="font-medium">{claimData.email || '-'}</p>
              </div>
              <div>
                <p className="text-slate-500">Phone</p>
                <p className="font-medium">{claimData.phone || '-'}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium text-slate-900 mb-3">Incident Information</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Date</p>
                <p className="font-medium">{claimData.incidentDate || '-'}</p>
              </div>
              <div>
                <p className="text-slate-500">Time</p>
                <p className="font-medium">{claimData.incidentTime || '-'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-slate-500">Location</p>
                <p className="font-medium">{claimData.location || '-'}</p>
              </div>
              <div>
                <p className="text-slate-500">Claim Type</p>
                <p className="font-medium">
                  {claimData.claimType ? claimTypeLabels[claimData.claimType] : '-'}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-slate-500 text-sm">Description</p>
              <p className="text-sm mt-1">{claimData.description || '-'}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium text-slate-900 mb-3">Vehicle Information</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Make</p>
                <p className="font-medium">{claimData.vehicleMake || '-'}</p>
              </div>
              <div>
                <p className="text-slate-500">Model</p>
                <p className="font-medium">{claimData.vehicleModel || '-'}</p>
              </div>
              <div>
                <p className="text-slate-500">Year</p>
                <p className="font-medium">{claimData.vehicleYear || '-'}</p>
              </div>
              <div>
                <p className="text-slate-500">License Plate</p>
                <p className="font-medium">{claimData.licensePlate || '-'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-slate-500">VIN</p>
                <p className="font-medium">{claimData.vinNumber || '-'}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium text-slate-900 mb-3">Uploaded Files</h3>

            {claimData.photos && claimData.photos.length > 0 ? (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <ImageIcon className="w-4 h-4 text-slate-600" />
                  <p className="text-sm font-medium">Photos ({claimData.photos.length})</p>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {claimData.photos.map((photo, index) => (
                    <div key={index} className="aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {claimData.documents && claimData.documents.length > 0 ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-slate-600" />
                  <p className="text-sm font-medium">Documents ({claimData.documents.length})</p>
                </div>
                <div className="space-y-2">
                  {claimData.documents.map((doc, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm p-2 bg-slate-50 rounded-lg">
                      <FileText className="w-4 h-4 text-slate-600" />
                      <span className="truncate">{doc.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {(!claimData.photos || claimData.photos.length === 0) &&
             (!claimData.documents || claimData.documents.length === 0) ? (
              <p className="text-sm text-slate-500">No files uploaded.</p>
            ) : null}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Before Submitting</h4>
            <p className="text-sm text-blue-800">
              By submitting this claim, you confirm that all information provided is accurate and complete to the best of your knowledge. False or misleading information may result in claim denial.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/claim/upload')}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting Claim...
                </>
              ) : (
                'Submit Claim'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}