import { KidneyViewer3D } from './KidneyViewer3D';

interface TrialAnatomyProps {
  organ?: string;
  description?: string;
  studyName?: string;
}

export function TrialAnatomy({ organ, description, studyName }: TrialAnatomyProps) {
  return (
    <KidneyViewer3D
      organ={organ}
      description={description}
      studyName={studyName}
    />
  );
}

export { KidneyViewer3D };
