import React, { ChangeEvent, useMemo } from 'react';

// THIRD_PARTY
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';

// HOOKS
import { useResumeStore } from '../../store/resumeStore';

// COMPONENTS
import { DraggableWrapper } from '../wrappers/DraggableWrapper';
import {
  BlueButton,
  ButtonWithCrossIcon,
  InputField,
} from './EditPanelComponents';

// TYPES
import type { SocialHandle } from '../../types/resume-data';

type SocialHandleKeys = 'label' | 'link';

export const SocialHandlesEditBox: React.FC = () => {
  const socialHandles = useResumeStore((s) => s.socialHandles);
  const setSocialHandles = useResumeStore((s) => s.setSocialHandles);
  const updateSocialHandleAt = useResumeStore((s) => s.updateSocialHandleAt);
  const addSocialHandle = useResumeStore((s) => s.addSocialHandle);
  const removeSocialHandleAt = useResumeStore((s) => s.removeSocialHandleAt);

  const onDragEnd = (result: DropResult<string>) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) {
      return;
    }

    const newItems = Array.from(socialHandles);
    // removing the dragged item from the existing array. the index of the dragged item is available in result.source.index.
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    // placing the dragged item to the destination index. the destination index is available in result.destination.index.
    newItems.splice(result?.destination?.index ?? 0, 0, reorderedItem);
    setSocialHandles(newItems);
  };

  const onChangeHandler = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    updateSocialHandleAt(index, {
      [event.target.name as SocialHandleKeys]: event.target.value,
    } as any);
  };

  const addNewSocialHandle = () => {
    if (socialHandles.length >= 5) {
      // Prevent addition if 5 or more handles
      alert('Social Handles should not be more than 5.');
      return;
    }
    addSocialHandle({ label: 'New Social Media', link: 'https://' });
  };

  const canDeleteSocialHandles = useMemo(
    () => socialHandles.length > 2,
    [socialHandles.length],
  );

  const deleteSocialHandle = (index: number) => {
    if (socialHandles.length <= 2) {
      // Prevent deletion if 2 or fewer handles
      alert('Social Media Handles should be minimum 2.');
      return;
    }
    removeSocialHandleAt(index);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="list">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {socialHandles.map((socialHandle, index) => (
              <Draggable
                key={`socialHandeLabel_${index}`}
                draggableId={`socialHandeLabel_${index}`}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="mb-1"
                  >
                    <SocialHandleEditBox
                      index={index}
                      canDeleteSocialHandles={canDeleteSocialHandles}
                      socialHandle={socialHandle}
                      onChangeHandler={onChangeHandler}
                      deleteSocialHandle={deleteSocialHandle}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      {/** Add Social Handle Button. Can be kept outside of the context wrapper, but just to save extra node, i kept it here. */}
      <BlueButton label="Add Social Handle" onClick={addNewSocialHandle} />
    </DragDropContext>
  );
};

const SocialHandleEditBox: React.FC<{
  canDeleteSocialHandles: boolean;
  socialHandle: SocialHandle;
  index: number;
  deleteSocialHandle: (_: number) => void;
  onChangeHandler: (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => void;
}> = ({
  canDeleteSocialHandles,
  socialHandle,
  index,
  deleteSocialHandle,
  onChangeHandler,
}) => {
  return (
    <DraggableWrapper>
      <div className="flex flex-row justify-between pt-1 items-center relative">
        <p className="text-sm">Social Handle #{index + 1}</p>
        <ButtonWithCrossIcon
          onClick={() => deleteSocialHandle(index)}
          disabled={!canDeleteSocialHandles}
        />
      </div>
      <div className="flex flex-row gap-2 pr-2 py-1 items-center">
        <p className="text-xs">Label</p>
        <InputField
          value={socialHandle.label}
          name={'label'}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onChangeHandler(event, index)
          }
        />
      </div>
      <div className="flex flex-row gap-4 pr-2 pb-1 items-center">
        <p className="text-xs">Link</p>
        <InputField
          value={socialHandle.link}
          name={'link'}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onChangeHandler(event, index)
          }
        />
      </div>
    </DraggableWrapper>
  );
};
