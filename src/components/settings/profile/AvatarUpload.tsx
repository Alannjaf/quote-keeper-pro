import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

interface AvatarUploadProps {
  profile: any;
  onFileChange: (file: File) => void;
}

export function AvatarUpload({ profile, onFileChange }: AvatarUploadProps) {
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileChange(file);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <Avatar className="h-20 w-20">
        <AvatarImage src={profile?.avatar_url || ''} />
        <AvatarFallback>
          {profile?.first_name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      <div>
        <Label htmlFor="avatar" className="cursor-pointer">
          <div className="flex items-center space-x-2">
            <Camera className="h-4 w-4" />
            <span>Change avatar</span>
          </div>
        </Label>
        <Input
          id="avatar"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>
    </div>
  );
}