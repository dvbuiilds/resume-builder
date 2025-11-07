import React from 'react';
import { FiChevronDown } from 'react-icons/fi';

interface AccordionContainerProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const AccordionContainer: React.FC<AccordionContainerProps> = ({
  title,
  isOpen,
  onToggle,
  children,
  icon,
}) => {
  return (
    <div className="rounded-lg mb-3 bg-[#FAFAFA] overflow-hidden">
      <div
        onClick={onToggle}
        className="relative flex justify-between items-center p-4 cursor-pointer hover:bg-[#F0F0F0] transition-colors duration-200"
      >
        <div className="flex items-center gap-4">
          {icon && <div className="flex-shrink-0 text-gray-600">{icon}</div>}
          <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        </div>
        <FiChevronDown
          className={`text-gray-600 flex-shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
          size={20}
        />
      </div>
      <div
        className="grid transition-all duration-300 ease-in-out"
        style={{
          gridTemplateRows: isOpen ? '1fr' : '0fr',
        }}
      >
        <div className="overflow-hidden min-h-0">
          <div className="p-4 pt-0">{children}</div>
        </div>
      </div>
    </div>
  );
};
