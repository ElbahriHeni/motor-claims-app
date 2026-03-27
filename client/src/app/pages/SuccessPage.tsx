import React from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useClaimContext } from '../context/ClaimContext';
import { CheckCircle2, FileText, Home } from 'lucide-react';

export default function SuccessPage() {
  const navigate = useNavigate();
  const { claimData, resetClaimData } = useClaimContext();

  const claimNumber = claimData.referenceNumber || 'Reference unavailable';

  const handleNewClaim = () => {
    resetClaimData();
    navigate('/');
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-green-200">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-900">Claim Submitted Successfully!</CardTitle>
          <CardDescription className="text-base">
            Your motor claim has been received and is being processed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-sm text-green-700 mb-1">Your Claim Reference Number</p>
            <p className="text-2xl font-bold text-green-900">{claimNumber}</p>
            <p className="text-xs text-green-600 mt-2">
              Please save this number for your records
            </p>
          </div>

          <div>
            <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              What Happens Next?
            </h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-blue-600">1</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Confirmation Email</p>
                  <p className="text-sm text-slate-600">
                    You will receive a confirmation email at <span className="font-medium">{claimData.email || 'your email address'}</span> within the next few minutes.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-blue-600">2</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Claim Review</p>
                  <p className="text-sm text-slate-600">
                    Our claims team will review your submission within 1-2 business days.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-blue-600">3</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Claims Adjuster Contact</p>
                  <p className="text-sm text-slate-600">
                    A claims adjuster will contact you at <span className="font-medium">{claimData.phone || 'your phone number'}</span> to discuss next steps.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-blue-600">4</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Resolution</p>
                  <p className="text-sm text-slate-600">
                    We aim to resolve all claims within 5-7 business days.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h4 className="font-medium text-slate-900 mb-2">Need Help?</h4>
            <p className="text-sm text-slate-700 mb-2">
              If you have any questions about your claim, please contact us:
            </p>
            <div className="text-sm space-y-1">
              <p className="text-slate-600">
                <span className="font-medium">Phone:</span> 1-800-CLAIM-NOW
              </p>
              <p className="text-slate-600">
                <span className="font-medium">Email:</span> claims@insurance.com
              </p>
              <p className="text-slate-600">
                <span className="font-medium">Hours:</span> Mon-Fri, 8:00 AM - 6:00 PM
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleNewClaim}
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Return to Home
            </Button>
            <Button
              onClick={() => window.print()}
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Print Confirmation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}