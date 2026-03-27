import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ClaimData {
  // Backend claim identifiers
  claimId?: number;
  referenceNumber?: string;
  status?: string;

  // Claim Details
  incidentDate?: string;
  incidentTime?: string;
  location?: string;
  description?: string;
  claimType?: string;
  
  // Vehicle Information
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  licensePlate?: string;
  vinNumber?: string;
  
  // Contact Information
  fullName?: string;
  email?: string;
  phone?: string;
  policyNumber?: string;
  
  // Documents
  documents?: File[];
  photos?: File[];
}

interface ClaimContextType {
  claimData: ClaimData;
  updateClaimData: (data: Partial<ClaimData>) => void;
  resetClaimData: () => void;
}

const ClaimContext = createContext<ClaimContextType | undefined>(undefined);

export const ClaimProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [claimData, setClaimData] = useState<ClaimData>({});

  const updateClaimData = (data: Partial<ClaimData>) => {
    setClaimData((prev) => ({ ...prev, ...data }));
  };

  const resetClaimData = () => {
    setClaimData({});
  };

  return (
    <ClaimContext.Provider value={{ claimData, updateClaimData, resetClaimData }}>
      {children}
    </ClaimContext.Provider>
  );
};

export const useClaimContext = () => {
  const context = useContext(ClaimContext);
  if (!context) {
    throw new Error('useClaimContext must be used within a ClaimProvider');
  }
  return context;
};