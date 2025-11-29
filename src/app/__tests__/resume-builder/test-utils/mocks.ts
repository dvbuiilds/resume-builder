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
export const mockContains = vi.fn<(node: Node | null) => boolean>();

export const setupDOM = () => {
  // Create a proper mock element that can be used with contains()
  const mockLinkElement = {
    href: '',
    download: '',
    click: mockClick,
    nodeType: 1, // ELEMENT_NODE
    parentNode: null as Node | null,
  } as any;

  // Store reference to the created element
  let createdElement: any = null;

  global.document.createElement = mockCreateElement;
  global.document.body.appendChild = mockAppendChild;
  global.document.body.removeChild = mockRemoveChild;
  global.URL.createObjectURL = mockCreateObjectURL;
  global.URL.revokeObjectURL = mockRevokeObjectURL;

  // Mock contains to return true when element was appended
  const originalContains = global.document.body.contains;
  mockContains.mockImplementation((node: Node | null) => {
    if (node === createdElement || node === mockLinkElement) return true;
    if (originalContains && typeof originalContains === 'function') {
      try {
        return originalContains.call(global.document.body, node);
      } catch {
        return false;
      }
    }
    return false;
  });
  global.document.body.contains =
    mockContains as typeof global.document.body.contains;

  mockCreateElement.mockImplementation((tagName: string) => {
    if (tagName === 'a') {
      createdElement = { ...mockLinkElement };
      return createdElement;
    }
    return document.createElement(tagName);
  });

  mockAppendChild.mockImplementation((child: Node) => {
    createdElement = child;
    if (child && typeof child === 'object') {
      (child as any).parentNode = global.document.body;
    }
    return child;
  });
};

export const cleanupDOM = () => {
  mockCreateElement.mockClear();
  mockAppendChild.mockClear();
  mockRemoveChild.mockClear();
  mockClick.mockClear();
  mockCreateObjectURL.mockClear();
  mockRevokeObjectURL.mockClear();
  mockContains.mockClear();
};

export const resetPdfMock = () => {
  mockPdf.mockReset();
  mockPdf.mockReturnValue({
    toBlob: vi.fn().mockResolvedValue(mockPdfBlob),
  });
};
