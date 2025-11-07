import React from 'react';
import { FaPlus } from 'react-icons/fa';

interface InputFieldProps extends React.ComponentProps<'input'> {}
export const InputField: React.FC<InputFieldProps> = ({
  value,
  onChange,
  onBlur,
  className,
  ...otherInputProps
}) => {
  return (
    <input
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      className={`w-full rounded-md text-xs p-2 font-light mt-1 ${className}`}
      {...otherInputProps}
    />
  );
};

export const ButtonWithCrossIcon: React.FC<{
  onClick: () => void;
  disabled?: boolean;
}> = ({ onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      className="text-gray-600 hover:text-gray-800 disabled:text-gray-300 disabled:cursor-not-allowed"
      disabled={disabled}
    >
      &times;
    </button>
  );
};

export const ButtonWithPlusIcon: React.FC<{
  label: string;
  onClick: () => void;
}> = ({ label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center text-blue-500 text-xs hover:text-blue-700"
    >
      <FaPlus className="mr-1" /> {label}
    </button>
  );
};

export const BlueButton: React.FC<{ label: string; onClick: () => void }> = ({
  label,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="px-4 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
    >
      {label}
    </button>
  );
};
