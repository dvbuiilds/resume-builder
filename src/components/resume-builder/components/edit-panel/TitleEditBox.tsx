import React, { ChangeEvent } from 'react';

// HOOKS
import { useResumeStore } from '../../store/resumeStore';

// COMPONENTS
import { InputField } from './EditPanelComponents';

export const TitleEditBox = () => {
  const title = useResumeStore((s) => s.title);
  const setTitle = useResumeStore((s) => s.setTitle);

  return (
    <InputField
      value={title}
      onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setTitle(event.target.value)
      }
    />
  );
};
