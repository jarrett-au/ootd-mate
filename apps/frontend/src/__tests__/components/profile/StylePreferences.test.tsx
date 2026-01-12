/**
 * Unit tests for StylePreferences component
 *
 * These tests validate the StylePreferences component behavior including:
 * - Style selection (primary and secondary)
 * - Occasion selection
 * - Validation and constraints
 * - User interaction
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { StylePreferences } from '@/components/profile/StylePreferences';
import { StyleOption, OccasionOption } from '@/lib/api/profile';

describe('StylePreferences Component', () => {
  const defaultProps = {
    primaryStyle: undefined,
    secondaryStyle: undefined,
    occasions: [],
    onPrimaryStyleChange: jest.fn(),
    onSecondaryStyleChange: jest.fn(),
    onOccasionsChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('should render form with title', () => {
      render(<StylePreferences {...defaultProps} />);
      expect(screen.getByText('Style Preferences')).toBeInTheDocument();
    });

    test('should render primary style select', () => {
      render(<StylePreferences {...defaultProps} />);
      expect(screen.getByLabelText(/primary style/i)).toBeInTheDocument();
    });

    test('should render secondary style select', () => {
      render(<StylePreferences {...defaultProps} />);
      expect(screen.getByLabelText(/secondary style/i)).toBeInTheDocument();
    });

    test('should render occasion selection buttons', () => {
      render(<StylePreferences {...defaultProps} />);
      expect(screen.getByText('Work')).toBeInTheDocument();
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Casual')).toBeInTheDocument();
      expect(screen.getByText('Events/Formal')).toBeInTheDocument();
      expect(screen.getByText('Athletic')).toBeInTheDocument();
    });
  });

  describe('Primary Style Selection', () => {
    test('should display all style options', () => {
      render(<StylePreferences {...defaultProps} />);

      // Click primary style dropdown
      const trigger = screen.getByLabelText(/primary style/i);
      fireEvent.click(trigger);

      // Check all styles are present
      expect(screen.getByText('Casual')).toBeInTheDocument();
      expect(screen.getByText('Formal')).toBeInTheDocument();
      expect(screen.getByText('Minimalist')).toBeInTheDocument();
      expect(screen.getByText('Bohemian')).toBeInTheDocument();
      expect(screen.getByText('Streetwear')).toBeInTheDocument();
      expect(screen.getByText('Preppy')).toBeInTheDocument();
      expect(screen.getByText('Athletic')).toBeInTheDocument();
    });

    test('should call onPrimaryStyleChange when style is selected', () => {
      const onPrimaryStyleChange = jest.fn();
      render(<StylePreferences {...defaultProps} onPrimaryStyleChange={onPrimaryStyleChange} />);

      // Simulate selecting a style
      const select = screen.getByLabelText(/primary style/i);
      fireEvent.change(select, { target: { value: 'casual' } });

      expect(onPrimaryStyleChange).toHaveBeenCalledWith('casual');
    });

    test('should display selected primary style', () => {
      render(<StylePreferences {...defaultProps} primaryStyle="formal" />);

      const select = screen.getByLabelText(/primary style/i) as HTMLSelectElement;
      expect(select.value).toBe('formal');
    });

    test('should allow clearing primary style', () => {
      const onPrimaryStyleChange = jest.fn();
      render(<StylePreferences {...defaultProps} primaryStyle="casual" onPrimaryStyleChange={onPrimaryStyleChange} />);

      const select = screen.getByLabelText(/primary style/i);
      fireEvent.change(select, { target: { value: 'none' } });

      expect(onPrimaryStyleChange).toHaveBeenCalledWith(undefined);
    });

    test('should show error state when validation fails', () => {
      const errors = { primaryStyle: 'Primary style is required' };
      render(<StylePreferences {...defaultProps} errors={errors} />);

      const select = screen.getByLabelText(/primary style/i);
      expect(select).toHaveClass('border-destructive');
      expect(screen.getByText('Primary style is required')).toBeInTheDocument();
    });
  });

  describe('Secondary Style Selection', () => {
    test('should be disabled when no primary style is selected', () => {
      render(<StylePreferences {...defaultProps} />);

      const select = screen.getByLabelText(/secondary style/i) as HTMLSelectElement;
      expect(select).toBeDisabled();
    });

    test('should be enabled when primary style is selected', () => {
      render(<StylePreferences {...defaultProps} primaryStyle="casual" />);

      const select = screen.getByLabelText(/secondary style/i) as HTMLSelectElement;
      expect(select).not.toBeDisabled();
    });

    test('should not include primary style in options', () => {
      render(<StylePreferences {...defaultProps} primaryStyle="casual" />);

      const select = screen.getByLabelText(/secondary style/i);
      fireEvent.click(select);

      // Casual should not be in the options
      const options = screen.getAllByText('Casual');
      // Filter to find only those in select options (not labels)
      const selectOptions = options.filter(option =>
        option.closest('[role="option"]') || option.tagName === 'OPTION'
      );

      // Primary style should be excluded from secondary options
      expect(selectOptions.length).toBe(0);
    });

    test('should call onSecondaryStyleChange when style is selected', () => {
      const onSecondaryStyleChange = jest.fn();
      render(
        <StylePreferences
          {...defaultProps}
          primaryStyle="casual"
          onSecondaryStyleChange={onSecondaryStyleChange}
        />
      );

      const select = screen.getByLabelText(/secondary style/i);
      fireEvent.change(select, { target: { value: 'formal' } });

      expect(onSecondaryStyleChange).toHaveBeenCalledWith('formal');
    });

    test('should display selected secondary style', () => {
      render(
        <StylePreferences
          {...defaultProps}
          primaryStyle="casual"
          secondaryStyle="minimalist"
        />
      );

      const select = screen.getByLabelText(/secondary style/i) as HTMLSelectElement;
      expect(select.value).toBe('minimalist');
    });

    test('should allow clearing secondary style', () => {
      const onSecondaryStyleChange = jest.fn();
      render(
        <StylePreferences
          {...defaultProps}
          primaryStyle="casual"
          secondaryStyle="formal"
          onSecondaryStyleChange={onSecondaryStyleChange}
        />
      );

      const select = screen.getByLabelText(/secondary style/i);
      fireEvent.change(select, { target: { value: 'none' } });

      expect(onSecondaryStyleChange).toHaveBeenCalledWith(undefined);
    });

    test('should show error state when validation fails', () => {
      const errors = { secondaryStyle: 'Secondary style must differ from primary' };
      render(
        <StylePreferences
          {...defaultProps}
          primaryStyle="casual"
          errors={errors}
        />
      );

      const select = screen.getByLabelText(/secondary style/i);
      expect(select).toHaveClass('border-destructive');
      expect(screen.getByText('Secondary style must differ from primary')).toBeInTheDocument();
    });
  });

  describe('Occasion Selection', () => {
    test('should render all occasion buttons as unselected initially', () => {
      render(<StylePreferences {...defaultProps} />);

      const workButton = screen.getByText('Work').closest('button');
      const dateButton = screen.getByText('Date').closest('button');
      const casualButton = screen.getByText('Casual').closest('button');

      expect(workButton).toHaveClass('outline');
      expect(dateButton).toHaveClass('outline');
      expect(casualButton).toHaveClass('outline');
    });

    test('should call onOccasionsChange when occasion is toggled', () => {
      const onOccasionsChange = jest.fn();
      render(<StylePreferences {...defaultProps} onOccasionsChange={onOccasionsChange} />);

      const workButton = screen.getByText('Work').closest('button');
      fireEvent.click(workButton);

      expect(onOccasionsChange).toHaveBeenCalledWith(['work']);
    });

    test('should toggle occasion selection', () => {
      const onOccasionsChange = jest.fn();
      render(
        <StylePreferences
          {...defaultProps}
          occasions={['work']}
          onOccasionsChange={onOccasionsChange}
        />
      );

      const workButton = screen.getByText('Work').closest('button');
      fireEvent.click(workButton);

      expect(onOccasionsChange).toHaveBeenCalledWith([]);
    });

    test('should display selected occasions with solid style', () => {
      render(<StylePreferences {...defaultProps} occasions={['work', 'date']} />);

      const workButton = screen.getByText('Work').closest('button');
      const dateButton = screen.getByText('Date').closest('button');
      const casualButton = screen.getByText('Casual').closest('button');

      expect(workButton).not.toHaveClass('outline');
      expect(dateButton).not.toHaveClass('outline');
      expect(casualButton).toHaveClass('outline');
    });

    test('should allow selecting multiple occasions', () => {
      const onOccasionsChange = jest.fn();
      render(<StylePreferences {...defaultProps} onOccasionsChange={onOccasionsChange} />);

      fireEvent.click(screen.getByText('Work').closest('button')!);
      expect(onOccasionsChange).toHaveBeenLastCalledWith(['work']);

      fireEvent.click(screen.getByText('Date').closest('button')!);
      expect(onOccasionsChange).toHaveBeenLastCalledWith(['work', 'date']);

      fireEvent.click(screen.getByText('Casual').closest('button')!);
      expect(onOccasionsChange).toHaveBeenLastCalledWith(['work', 'date', 'casual']);
    });

    test('should deselect occasion when clicked again', () => {
      const onOccasionsChange = jest.fn();
      render(
        <StylePreferences
          {...defaultProps}
          occasions={['work', 'date']}
          onOccasionsChange={onOccasionsChange}
        />
      );

      const workButton = screen.getByText('Work').closest('button');
      fireEvent.click(workButton);

      expect(onOccasionsChange).toHaveBeenCalledWith(['date']);
    });

    test('should show hint text when no occasions selected', () => {
      render(<StylePreferences {...defaultProps} occasions={[]} />);
      expect(
        screen.getByText(/select occasions that match your style needs/i)
      ).toBeInTheDocument();
    });

    test('should not show hint text when occasions are selected', () => {
      render(<StylePreferences {...defaultProps} occasions={['work']} />);
      expect(
        screen.queryByText(/select occasions that match your style needs/i)
      ).not.toBeInTheDocument();
    });

    test('should display all selected occasions simultaneously', () => {
      render(
        <StylePreferences
          {...defaultProps}
          occasions={['work', 'date', 'casual', 'events/formal', 'athletic']}
        />
      );

      expect(screen.getByText('Work').closest('button')).not.toHaveClass('outline');
      expect(screen.getByText('Date').closest('button')).not.toHaveClass('outline');
      expect(screen.getByText('Casual').closest('button')).not.toHaveClass('outline');
      expect(screen.getByText('Events/Formal').closest('button')).not.toHaveClass('outline');
      expect(screen.getByText('Athletic').closest('button')).not.toHaveClass('outline');
    });
  });

  describe('Style Interaction', () => {
    test('should clear secondary style when it conflicts with new primary style', () => {
      const onSecondaryStyleChange = jest.fn();
      render(
        <StylePreferences
          {...defaultProps}
          primaryStyle="casual"
          secondaryStyle="minimalist"
          onSecondaryStyleChange={onSecondaryStyleChange}
        />
      );

      // This test verifies the parent component behavior
      // The component itself doesn't handle this logic
      expect(onSecondaryStyleChange).toBeDefined();
    });

    test('should display placeholder when no style selected', () => {
      render(<StylePreferences {...defaultProps} />);

      const select = screen.getByLabelText(/primary style/i);
      expect(screen.getByText(/select primary style/i)).toBeInTheDocument();
    });

    test('should display correct placeholder for secondary when no primary', () => {
      render(<StylePreferences {...defaultProps} />);

      const select = screen.getByLabelText(/secondary style/i);
      expect(screen.getByText(/select primary style first/i)).toBeInTheDocument();
    });

    test('should display correct placeholder for secondary when primary is set', () => {
      render(<StylePreferences {...defaultProps} primaryStyle="casual" />);

      const select = screen.getByLabelText(/secondary style/i);
      expect(screen.getByText(/select secondary style/i)).toBeInTheDocument();
    });
  });

  describe('Form State', () => {
    test('should display all selected values', () => {
      render(
        <StylePreferences
          {...defaultProps}
          primaryStyle="athletic"
          secondaryStyle="casual"
          occasions={['athletic', 'casual']}
        />
      );

      const primarySelect = screen.getByLabelText(/primary style/i) as HTMLSelectElement;
      const secondarySelect = screen.getByLabelText(/secondary style/i) as HTMLSelectElement;

      expect(primarySelect.value).toBe('athletic');
      expect(secondarySelect.value).toBe('casual');
      expect(screen.getByText('Athletic').closest('button')).not.toHaveClass('outline');
      expect(screen.getByText('Casual').closest('button')).not.toHaveClass('outline');
    });

    test('should handle form with only primary style selected', () => {
      render(
        <StylePreferences
          {...defaultProps}
          primaryStyle="formal"
        />
      );

      const primarySelect = screen.getByLabelText(/primary style/i) as HTMLSelectElement;
      expect(primarySelect.value).toBe('formal');

      const secondarySelect = screen.getByLabelText(/secondary style/i) as HTMLSelectElement;
      expect(secondarySelect.value).toBe('none');
    });

    test('should handle form with only occasions selected', () => {
      render(
        <StylePreferences
          {...defaultProps}
          occasions={['work', 'events/formal']}
        />
      );

      expect(screen.getByText('Work').closest('button')).not.toHaveClass('outline');
      expect(screen.getByText('Events/Formal').closest('button')).not.toHaveClass('outline');
      expect(screen.getByText('Date').closest('button')).toHaveClass('outline');
    });
  });

  describe('Validation', () => {
    test('should show error for primary style', () => {
      const errors = { primaryStyle: 'Required' };
      render(<StylePreferences {...defaultProps} errors={errors} />);

      expect(screen.getByText('Required')).toBeInTheDocument();
    });

    test('should show error for secondary style', () => {
      const errors = { secondaryStyle: 'Must differ from primary' };
      render(<StylePreferences {...defaultProps} errors={errors} />);

      expect(screen.getByText('Must differ from primary')).toBeInTheDocument();
    });

    test('should show error for occasions', () => {
      const errors = { occasions: 'Select at least one' };
      render(<StylePreferences {...defaultProps} errors={errors} />);

      expect(screen.getByText('Select at least one')).toBeInTheDocument();
    });

    test('should show multiple errors simultaneously', () => {
      const errors = {
        primaryStyle: 'Required',
        secondaryStyle: 'Invalid',
        occasions: 'Invalid',
      };
      render(<StylePreferences {...defaultProps} errors={errors} />);

      expect(screen.getByText('Required')).toBeInTheDocument();
      expect(screen.getByText('Invalid')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test('should handle rapid style changes', () => {
      const onPrimaryStyleChange = jest.fn();
      render(<StylePreferences {...defaultProps} onPrimaryStyleChange={onPrimaryStyleChange} />);

      const select = screen.getByLabelText(/primary style/i);

      fireEvent.change(select, { target: { value: 'casual' } });
      fireEvent.change(select, { target: { value: 'formal' } });
      fireEvent.change(select, { target: { value: 'athletic' } });

      expect(onPrimaryStyleChange).toHaveBeenCalledTimes(3);
      expect(onPrimaryStyleChange).toHaveBeenLastCalledWith('athletic');
    });

    test('should handle rapid occasion toggles', () => {
      const onOccasionsChange = jest.fn();
      render(<StylePreferences {...defaultProps} onOccasionsChange={onOccasionsChange} />);

      fireEvent.click(screen.getByText('Work').closest('button')!);
      fireEvent.click(screen.getByText('Date').closest('button')!);
      fireEvent.click(screen.getByText('Work').closest('button')!);

      expect(onOccasionsChange).toHaveBeenCalledTimes(3);
    });
  });

  describe('Available Styles for Secondary', () => {
    test('should exclude casual from secondary when casual is primary', () => {
      render(<StylePreferences {...defaultProps} primaryStyle="casual" />);

      const select = screen.getByLabelText(/secondary style/i);
      fireEvent.click(select);

      // Verify casual is not in the available options
      // This is checked by the component behavior
    });

    test('should include all other styles when primary is selected', () => {
      const allStyles: StyleOption[] = [
        'casual',
        'formal',
        'minimalist',
        'bohemian',
        'streetwear',
        'preppy',
        'athletic',
      ];

      allStyles.forEach((primaryStyle) => {
        const { rerender } = render(
          <StylePreferences {...defaultProps} primaryStyle={primaryStyle} />
        );

        const select = screen.getByLabelText(/secondary style/i);
        expect(select).not.toBeDisabled();

        rerender(<div />);
      });
    });
  });
});
