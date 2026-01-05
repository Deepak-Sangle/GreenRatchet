"use client";

import { updateAvatarAction } from "@/app/actions/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, Upload } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

interface AvatarUploadDialogProps {
  currentAvatarUrl: string | null;
  userName: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AvatarUploadDialog({
  currentAvatarUrl,
  userName,
  open,
  onOpenChange,
}: AvatarUploadDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("File size must be less than 2MB");
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("avatar", selectedFile);

      const result = await updateAvatarAction(formData);

      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else {
        // Success - close dialog and reset state
        setLoading(false);
        setPreviewUrl(null);
        setSelectedFile(null);
        onOpenChange(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload avatar");
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Clean up preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Profile Picture</DialogTitle>
          <DialogDescription>
            Upload a new profile picture. Image should be less than 2MB.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Current Avatar Preview */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {previewUrl || currentAvatarUrl ? (
                <Image
                  src={previewUrl || currentAvatarUrl!}
                  alt="Avatar preview"
                  width={120}
                  height={120}
                  className="h-30 w-30 rounded-full object-cover ring-2 ring-border/50"
                />
              ) : (
                <div className="h-30 w-30 rounded-full bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center ring-2 ring-border/50">
                  <span className="text-3xl font-semibold text-primary">
                    {userName?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
              )}
              <div className="absolute bottom-0 right-0 rounded-full bg-primary p-2 ring-2 ring-background">
                <Camera className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>

            {/* File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              {selectedFile ? "Choose Different Image" : "Choose Image"}
            </Button>

            {selectedFile && (
              <p className="text-xs text-muted-foreground text-center">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={loading || !selectedFile}
          >
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
