import { useCallback } from 'react';
import type { DropResult } from '@hello-pangea/dnd';
import type { ActiveSectionName } from '../types/layout';

interface UseDragAndDropProps {
  sectionsOrder: ActiveSectionName[];
  updateSectionsOrder: (
    updater: (prev: ActiveSectionName[]) => ActiveSectionName[],
  ) => void;
}

export const useDragAndDrop = ({
  sectionsOrder,
  updateSectionsOrder,
}: UseDragAndDropProps) => {
  const onDragEnd = useCallback(
    (result: DropResult<string>) => {
      if (!result.destination) return;
      if (result.destination.index === result.source.index) {
        return;
      }

      updateSectionsOrder((prev) => {
        // getting new array reference.
        const newItems = Array.from(prev);
        // removing the dragged item from the existing array. the index of the dragged item is available in result.source.index.
        const [reorderedItem] = newItems.splice(result.source.index, 1);
        // placing the dragged item to the destination index. the destination index is available in result.destination.index.
        newItems.splice(result?.destination?.index ?? 0, 0, reorderedItem);
        return newItems;
      });
    },
    [updateSectionsOrder],
  );

  return { onDragEnd };
};
