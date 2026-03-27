import React from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useClaimContext } from '../context/ClaimContext';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { API_URL } from '../config';

interface ClaimDetailsForm {
  fullName: string;
  email: string;
  phone: string;
  policyNumber: string;
  incidentDate: string;
  incidentTime: string;
  location: string;
  claimType: string;
  description: string;
}

export default function ClaimDetailsPage() {
  const navigate = useNavigate();
  const { claimData, updateClaimData } = useClaimContext();

  const { register, handleSubmit, setValue } = useForm<ClaimDetailsForm>({
    defaultValues: {
      fullName: claimData.fullName || '',
      email: claimData.email || '',
      phone: claimData.phone || '',
      policyNumber: claimData.policyNumber || '',
      incidentDate: claimData.incidentDate || '',
      incidentTime: claimData.incidentTime || '',
      location: claimData.location || '',
      claimType: claimData.claimType || '',
      description: claimData.description || '',
    },
  });

  const onSubmit = async (data: ClaimDetailsForm) => {
    try {
      let claimId = claimData.claimId;

      if (!claimId) {
        const createResponse = await fetch('http://localhost:5000/claims', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!createResponse.ok) {
          throw new Error('Failed to create claim');
        }

        const claim = await createResponse.json();
        claimId = claim.id;

        updateClaimData({
          claimId: claim.id,
          referenceNumber: claim.reference_number,
          status: claim.status,
        });
      }

      updateClaimData(data);

      const response = await fetch(`${API_URL}/claims/${claimId}/details`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save claim details');
      }

      navigate('/claim/vehicle');
    } catch (error) {
      console.error('Error saving claim details:', error);
      alert('Could not save claim details. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Claim Details</CardTitle>
          <CardDescription>
            Please provide details about yourself and the incident (all fields are optional)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium text-slate-900">Personal Information</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    {...register('fullName')}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="policyNumber">Policy Number</Label>
                  <Input
                    id="policyNumber"
                    {...register('policyNumber')}
                    placeholder="POL123456789"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="john.doe@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register('phone')}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-slate-900">Incident Information</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="incidentDate">Date of Incident</Label>
                  <Input
                    id="incidentDate"
                    type="date"
                    {...register('incidentDate')}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="incidentTime">Time of Incident</Label>
                  <Input
                    id="incidentTime"
                    type="time"
                    {...register('incidentTime')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location of Incident</Label>
                <Input
                  id="location"
                  {...register('location')}
                  placeholder="123 Main Street, City, State"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="claimType">Type of Claim</Label>
                <Select
                  defaultValue={claimData.claimType}
                  onValueChange={(value) => setValue('claimType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select claim type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="collision">Collision</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive</SelectItem>
                    <SelectItem value="theft">Theft</SelectItem>
                    <SelectItem value="vandalism">Vandalism</SelectItem>
                    <SelectItem value="weather">Weather Damage</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <input type="hidden" {...register('claimType')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description of Incident</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Please describe what happened in detail..."
                  rows={5}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button type="submit" className="flex-1 flex items-center justify-center gap-2">
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}