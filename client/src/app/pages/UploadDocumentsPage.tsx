import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { useClaimContext } from '../context/ClaimContext';
import { ArrowLeft, ArrowRight, Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { API_URL } from '../config';

export default function UploadDocumentsPage() {
  const navigate = useNavigate();
  const { claimData, updateClaimData } = useClaimContext();
  
  const [photos, setPhotos] = useState<File[]>(claimData.photos || []);
  const [documents, setDocuments] = useState<File[]>(claimData.documents || []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos([...photos, ...files]);
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocuments([...documents, ...files]);
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

const handleContinue = async () => {
  try {
    // save locally in context
    updateClaimData({ photos, documents });

    // 🔴 IMPORTANT: make sure claimId exists
    if (!claimData.claimId) {
      alert('Claim ID missing. Please restart the process.');
      return;
    }

    // send to backend
    await fetch(`${API_URL}/claims/${claimData.claimId}/documents`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        photos: photos.map(f => f.name),
        documents: documents.map(f => f.name)
      })
    });

    navigate('/claim/review');
  } catch (err) {
    console.error(err);
    alert('Error saving documents');
  }
};

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Documents & Photos</CardTitle>
          <CardDescription>
            Upload photos of the damage and any supporting documents (all optional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Photos Section */}
          <div className="space-y-4">
            <div>
              <Label className="text-base">Damage Photos</Label>
              <p className="text-sm text-slate-500 mt-1">
                Please upload clear photos of the damage from multiple angles
              </p>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                id="photo-upload"
                className="hidden"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Click to upload photos</p>
                    <p className="text-sm text-slate-500">PNG, JPG up to 10MB each</p>
                  </div>
                </div>
              </label>
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <p className="text-xs text-slate-600 mt-1 truncate">{photo.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Documents Section */}
          <div className="space-y-4">
            <div>
              <Label className="text-base">Supporting Documents</Label>
              <p className="text-sm text-slate-500 mt-1">
                Police reports, incident reports, or other relevant documents (Optional)
              </p>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                id="document-upload"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
                multiple
                onChange={handleDocumentUpload}
              />
              <label htmlFor="document-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                    <Upload className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Click to upload documents</p>
                    <p className="text-sm text-slate-500">PDF, DOC, DOCX up to 10MB each</p>
                  </div>
                </div>
              </label>
            </div>

            {documents.length > 0 && (
              <div className="space-y-2">
                {documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-slate-900 truncate">{doc.name}</p>
                        <p className="text-xs text-slate-500">{formatFileSize(doc.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeDocument(index)}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/claim/vehicle')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button 
              onClick={handleContinue} 
              className="flex-1 flex items-center justify-center gap-2"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}