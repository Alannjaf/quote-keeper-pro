import { ProfileForm } from "./profile/ProfileForm";

interface ProfileSettingsFormProps {
  profile: any;
}

export function ProfileSettingsForm({ profile }: ProfileSettingsFormProps) {
  return <ProfileForm profile={profile} />;
}