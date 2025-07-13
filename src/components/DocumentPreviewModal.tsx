
import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle2, Edit3, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface ExtractedData {
  name: string;
  email: string;
  phone: string;
  confidence_score: number;
}

interface ProcessingMetadata {
  document_type: string;
  processing_time: number;
  methods_used: string[];
}

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentPreview: string | null;
  extractedData: ExtractedData;
  processingMetadata: ProcessingMetadata;
  confidenceScore: number;
  onSave: (data: { name: string; email: string; phone: string; source: string }) => void;
  onReprocess: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  documentPreview,
  extractedData,
  processingMetadata,
  confidenceScore,
  onSave,
  onReprocess,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(extractedData);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  React.useEffect(() => {
    setEditedData(extractedData);
    setErrors({});
    // Auto-enable editing if critical fields are missing
    const hasCriticalMissing = !extractedData.name || !extractedData.email;
    setIsEditing(hasCriticalMissing);
  }, [extractedData]);

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Name can only contain letters and spaces';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
        return '';
      case 'phone':
        if (value && value !== 'N/A') {
          const phoneRegex = /^[\+]?[\d\s\-\(\)]+$/;
          if (!phoneRegex.test(value)) return 'Please enter a valid phone number';
        }
        return '';
      default:
        return '';
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSave = () => {
    // Validate all fields
    const newErrors: { [key: string]: string } = {};
    
    Object.keys(editedData).forEach(field => {
      if (field !== 'confidence_score') {
        const error = validateField(field, editedData[field as keyof ExtractedData] as string);
        if (error) {
          newErrors[field] = error;
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({
        title: "Validation Error",
        description: "Please fix the highlighted errors before saving.",
        variant: "destructive",
      });
      return;
    }

    // Save the lead
    onSave({
      name: editedData.name,
      email: editedData.email,
      phone: editedData.phone || 'N/A',
      source: 'Document'
    });

    toast({
      title: "Lead Created",
      description: "Lead has been successfully created from document.",
      variant: "default",
    });

    onClose();
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getConfidenceText = (score: number) => {
    if (score >= 0.8) return 'High Confidence';
    if (score >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  const getMissingFields = () => {
    const missing = [];
    if (!editedData.name || editedData.name === 'N/A') missing.push('Name');
    if (!editedData.email || editedData.email === 'N/A') missing.push('Email');
    if (!editedData.phone || editedData.phone === 'N/A') missing.push('Phone');
    return missing;
  };

  const missingFields = getMissingFields();
  const hasNoDataExtracted = !editedData.name && !editedData.email && !editedData.phone;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Document Preview & Lead Extraction
            <Badge 
              variant="outline" 
              className={`${getConfidenceColor(confidenceScore)} text-white border-0`}
            >
              {getConfidenceText(confidenceScore)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Document Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Document Preview</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={onReprocess}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reprocess
              </Button>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[400px] flex items-center justify-center">
              {documentPreview ? (
                <img 
                  src={documentPreview} 
                  alt="Document preview" 
                  className="max-w-full max-h-[400px] object-contain rounded"
                />
              ) : (
                <div className="text-center text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                  <p>Preview not available</p>
                </div>
              )}
            </div>

            {/* Processing Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Processing Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Document Type:</span>
                  <span className="font-medium capitalize">{processingMetadata.document_type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Time:</span>
                  <span className="font-medium">{processingMetadata.processing_time.toFixed(2)}s</span>
                </div>
                <div className="flex justify-between">
                  <span>Overall Confidence:</span>
                  <span className="font-medium">{(confidenceScore * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Extracted Data */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Extracted Information</h3>
              {!hasNoDataExtracted && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              )}
            </div>

            {/* No Data Extracted Alert */}
            {hasNoDataExtracted && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">No Contact Details Found</span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  No name, email, or phone number could be extracted from this document. Please enter the information manually.
                </p>
              </div>
            )}

            {/* Missing Fields Alert */}
            {!hasNoDataExtracted && missingFields.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Missing Information</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Please provide the following: {missingFields.join(', ')}
                </p>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  value={editedData.name || ''}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  placeholder="Enter full name"
                  disabled={!isEditing}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={editedData.email || ''}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  placeholder="Enter email address"
                  disabled={!isEditing}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={editedData.phone || ''}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  placeholder="Enter phone number or leave as N/A"
                  disabled={!isEditing}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Confidence Indicators */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Extraction Confidence</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Name:</span>
                  <div className="flex items-center gap-2">
                    {editedData.name && editedData.name !== 'N/A' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">{editedData.name && editedData.name !== 'N/A' ? 'Found' : 'Missing'}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Email:</span>
                  <div className="flex items-center gap-2">
                    {editedData.email && editedData.email !== 'N/A' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">{editedData.email && editedData.email !== 'N/A' ? 'Found' : 'Missing'}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Phone:</span>
                  <div className="flex items-center gap-2">
                    {editedData.phone && editedData.phone !== 'N/A' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm">
                      {editedData.phone && editedData.phone !== 'N/A' ? 'Found' : 'Not Found'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Create Lead
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
