import React from 'react';
import { IoMdArrowBack } from 'react-icons/io';
import { useLayout } from '../../context/LayoutContext';

export const EditPanelToggleButton: React.FC = () => {
  const { openEditPanel } = useLayout();

  return (
    <button
      onClick={openEditPanel}
      className="fixed right-0 top-1/2 transform -translate-y-1/2 z-50 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-l-lg shadow-lg transition-all duration-300 ease-in-out flex items-center gap-2"
      aria-label="Open edit panel"
    >
      <IoMdArrowBack className="text-xl" />
      <span className="text-sm font-medium">Edit</span>
    </button>
  );
};
