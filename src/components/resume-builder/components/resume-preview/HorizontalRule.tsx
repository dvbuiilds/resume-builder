import React from 'react';
import { ThemeColorValues } from '../../types/theme';

export const HorizontalRule = ({ color }: { color: ThemeColorValues }) => {
  return <hr className="w-full mb-1" style={{ borderColor: color }} />;
};
