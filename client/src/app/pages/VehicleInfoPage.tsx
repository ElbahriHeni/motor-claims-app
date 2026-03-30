import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
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
  const [searchParams] = useSearchParams();
  const claimIdFromUrl = searchParams.get('claimId');
  const hasLoadedRef = useRef(false);

  const { claimData, updateClaimData } = useClaimContext();

  const { register, handleSubmit, reset } = useForm<VehicleInfoForm>({
    defaultValues: {
      vehicleMake: claimData.vehicleMake || '',
      vehicleModel: claimData.vehicleModel || '',
      vehicleYear: claimData.vehicleYear || '',
      licensePlate: claimData.licensePlate || '',
      vinNumber: claimData.vinNumber || '',
    },
  });

  // ✅ LOAD EXISTING VEHICLE DATA (EDIT MODE)
  useEffect(() => {
    if (!claimIdFromUrl || hasLoadedRef.current) return;

    hasLoadedRef.current = true;

    fetch(`${API_URL}/claims/${claimIdFromUrl}`)
      .then(res => res.json())
      .then(data => {
        console.log('VEHICLE DATA:', data);

        const vehicle = data.vehicle;

        if (!vehicle) return;

        const formValues: VehicleInfoForm = {
          vehicleMake: vehicle.vehicle_make || '',
          vehicleModel: vehicle.vehicle_model || '',
          vehicleYear: vehicle.vehicle_year || '',
          licensePlate: vehicle.license_plate || '',
          vinNumber: vehicle.vin_number || '',
        };

        reset(formValues);

        updateClaimData(formValues);
      });
  }, [claimIdFromUrl, reset]);

  const onSubmit = async (data: VehicleInfoForm) => {
    try {
      updateClaimData(data);

      const claimId = claimIdFromUrl || claimData.claimId;

      if (!claimId) {
        throw new Error('No claim ID found');
      }

      const response = await fetch(`${API_URL}/claims/${claimId}/vehicle`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save vehicle info');
      }

      // ✅ KEEP claimId IN URL
      navigate(`/claim/upload?claimId=${claimId}`);
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
                  placeholder="e.g., Toyota"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleModel">Model</Label>
                <Input
                  id="vehicleModel"
                  {...register('vehicleModel')}
                  placeholder="e.g., Camry"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleYear">Year</Label>
                <Input
                  id="vehicleYear"
                  {...register('vehicleYear')}
                  placeholder="2020"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="licensePlate">License Plate</Label>
                <Input
                  id="licensePlate"
                  {...register('licensePlate')}
                  placeholder="ABC-1234"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vinNumber">VIN</Label>
              <Input
                id="vinNumber"
                {...register('vinNumber')}
                placeholder="17-character VIN"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/claim/details?claimId=${claimIdFromUrl || claimData.claimId}`)}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>

              <Button type="submit" className="flex-1">
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