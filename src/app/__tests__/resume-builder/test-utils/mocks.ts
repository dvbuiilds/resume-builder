import { vi } from 'vitest';

// Mock @react-pdf/renderer
export const mockPdfBlob = new Blob(['mock pdf content'], {
  type: 'application/pdf',
});

export const mockPdf = vi.fn(() => ({
  toBlob: vi.fn().mockResolvedValue(mockPdfBlob),
}));

vi.mock('@react-pdf/renderer', () => ({
  pdf: mockPdf,
  Document: vi.fn(({ children }) => children),
  Page: vi.fn(({ children }) => children),
  Text: vi.fn(({ children }) => children),
  View: vi.fn(({ children }) => children),
  StyleSheet: {
    create: vi.fn((styles) => styles),
  },
  Font: {
    register: vi.fn(),
  },
}));

// Mock @hello-pangea/dnd
export const mockDnd = {
  DragDropContext: vi.fn(({ children }) => children),
  Droppable: vi.fn(({ children }) =>
    children({ innerRef: vi.fn(), droppableProps: {} }, {}),
  ),
  Draggable: vi.fn(({ children }) =>
    children(
      { innerRef: vi.fn(), draggableProps: {}, dragHandleProps: {} },
      {},
    ),
  ),
};

vi.mock('@hello-pangea/dnd', () => mockDnd);

// Mock DOM methods for PDF download
export const mockCreateElement = vi.fn();
export const mockAppendChild = vi.fn();
export const mockRemoveChild = vi.fn();
export const mockClick = vi.fn();
export const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
export const mockRevokeObjectURL = vi.fn();

export const setupDOM = () => {
  global.document.createElement = mockCreateElement;
  global.document.body.appendChild = mockAppendChild;
  global.document.body.removeChild = mockRemoveChild;
  global.URL.createObjectURL = mockCreateObjectURL;
  global.URL.revokeObjectURL = mockRevokeObjectURL;

  mockCreateElement.mockReturnValue({
    href: '',
    download: '',
    click: mockClick,
  });
};

export const cleanupDOM = () => {
  mockCreateElement.mockClear();
  mockAppendChild.mockClear();
  mockRemoveChild.mockClear();
  mockClick.mockClear();
  mockCreateObjectURL.mockClear();
  mockRevokeObjectURL.mockClear();
};

export const resetPdfMock = () => {
  mockPdf.mockReset();
  mockPdf.mockReturnValue({
    toBlob: vi.fn().mockResolvedValue(mockPdfBlob),
  });
};
