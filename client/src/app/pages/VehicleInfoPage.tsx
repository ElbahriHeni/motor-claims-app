import React from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useClaimContext } from '../context/ClaimContext';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { API_URL } from '../config';

interface VehicleInfoForm {
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  licensePlate: string;
  vinNumber: string;
}

export default function VehicleInfoPage() {
  const navigate = useNavigate();
  const { claimData, updateClaimData } = useClaimContext();

  const { register, handleSubmit } = useForm<VehicleInfoForm>({
    defaultValues: {
      vehicleMake: claimData.vehicleMake || '',
      vehicleModel: claimData.vehicleModel || '',
      vehicleYear: claimData.vehicleYear || '',
      licensePlate: claimData.licensePlate || '',
      vinNumber: claimData.vinNumber || '',
    },
  });

  const onSubmit = async (data: VehicleInfoForm) => {
    try {
      updateClaimData(data);

      if (!claimData.claimId) {
        throw new Error('No claim ID found');
      }

      const response = await fetch(`${API_URL}/claims/${claimData.claimId}/vehicle`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save vehicle info');
      }

      navigate('/claim/upload');
    } catch (error) {
      console.error('Error saving vehicle info:', error);
      alert('Could not save vehicle info. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Information</CardTitle>
          <CardDescription>
            Please provide details about your vehicle (all fields are optional)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleMake">Make</Label>
                <Input
                  id="vehicleMake"
                  {...register('vehicleMake')}
                  placeholder="e.g., Toyota, Honda, Ford"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleModel">Model</Label>
                <Input
                  id="vehicleModel"
                  {...register('vehicleModel')}
                  placeholder="e.g., Camry, Civic, F-150"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleYear">Year</Label>
                <Input
                  id="vehicleYear"
                  {...register('vehicleYear')}
                  placeholder="e.g., 2020"
                  maxLength={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="licensePlate">License Plate</Label>
                <Input
                  id="licensePlate"
                  {...register('licensePlate')}
                  placeholder="ABC-1234"
                  className="uppercase"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vinNumber">VIN Number</Label>
              <Input
                id="vinNumber"
                {...register('vinNumber')}
                placeholder="1HGBH41JXMN109186"
                maxLength={17}
                className="uppercase"
              />
              <p className="text-xs text-slate-500">
                The VIN is a 17-character code found on your vehicle registration or dashboard
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/claim/details')}
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