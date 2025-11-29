import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ResumeDataProvider } from '@resume-builder/components/resume-builder/context/ResumeDataContext';
import { LayoutProvider } from '@resume-builder/components/resume-builder/context/LayoutContext';
import { ResumeThemeProvider } from '@resume-builder/components/resume-builder/context/ResumeThemeContext';
import { AISuggestionUsageProvider } from '@resume-builder/components/resume-builder/context/AISuggestionUsageContext';

interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({ children }) => {
  return (
    <AISuggestionUsageProvider>
      <ResumeThemeProvider>
        <LayoutProvider>
          <ResumeDataProvider>{children}</ResumeDataProvider>
        </LayoutProvider>
      </ResumeThemeProvider>
    </AISuggestionUsageProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
