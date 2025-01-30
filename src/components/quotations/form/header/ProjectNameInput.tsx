import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProjectNameInputProps {
  projectName: string;
  setProjectName: (value: string) => void;
}

export function ProjectNameInput({ projectName, setProjectName }: ProjectNameInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="projectName">Project Name</Label>
      <Input
        id="projectName"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        required
      />
    </div>
  );
}