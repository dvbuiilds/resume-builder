import React from 'react';

// HOOKS
import { useResumeStore } from '../../store/resumeStore';

// TYPES
import type { SocialHandle } from '../../types/resume-data';

export const SocialHandles: React.FC = () => {
  const socialHandles = useResumeStore((s) => s.socialHandles);
  return (
    <div className="flex flex-row items-center justify-around">
      {socialHandles.map((socialHandle, index) => (
        <SocialHandle
          key={`socialHandle_${index}`}
          link={socialHandle.link}
          label={socialHandle.label}
        />
      ))}
    </div>
  );
};

const SocialHandle: React.FC<SocialHandle> = (props) => {
  return (
    <a
      className="text-center text-xs underline"
      href={props.link}
      target="_blank"
      rel="noopener noreferrer"
    >
      {props.label}
    </a>
  );
};
