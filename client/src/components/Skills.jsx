import { UseUser } from "../context/UserContext";
import { Handshake } from "lucide-react";

export default function Skills({ job }) {
  const { user } = UseUser();
  const skills = user?.skills || [];

  return (
    <div className="flex gap-2">
      <Handshake className="job-icon" />
      <span className="text-sm font-medium mr-2 flex items-center gap-1">
        Skills Match ({Number(job?.skillsMatch)}/{skills.length}):
      </span>
      {job?.skillsInDescription?.map((skill) => (
        <span key={skill} className="text-xs bg-gray-100 px-2 py-1 rounded">
          {skill}
        </span>
      ))}
    </div>
  );
}
