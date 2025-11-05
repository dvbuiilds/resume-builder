import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDragAndDrop } from '@/components/resume-builder/hooks/useDragAndDrop';
import type { DropResult } from '@hello-pangea/dnd';

describe('useDragAndDrop', () => {
  const initialSections: Array<
    'title' | 'socialHandles' | 'education' | 'workExperience'
  > = ['title', 'socialHandles', 'education', 'workExperience'];

  it('should return onDragEnd function', () => {
    const { result } = renderHook(() =>
      useDragAndDrop({
        sectionsOrder: initialSections,
        updateSectionsOrder: vi.fn(),
      }),
    );

    expect(typeof result.current.onDragEnd).toBe('function');
  });

  describe('onDragEnd', () => {
    it('should not update order when dropped at same position', () => {
      const updateSectionsOrder = vi.fn();
      const { result } = renderHook(() =>
        useDragAndDrop({
          sectionsOrder: initialSections,
          updateSectionsOrder,
        }),
      );

      const dropResult: DropResult = {
        source: { index: 1, droppableId: 'sections' },
        destination: { index: 1, droppableId: 'sections' },
        draggableId: 'socialHandles',
        type: 'SECTION',
        mode: 'FLUID',
        reason: 'DROP',
        combine: null,
      };

      act(() => {
        result.current.onDragEnd(dropResult);
      });

      expect(updateSectionsOrder).not.toHaveBeenCalled();
    });

    it('should not update order when no destination', () => {
      const updateSectionsOrder = vi.fn();
      const { result } = renderHook(() =>
        useDragAndDrop({
          sectionsOrder: initialSections,
          updateSectionsOrder,
        }),
      );

      const dropResult: DropResult = {
        source: { index: 1, droppableId: 'sections' },
        destination: null,
        draggableId: 'socialHandles',
        type: 'SECTION',
        mode: 'FLUID',
        reason: 'CANCEL',
        combine: null,
      };

      act(() => {
        result.current.onDragEnd(dropResult);
      });

      expect(updateSectionsOrder).not.toHaveBeenCalled();
    });

    it('should reorder sections when dragged to different position', () => {
      const updateSectionsOrder = vi.fn((updater) => {
        const newOrder = updater(initialSections);
        expect(newOrder).toEqual([
          'socialHandles',
          'title',
          'education',
          'workExperience',
        ]);
      });

      const { result } = renderHook(() =>
        useDragAndDrop({
          sectionsOrder: initialSections,
          updateSectionsOrder,
        }),
      );

      const dropResult: DropResult = {
        source: { index: 1, droppableId: 'sections' },
        destination: { index: 0, droppableId: 'sections' },
        draggableId: 'socialHandles',
        type: 'SECTION',
        mode: 'FLUID',
        reason: 'DROP',
        combine: null,
      };

      act(() => {
        result.current.onDragEnd(dropResult);
      });

      expect(updateSectionsOrder).toHaveBeenCalledTimes(1);
    });

    it('should move section from start to end', () => {
      const updateSectionsOrder = vi.fn((updater) => {
        const newOrder = updater(initialSections);
        expect(newOrder).toEqual([
          'socialHandles',
          'education',
          'workExperience',
          'title',
        ]);
      });

      const { result } = renderHook(() =>
        useDragAndDrop({
          sectionsOrder: initialSections,
          updateSectionsOrder,
        }),
      );

      const dropResult: DropResult = {
        source: { index: 0, droppableId: 'sections' },
        destination: { index: 3, droppableId: 'sections' },
        draggableId: 'title',
        type: 'SECTION',
        mode: 'FLUID',
        reason: 'DROP',
        combine: null,
      };

      act(() => {
        result.current.onDragEnd(dropResult);
      });

      expect(updateSectionsOrder).toHaveBeenCalledTimes(1);
    });

    it('should move section from end to start', () => {
      const updateSectionsOrder = vi.fn((updater) => {
        const newOrder = updater(initialSections);
        expect(newOrder).toEqual([
          'workExperience',
          'title',
          'socialHandles',
          'education',
        ]);
      });

      const { result } = renderHook(() =>
        useDragAndDrop({
          sectionsOrder: initialSections,
          updateSectionsOrder,
        }),
      );

      const dropResult: DropResult = {
        source: { index: 3, droppableId: 'sections' },
        destination: { index: 0, droppableId: 'sections' },
        draggableId: 'workExperience',
        type: 'SECTION',
        mode: 'FLUID',
        reason: 'DROP',
        combine: null,
      };

      act(() => {
        result.current.onDragEnd(dropResult);
      });

      expect(updateSectionsOrder).toHaveBeenCalledTimes(1);
    });

    it('should move section forward by one position', () => {
      const updateSectionsOrder = vi.fn((updater) => {
        const newOrder = updater(initialSections);
        expect(newOrder).toEqual([
          'title',
          'education',
          'socialHandles',
          'workExperience',
        ]);
      });

      const { result } = renderHook(() =>
        useDragAndDrop({
          sectionsOrder: initialSections,
          updateSectionsOrder,
        }),
      );

      const dropResult: DropResult = {
        source: { index: 1, droppableId: 'sections' },
        destination: { index: 2, droppableId: 'sections' },
        draggableId: 'socialHandles',
        type: 'SECTION',
        mode: 'FLUID',
        reason: 'DROP',
        combine: null,
      };

      act(() => {
        result.current.onDragEnd(dropResult);
      });

      expect(updateSectionsOrder).toHaveBeenCalledTimes(1);
    });

    it('should move section backward by one position', () => {
      const updateSectionsOrder = vi.fn((updater) => {
        const newOrder = updater(initialSections);
        expect(newOrder).toEqual([
          'title',
          'education',
          'socialHandles',
          'workExperience',
        ]);
      });

      const { result } = renderHook(() =>
        useDragAndDrop({
          sectionsOrder: initialSections,
          updateSectionsOrder,
        }),
      );

      const dropResult: DropResult = {
        source: { index: 2, droppableId: 'sections' },
        destination: { index: 1, droppableId: 'sections' },
        draggableId: 'education',
        type: 'SECTION',
        mode: 'FLUID',
        reason: 'DROP',
        combine: null,
      };

      act(() => {
        result.current.onDragEnd(dropResult);
      });

      expect(updateSectionsOrder).toHaveBeenCalledTimes(1);
    });

    it('should handle reordering with single section', () => {
      const singleSection: Array<'title'> = ['title'];
      const updateSectionsOrder = vi.fn();

      const { result } = renderHook(() =>
        useDragAndDrop({
          sectionsOrder: singleSection,
          updateSectionsOrder,
        }),
      );

      const dropResult: DropResult = {
        source: { index: 0, droppableId: 'sections' },
        destination: { index: 0, droppableId: 'sections' },
        draggableId: 'title',
        type: 'SECTION',
        mode: 'FLUID',
        reason: 'DROP',
        combine: null,
      };

      act(() => {
        result.current.onDragEnd(dropResult);
      });

      expect(updateSectionsOrder).not.toHaveBeenCalled();
    });

    it('should handle multiple reorderings', () => {
      let currentOrder = [...initialSections];
      const updateSectionsOrder = vi.fn((updater) => {
        currentOrder = updater(currentOrder);
      });

      const { result } = renderHook(() =>
        useDragAndDrop({
          sectionsOrder: currentOrder,
          updateSectionsOrder,
        }),
      );

      // First reorder: move index 1 to 0
      act(() => {
        result.current.onDragEnd({
          source: { index: 1, droppableId: 'sections' },
          destination: { index: 0, droppableId: 'sections' },
          draggableId: 'socialHandles',
          type: 'SECTION',
          mode: 'FLUID',
          reason: 'DROP',
          combine: null,
        });
      });

      expect(updateSectionsOrder).toHaveBeenCalledTimes(1);

      // Second reorder: move index 2 to 1
      act(() => {
        result.current.onDragEnd({
          source: { index: 2, droppableId: 'sections' },
          destination: { index: 1, droppableId: 'sections' },
          draggableId: 'education',
          type: 'SECTION',
          mode: 'FLUID',
          reason: 'DROP',
          combine: null,
        });
      });

      expect(updateSectionsOrder).toHaveBeenCalledTimes(2);
    });
  });
});
