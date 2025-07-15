// import { useState, useCallback } from 'react';
// import { useForm } from 'react-hook-form';
// import { Upload, FileText, Image, X, CheckCircle, Loader2 } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Progress } from '@/components/ui/progress';
// import { toast } from '@/hooks/use-toast';

// interface LeadFormData {
//   name: string;
//   email: string;
//   phone: string;
// }

// interface LeadCreationProps {
//   onLeadCreate: (lead: LeadFormData & { source: string }) => void;
// }

// export const LeadCreation = ({ onLeadCreate }: LeadCreationProps) => {
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
//   const [isDragOver, setIsDragOver] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [extractedData, setExtractedData] = useState<any>(null);

//   const { register, handleSubmit, reset, formState: { errors } } = useForm<LeadFormData>();

//   const onSubmit = async (data: LeadFormData) => {
//     try {
//       onLeadCreate({
//         ...data,
//         source: 'Manual'
//       });
      
//       reset();
//     } catch (error) {
//       toast({
//         title: "Error Creating Lead",
//         description: "Failed to create lead. Please try again.",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleDragOver = useCallback((e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragOver(true);
//   }, []);

//   const handleDragLeave = useCallback((e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragOver(false);
//   }, []);

//   const handleDrop = useCallback((e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragOver(false);
    
//     const files = Array.from(e.dataTransfer.files);
//     handleFiles(files);
//   }, []);

//   const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       const files = Array.from(e.target.files);
//       handleFiles(files);
//     }
//   };

//   const handleFiles = async (files: File[]) => {
//     const validFiles = files.filter(file => 
//       file.type === 'application/pdf' || file.type.startsWith('image/')
//     );

//     if (validFiles.length === 0) {
//       toast({
//         title: "Invalid File Type",
//         description: "Please upload PDF or image files only.",
//         variant: "destructive",
//       });
//       return;
//     }

//     const file = validFiles[0]; // Process first file only
//     setUploadedFiles([file]);
//     setIsProcessing(true);
    
//     try {
//       // Upload and process document
//       const formData = new FormData();
//       formData.append('file', file);

//       const response = await fetch('http://localhost:8000/api/process-document-enhanced', {
//         method: 'POST',
//         body: formData,
//       });

//       if (!response.ok) {
//         throw new Error('Failed to process document');
//       }

//       const result = await response.json();
      
//       if (result.success) {
//         setExtractedData(result.data);
//         toast({
//           title: "Document Processed Successfully",
//           description: `Extracted information with ${Math.round(result.confidence_score * 100)}% confidence.`,
//         });
//       } else {
//         throw new Error(result.message || 'Processing failed');
//       }

//     } catch (error) {
//       console.error('Document processing error:', error);
//       toast({
//         title: "Processing Failed",
//         description: "Failed to extract information from document. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleCreateLeadFromExtraction = async () => {
//     if (!extractedData) return;

//     try {
//       onLeadCreate({
//         name: extractedData.name || 'Unknown',
//         email: extractedData.email || '',
//         phone: extractedData.phone || 'N/A',
//         source: 'Document'
//       });

//       // Reset state
//       setExtractedData(null);
//       setUploadedFiles([]);
      
//     } catch (error) {
//       toast({
//         title: "Error Creating Lead",
//         description: "Failed to create lead from extracted data.",
//         variant: "destructive",
//       });
//     }
//   };

//   const removeFile = (index: number) => {
//     setUploadedFiles(prev => prev.filter((_, i) => i !== index));
//     setExtractedData(null);
//   };

//   const getFileIcon = (file: File) => {
//     if (file.type === 'application/pdf') {
//       return <FileText className="h-8 w-8 text-red-600" />;
//     }
//     return <Image className="h-8 w-8 text-slate-600" />;
//   };

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
//       {/* Manual Lead Entry */}
//       <Card className="border-slate-200 hover:shadow-lg transition-shadow duration-300">
//         <CardHeader className="bg-slate-50/50">
//           <CardTitle className="flex items-center space-x-2 text-slate-900">
//             <div className="h-2 w-2 rounded-full bg-slate-600"></div>
//             <span>Manual Lead Entry</span>
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="p-6">
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
//             <div className="space-y-2">
//               <Label htmlFor="name" className="text-slate-700 font-medium">Full Name</Label>
//               <Input
//                 id="name"
//                 {...register('name', { required: 'Name is required' })}
//                 placeholder="Enter lead's full name"
//                 className="border-slate-300 focus:border-slate-500 focus:ring-slate-200"
//               />
//               {errors.name && (
//                 <p className="text-sm text-red-600">{errors.name.message}</p>
//               )}
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 {...register('email', { 
//                   required: 'Email is required',
//                   pattern: {
//                     value: /\S+@\S+\.\S+/,
//                     message: 'Please enter a valid email'
//                   }
//                 })}
//                 placeholder="Enter email address"
//                 className="border-slate-300 focus:border-slate-500 focus:ring-slate-200"
//               />
//               {errors.email && (
//                 <p className="text-sm text-red-600">{errors.email.message}</p>
//               )}
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="phone" className="text-slate-700 font-medium">Phone Number</Label>
//               <Input
//                 id="phone"
//                 type="tel"
//                 {...register('phone', { required: 'Phone number is required' })}
//                 placeholder="Enter phone number"
//                 className="border-slate-300 focus:border-slate-500 focus:ring-slate-200"
//               />
//               {errors.phone && (
//                 <p className="text-sm text-red-600">{errors.phone.message}</p>
//               )}
//             </div>

//             <Button 
//               type="submit" 
//               className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium h-11"
//             >
//               Create Lead
//             </Button>
//           </form>
//         </CardContent>
//       </Card>

//       {/* Document Upload */}
//       <Card className="border-slate-200 hover:shadow-lg transition-shadow duration-300">
//         <CardHeader className="bg-slate-50/50">
//           <CardTitle className="flex items-center space-x-2 text-slate-900">
//             <div className="h-2 w-2 rounded-full bg-emerald-600"></div>
//             <span>AI Document Processing</span>
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="p-6">
//           <div
//             className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
//               isDragOver
//                 ? 'border-slate-400 bg-slate-50'
//                 : 'border-slate-300 hover:border-slate-400'
//             }`}
//             onDragOver={handleDragOver}
//             onDragLeave={handleDragLeave}
//             onDrop={handleDrop}
//           >
//             {isProcessing ? (
//               <div className="space-y-4">
//                 <Loader2 className="mx-auto h-12 w-12 text-slate-400 animate-spin" />
//                 <div className="space-y-2">
//                   <p className="text-sm font-medium text-slate-600">Processing document...</p>
//                   <p className="text-xs text-slate-500">Extracting lead information with AI</p>
//                 </div>
//               </div>
//             ) : (
//               <>
//                 <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
//                 <div className="space-y-2">
//                   <p className="text-sm font-medium text-slate-600">Drop PDF/PNG files here</p>
//                   <p className="text-xs text-slate-500">or click to browse your files</p>
//                   <input
//                     type="file"
//                     multiple
//                     accept=".pdf,image/*"
//                     onChange={handleFileInput}
//                     className="hidden"
//                     id="file-upload"
//                   />
//                   <Label htmlFor="file-upload">
//                     <Button 
//                       variant="outline" 
//                       className="cursor-pointer border-slate-300 text-slate-700 hover:bg-slate-50" 
//                       asChild
//                     >
//                       <span>Browse Files</span>
//                     </Button>
//                   </Label>
//                 </div>
//               </>
//             )}
//           </div>

//           {/* Extracted Data Preview */}
//           {extractedData && (
//             <div className="mt-6 space-y-4">
//               <h4 className="text-sm font-medium text-slate-900">Extracted Information</h4>
//               <div className="bg-slate-50 rounded-lg p-4 space-y-3">
//                 <div className="grid grid-cols-2 gap-4 text-sm">
//                   <div>
//                     <span className="font-medium text-slate-600">Name:</span>
//                     <p className="text-slate-900">{extractedData.name || 'Not found'}</p>
//                   </div>
//                   <div>
//                     <span className="font-medium text-slate-600">Email:</span>
//                     <p className="text-slate-900">{extractedData.email || 'Not found'}</p>
//                   </div>
//                   <div>
//                     <span className="font-medium text-slate-600">Phone:</span>
//                     <p className="text-slate-900">{extractedData.phone || 'Not found'}</p>
//                   </div>
//                   <div>
//                     <span className="font-medium text-slate-600">Confidence:</span>
//                     <p className="text-slate-900">{Math.round(extractedData.confidence_score * 100)}%</p>
//                   </div>
//                 </div>
//                 <Button 
//                   onClick={handleCreateLeadFromExtraction}
//                   className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
//                 >
//                   Create Lead from Extracted Data
//                 </Button>
//               </div>
//             </div>
//           )}

//           {/* Uploaded Files */}
//           {uploadedFiles.length > 0 && !extractedData && (
//             <div className="mt-6 space-y-2">
//               <h4 className="text-sm font-medium text-slate-900">Uploaded Files</h4>
//               <div className="space-y-2">
//                 {uploadedFiles.map((file, index) => (
//                   <div
//                     key={index}
//                     className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
//                   >
//                     <div className="flex items-center space-x-3">
//                       {getFileIcon(file)}
//                       <div>
//                         <p className="text-sm font-medium text-slate-900">{file.name}</p>
//                         <p className="text-xs text-slate-500">
//                           {(file.size / 1024 / 1024).toFixed(2)} MB
//                         </p>
//                       </div>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <CheckCircle className="h-4 w-4 text-emerald-600" />
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => removeFile(index)}
//                         className="text-slate-400 hover:text-slate-600"
//                       >
//                         <X className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// };



import { DocumentPreviewModal } from "@/components/DocumentPreviewModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, FileText, Image, Loader2, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";

interface LeadFormData {
  name: string;
  email: string;
  phone: string;
}

interface LeadCreationProps {
  onLeadCreate: (lead: LeadFormData & { source: string }) => void;
}

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

export const LeadCreation = ({ onLeadCreate }: LeadCreationProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(
    null
  );
  const [processingMetadata, setProcessingMetadata] =
    useState<ProcessingMetadata | null>(null);
  const [confidenceScore, setConfidenceScore] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadFormData>();

  const onSubmit = async (data: LeadFormData) => {
    try {
      onLeadCreate({
        ...data,
        source: "Manual",
      });

      reset();
      toast({
        title: "Lead Created Successfully",
        description: `${data.name} has been added to your CRM system.`,
      });
    } catch (error) {
      toast({
        title: "Error Creating Lead",
        description: "Failed to create lead. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    const validFiles = files.filter(
      (file) =>
        file.type === "application/pdf" || file.type.startsWith("image/")
    );

    if (validFiles.length === 0) {
      toast({
        title: "Invalid File Type",
        description: "Please upload PDF or image files only.",
        variant: "destructive",
      });
      return;
    }

    const file = validFiles[0]; // Process first file only
    setUploadedFiles([file]);
    setIsProcessing(true);

    try {
      // Upload and process document
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "http://localhost:8000/api/process-document-enhanced",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to process document");
      }

      const result = await response.json();

      if (result.success) {
        const extracted = result.extracted_data;
        const metadata = result.processing_metadata;
        const preview = result.document_preview
          ? `data:image/png;base64,${result.document_preview}`
          : null;

        setExtractedData(extracted);
        setProcessingMetadata(metadata);
        setDocumentPreview(preview);
        setConfidenceScore(result.confidence_score);
        setShowPreviewModal(true);

        toast({
          title: "Document Processed Successfully",
          description: `Extracted information with ${Math.round(
            result.confidence_score * 100
          )}% confidence.`,
          duration: 3000,
        });
      } else {
        throw new Error(result.message || "Processing failed");
      }
    } catch (error) {
      console.error("Document processing error:", error);
      toast({
        title: "Processing Failed",
        description:
          "Failed to extract information from document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveFromModal = (data: {
    name: string;
    email: string;
    phone: string;
    source: string;
  }) => {
    onLeadCreate(data);
    setShowPreviewModal(false);
    // Reset all document processing state
    setExtractedData(null);
    setDocumentPreview(null);
    setProcessingMetadata(null);
    setUploadedFiles([]);
    setConfidenceScore(0);
  };

  const handleReprocess = () => {
    if (uploadedFiles.length > 0) {
      handleFiles(uploadedFiles);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setExtractedData(null);
    setDocumentPreview(null);
    setProcessingMetadata(null);
  };

  const getFileIcon = (file: File) => {
    if (file.type === "application/pdf") {
      return <FileText className="h-8 w-8 text-red-600" />;
    }
    return <Image className="h-8 w-8 text-slate-600" />;
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Manual Lead Entry */}
        <Card className="border-slate-200 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="bg-slate-50/50">
            <CardTitle className="flex items-center space-x-2 text-slate-900">
              <div className="h-2 w-2 rounded-full bg-slate-600"></div>
              <span>Manual Lead Entry</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  {...register("name", { required: "Name is required" })}
                  placeholder="Enter lead's full name"
                  className="border-slate-300 focus:border-slate-500 focus:ring-slate-200"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "Please enter a valid email",
                    },
                  })}
                  placeholder="Enter email address"
                  className="border-slate-300 focus:border-slate-500 focus:ring-slate-200"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-700 font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register("phone", {
                    required: "Phone number is required",
                  })}
                  placeholder="Enter phone number"
                  className="border-slate-300 focus:border-slate-500 focus:ring-slate-200"
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium h-11"
              >
                Create Lead
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Document Upload */}
        <Card className="border-slate-200 hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="bg-slate-50/50">
            <CardTitle className="flex items-center space-x-2 text-slate-900">
              <div className="h-2 w-2 rounded-full bg-emerald-600"></div>
              <span>AI Document Processing</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                isDragOver
                  ? "border-slate-400 bg-slate-50"
                  : "border-slate-300 hover:border-slate-400"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {isProcessing ? (
                <div className="space-y-4">
                  <Loader2 className="mx-auto h-12 w-12 text-slate-400 animate-spin" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-600">
                      Processing document...
                    </p>
                    <p className="text-xs text-slate-500">
                      Extracting lead information with AI
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-600">
                      Drop PDF/PNG files here
                    </p>
                    <p className="text-xs text-slate-500">
                      or click to browse your files
                    </p>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,image/*"
                      onChange={handleFileInput}
                      className="hidden"
                      id="file-upload"
                    />
                    <Label htmlFor="file-upload">
                      <Button
                        variant="outline"
                        className="cursor-pointer border-slate-300 text-slate-700 hover:bg-slate-50"
                        asChild
                      >
                        <span>Browse Files</span>
                      </Button>
                    </Label>
                  </div>
                </>
              )}
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="mt-6 space-y-2">
                <h4 className="text-sm font-medium text-slate-900">
                  Uploaded Files
                </h4>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file)}
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Document Preview Modal */}
      {showPreviewModal && extractedData && processingMetadata && (
        <DocumentPreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          documentPreview={documentPreview}
          extractedData={extractedData}
          processingMetadata={processingMetadata}
          confidenceScore={confidenceScore}
          onSave={handleSaveFromModal}
          onReprocess={handleReprocess}
        />
      )}
    </>
  );
};
