import {
  type FC,
  type ComponentProps,
  type FocusEventHandler,
  type ChangeEventHandler,
  type TextareaHTMLAttributes,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { createPortal } from 'react-dom';
import { MdOutlineAutoAwesome } from 'react-icons/md';
import { useAISuggestionUsageContext } from '../../context/AISuggestionUsageContext';

interface InputFieldV2Props
  extends Omit<ComponentProps<'input'>, 'onChange' | 'onBlur'> {
  isDescriptionField?: boolean;
  onChange?:
    | ChangeEventHandler<HTMLInputElement>
    | ChangeEventHandler<HTMLTextAreaElement>;
  onBlur?: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onApplySuggestion?: (suggestion: string) => void;
  contextData?: { jobRole?: string; companyName?: string };
}

export const InputFieldV2: FC<InputFieldV2Props> = ({
  value,
  onChange,
  onBlur,
  className,
  isDescriptionField = false,
  onApplySuggestion,
  contextData,
  ...otherInputProps
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState<{
    top: number;
    left: number;
    placement: 'top' | 'bottom';
  } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const { usageCount, refetch } = useAISuggestionUsageContext();

  const baseClassName = 'w-full rounded-md text-xs p-2 font-light';

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate popover position for desktop
  const updatePopoverPosition = useCallback(() => {
    if (!textareaRef.current || isMobile) {
      setPopoverPosition(null);
      return;
    }

    const rect = textareaRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    const gap = 8;
    const popoverWidth = 400;
    const popoverHeight = 500; // max height
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Try to position to the right
    let left = rect.right + scrollX + gap;
    let top = rect.top + scrollY;
    let placement: 'top' | 'bottom' = 'bottom';

    // Check if there's enough space below
    const spaceBelow = viewportHeight - (rect.bottom - scrollY);
    const spaceAbove = rect.top - scrollY;

    // If not enough space below but enough space above, position on top
    if (spaceBelow < popoverHeight && spaceAbove >= popoverHeight) {
      placement = 'top';
      top = rect.top + scrollY - popoverHeight;
    } else if (spaceBelow < popoverHeight && spaceAbove < popoverHeight) {
      // Not enough space on either side, use the side with more space
      if (spaceAbove > spaceBelow) {
        placement = 'top';
        top = scrollY + 8; // Position at top of viewport with small gap
      } else {
        placement = 'bottom';
        top = rect.bottom + scrollY + gap;
      }
    } else {
      // Default: position below
      top = rect.bottom + scrollY + gap;
    }

    // If no space on right, position to the left
    if (left + popoverWidth > viewportWidth + scrollX) {
      left = rect.left + scrollX - popoverWidth - gap;
    }

    // Ensure popover doesn't go off-screen horizontally
    if (left < scrollX) {
      left = scrollX + 8;
    }

    // Ensure popover doesn't go off-screen vertically
    if (placement === 'top' && top < scrollY) {
      top = scrollY + 8;
    }
    if (
      placement === 'bottom' &&
      top + popoverHeight > scrollY + viewportHeight
    ) {
      top = scrollY + viewportHeight - popoverHeight - 8;
    }

    setPopoverPosition({ top, left, placement });
  }, [isMobile]);

  useEffect(() => {
    if (isPopoverOpen && !isMobile) {
      updatePopoverPosition();
      const handleScroll = () => updatePopoverPosition();
      const handleResize = () => updatePopoverPosition();
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isPopoverOpen, isMobile, updatePopoverPosition]);

  const handleAIClick = () => {
    if (usageCount >= 10) return;
    setIsPopoverOpen(true);
    setError(null);
    setSuggestions([]);
    setSelectedSuggestion(null);
  };

  const handleClosePopover = () => {
    setIsPopoverOpen(false);
    setError(null);
    setSuggestions([]);
    setSelectedSuggestion(null);
  };

  const handleSuggest = async () => {
    const description = String(value || '').trim();
    if (!description || usageCount >= 10) return;

    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    setSelectedSuggestion(null);

    try {
      const response = await fetch('/api/ai-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          jobRole: contextData?.jobRole,
          companyName: contextData?.companyName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate suggestions');
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
      // Update usage count in shared context
      await refetch();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to generate suggestions',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (
      selectedSuggestion !== null &&
      suggestions[selectedSuggestion] &&
      onApplySuggestion
    ) {
      onApplySuggestion(suggestions[selectedSuggestion]);
      handleClosePopover();
    }
  };

  // Handle click outside for desktop
  useEffect(() => {
    if (!isPopoverOpen || isMobile) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(event.target as Node)
      ) {
        handleClosePopover();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPopoverOpen, isMobile]);

  const isAIDisabled = usageCount >= 10;
  const isSuggestDisabled =
    !value || String(value).trim().length === 0 || usageCount >= 10;
  const isApplyDisabled = selectedSuggestion === null;

  const renderPopover = () => {
    if (!isPopoverOpen) return null;

    const popoverContent = (
      <div
        ref={popoverRef}
        className={`bg-white shadow-lg rounded-lg border border-gray-200 z-50 ${
          isMobile
            ? 'fixed bottom-0 left-0 right-0 max-h-[80vh] rounded-t-lg animate-slide-up'
            : 'fixed w-[400px] max-h-[500px] overflow-y-auto'
        }`}
        style={
          !isMobile && popoverPosition
            ? {
                top: `${popoverPosition.top}px`,
                left: `${popoverPosition.left}px`,
                transform:
                  popoverPosition.placement === 'top'
                    ? 'translateY(-100%)'
                    : undefined,
              }
            : undefined
        }
      >
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MdOutlineAutoAwesome className="text-blue-500" size={20} />
              <h3 className="text-sm font-medium text-gray-900">
                AI Suggestions
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{usageCount}/10</span>
              <button
                onClick={handleClosePopover}
                className="text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>
          </div>

          {/* Suggest Button */}
          <button
            onClick={handleSuggest}
            disabled={isSuggestDisabled || isLoading}
            className="w-full px-4 py-2 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <MdOutlineAutoAwesome size={16} />
                Suggest with AI
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Suggestions List */}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-700">
                Select a suggestion:
              </p>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <label
                    key={index}
                    className={`flex items-start gap-2 p-3 border rounded cursor-pointer transition ${
                      selectedSuggestion === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="suggestion"
                      checked={selectedSuggestion === index}
                      onChange={() => setSelectedSuggestion(index)}
                      className="mt-1"
                    />
                    <span className="text-xs text-gray-700 flex-1">
                      {suggestion}
                    </span>
                  </label>
                ))}
              </div>
              <button
                onClick={handleApply}
                disabled={isApplyDisabled}
                className="w-full px-4 py-2 bg-green-500 text-white text-xs rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Apply Selected
              </button>
            </div>
          )}
        </div>
      </div>
    );

    // Mobile backdrop
    if (isMobile) {
      return createPortal(
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={handleClosePopover}
          />
          {popoverContent}
        </>,
        document.body,
      );
    }

    return createPortal(popoverContent, document.body);
  };

  if (isDescriptionField) {
    return (
      <div className="relative flex-1 w-full">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={onChange as ChangeEventHandler<HTMLTextAreaElement>}
          onBlur={onBlur}
          className={`${baseClassName} resize-none pr-8 scrollbar-hide ${className || ''}`}
          style={{ minHeight: '48px' }}
          {...(otherInputProps as Omit<
            TextareaHTMLAttributes<HTMLTextAreaElement>,
            'onChange' | 'onBlur'
          >)}
        />
        {isDescriptionField && (
          <button
            type="button"
            onClick={handleAIClick}
            disabled={isAIDisabled}
            className={`absolute top-2 right-2 p-1 rounded transition ${
              isAIDisabled
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-blue-500 hover:text-blue-700 hover:bg-blue-50'
            }`}
            title={
              isAIDisabled
                ? 'AI suggestions limit reached (10/10)'
                : 'Get AI suggestions'
            }
          >
            <MdOutlineAutoAwesome size={18} />
          </button>
        )}
        {renderPopover()}
      </div>
    );
  }

  return (
    <input
      value={value}
      onChange={onChange as ChangeEventHandler<HTMLInputElement>}
      onBlur={onBlur}
      className={`${baseClassName} ${className || ''}`}
      {...otherInputProps}
    />
  );
};
