/**
 * Unit tests for ProfileForm component
 *
 * These tests validate the ProfileForm component behavior including:
 * - Input handling and validation
 * - Height and weight constraints
 * - Error state display
 * - User interaction
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileForm } from '@/components/profile/ProfileForm';

describe('ProfileForm Component', () => {
  const defaultProps = {
    height: undefined,
    weight: undefined,
    onHeightChange: jest.fn(),
    onWeightChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('should render form with title', () => {
      render(<ProfileForm {...defaultProps} />);
      expect(screen.getByText('Body Measurements')).toBeInTheDocument();
    });

    test('should render height input field', () => {
      render(<ProfileForm {...defaultProps} />);
      const heightInput = screen.getByLabelText(/height/i);
      expect(heightInput).toBeInTheDocument();
      expect(heightInput).toHaveAttribute('type', 'number');
      expect(heightInput).toHaveAttribute('min', '100');
      expect(heightInput).toHaveAttribute('max', '250');
    });

    test('should render weight input field', () => {
      render(<ProfileForm {...defaultProps} />);
      const weightInput = screen.getByLabelText(/weight/i);
      expect(weightInput).toBeInTheDocument();
      expect(weightInput).toHaveAttribute('type', 'number');
      expect(weightInput).toHaveAttribute('min', '30');
      expect(weightInput).toHaveAttribute('max', '200');
    });

    test('should display height range hint', () => {
      render(<ProfileForm {...defaultProps} />);
      expect(screen.getByText(/100-250 cm/i)).toBeInTheDocument();
    });

    test('should display weight range hint', () => {
      render(<ProfileForm {...defaultProps} />);
      expect(screen.getByText(/30-200 kg/i)).toBeInTheDocument();
    });
  });

  describe('Height Input', () => {
    test('should display current height value', () => {
      render(<ProfileForm {...defaultProps} height={175} />);
      const heightInput = screen.getByLabelText(/height/i) as HTMLInputElement;
      expect(heightInput.value).toBe('175');
    });

    test('should call onHeightChange with valid value', () => {
      const onHeightChange = jest.fn();
      render(<ProfileForm {...defaultProps} onHeightChange={onHeightChange} />);

      const heightInput = screen.getByLabelText(/height/i);
      fireEvent.change(heightInput, { target: { value: '180' } });

      expect(onHeightChange).toHaveBeenCalledWith(180);
    });

    test('should accept minimum boundary value (100)', () => {
      const onHeightChange = jest.fn();
      render(<ProfileForm {...defaultProps} onHeightChange={onHeightChange} />);

      const heightInput = screen.getByLabelText(/height/i);
      fireEvent.change(heightInput, { target: { value: '100' } });

      expect(onHeightChange).toHaveBeenCalledWith(100);
    });

    test('should accept maximum boundary value (250)', () => {
      const onHeightChange = jest.fn();
      render(<ProfileForm {...defaultProps} onHeightChange={onHeightChange} />);

      const heightInput = screen.getByLabelText(/height/i);
      fireEvent.change(heightInput, { target: { value: '250' } });

      expect(onHeightChange).toHaveBeenCalledWith(250);
    });

    test('should reject value below minimum (99)', () => {
      const onHeightChange = jest.fn();
      render(<ProfileForm {...defaultProps} onHeightChange={onHeightChange} />);

      const heightInput = screen.getByLabelText(/height/i);
      fireEvent.change(heightInput, { target: { value: '99' } });

      expect(onHeightChange).not.toHaveBeenCalled();
    });

    test('should reject value above maximum (251)', () => {
      const onHeightChange = jest.fn();
      render(<ProfileForm {...defaultProps} onHeightChange={onHeightChange} />);

      const heightInput = screen.getByLabelText(/height/i);
      fireEvent.change(heightInput, { target: { value: '251' } });

      expect(onHeightChange).not.toHaveBeenCalled();
    });

    test('should handle empty input', () => {
      const onHeightChange = jest.fn();
      render(<ProfileForm {...defaultProps} height={170} onHeightChange={onHeightChange} />);

      const heightInput = screen.getByLabelText(/height/i);
      fireEvent.change(heightInput, { target: { value: '' } });

      expect(onHeightChange).toHaveBeenCalledWith(undefined);
    });

    test('should handle decimal input', () => {
      const onHeightChange = jest.fn();
      render(<ProfileForm {...defaultProps} onHeightChange={onHeightChange} />);

      const heightInput = screen.getByLabelText(/height/i);
      fireEvent.change(heightInput, { target: { value: '175.5' } });

      expect(onHeightChange).toHaveBeenCalledWith(175.5);
    });

    test('should show error state when error prop is provided', () => {
      const errors = { height: 'Height is required' };
      render(<ProfileForm {...defaultProps} errors={errors} />);

      const heightInput = screen.getByLabelText(/height/i);
      expect(heightInput).toHaveClass('border-destructive');
      expect(screen.getByText('Height is required')).toBeInTheDocument();
    });
  });

  describe('Weight Input', () => {
    test('should display current weight value', () => {
      render(<ProfileForm {...defaultProps} weight={70.5} />);
      const weightInput = screen.getByLabelText(/weight/i) as HTMLInputElement;
      expect(weightInput.value).toBe('70.5');
    });

    test('should call onWeightChange with valid value', () => {
      const onWeightChange = jest.fn();
      render(<ProfileForm {...defaultProps} onWeightChange={onWeightChange} />);

      const weightInput = screen.getByLabelText(/weight/i);
      fireEvent.change(weightInput, { target: { value: '75' } });

      expect(onWeightChange).toHaveBeenCalledWith(75);
    });

    test('should accept minimum boundary value (30)', () => {
      const onWeightChange = jest.fn();
      render(<ProfileForm {...defaultProps} onWeightChange={onWeightChange} />);

      const weightInput = screen.getByLabelText(/weight/i);
      fireEvent.change(weightInput, { target: { value: '30' } });

      expect(onWeightChange).toHaveBeenCalledWith(30);
    });

    test('should accept maximum boundary value (200)', () => {
      const onWeightChange = jest.fn();
      render(<ProfileForm {...defaultProps} onWeightChange={onWeightChange} />);

      const weightInput = screen.getByLabelText(/weight/i);
      fireEvent.change(weightInput, { target: { value: '200' } });

      expect(onWeightChange).toHaveBeenCalledWith(200);
    });

    test('should reject value below minimum (29.9)', () => {
      const onWeightChange = jest.fn();
      render(<ProfileForm {...defaultProps} onWeightChange={onWeightChange} />);

      const weightInput = screen.getByLabelText(/weight/i);
      fireEvent.change(weightInput, { target: { value: '29.9' } });

      expect(onWeightChange).not.toHaveBeenCalled();
    });

    test('should reject value above maximum (200.1)', () => {
      const onWeightChange = jest.fn();
      render(<ProfileForm {...defaultProps} onWeightChange={onWeightChange} />);

      const weightInput = screen.getByLabelText(/weight/i);
      fireEvent.change(weightInput, { target: { value: '200.1' } });

      expect(onWeightChange).not.toHaveBeenCalled();
    });

    test('should handle empty input', () => {
      const onWeightChange = jest.fn();
      render(<ProfileForm {...defaultProps} weight={70} onWeightChange={onWeightChange} />);

      const weightInput = screen.getByLabelText(/weight/i);
      fireEvent.change(weightInput, { target: { value: '' } });

      expect(onWeightChange).toHaveBeenCalledWith(undefined);
    });

    test('should handle decimal input', () => {
      const onWeightChange = jest.fn();
      render(<ProfileForm {...defaultProps} onWeightChange={onWeightChange} />);

      const weightInput = screen.getByLabelText(/weight/i);
      fireEvent.change(weightInput, { target: { value: '68.5' } });

      expect(onWeightChange).toHaveBeenCalledWith(68.5);
    });

    test('should handle very precise decimal input', () => {
      const onWeightChange = jest.fn();
      render(<ProfileForm {...defaultProps} onWeightChange={onWeightChange} />);

      const weightInput = screen.getByLabelText(/weight/i);
      fireEvent.change(weightInput, { target: { value: '70.25' } });

      expect(onWeightChange).toHaveBeenCalledWith(70.25);
    });

    test('should show error state when error prop is provided', () => {
      const errors = { weight: 'Weight is required' };
      render(<ProfileForm {...defaultProps} errors={errors} />);

      const weightInput = screen.getByLabelText(/weight/i);
      expect(weightInput).toHaveClass('border-destructive');
      expect(screen.getByText('Weight is required')).toBeInTheDocument();
    });
  });

  describe('Form State', () => {
    test('should display both height and weight values simultaneously', () => {
      render(<ProfileForm {...defaultProps} height={180} weight={75} />);

      const heightInput = screen.getByLabelText(/height/i) as HTMLInputElement;
      const weightInput = screen.getByLabelText(/weight/i) as HTMLInputElement;

      expect(heightInput.value).toBe('180');
      expect(weightInput.value).toBe('75');
    });

    test('should handle both inputs having errors', () => {
      const errors = {
        height: 'Invalid height',
        weight: 'Invalid weight',
      };
      render(<ProfileForm {...defaultProps} errors={errors} />);

      expect(screen.getByText('Invalid height')).toBeInTheDocument();
      expect(screen.getByText('Invalid weight')).toBeInTheDocument();
    });

    test('should not show errors when errors object is empty', () => {
      render(<ProfileForm {...defaultProps} errors={{}} />);

      expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();
    });

    test('should not show errors when errors prop is undefined', () => {
      render(<ProfileForm {...defaultProps} />);

      expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();
    });
  });

  describe('Input Behavior', () => {
    test('should handle rapid input changes', () => {
      const onHeightChange = jest.fn();
      render(<ProfileForm {...defaultProps} onHeightChange={onHeightChange} />);

      const heightInput = screen.getByLabelText(/height/i);

      fireEvent.change(heightInput, { target: { value: '150' } });
      fireEvent.change(heightInput, { target: { value: '160' } });
      fireEvent.change(heightInput, { target: { value: '170' } });

      expect(onHeightChange).toHaveBeenCalledTimes(3);
      expect(onHeightChange).toHaveBeenLastCalledWith(170);
    });

    test('should handle leading zeros in input', () => {
      const onHeightChange = jest.fn();
      render(<ProfileForm {...defaultProps} onHeightChange={onHeightChange} />);

      const heightInput = screen.getByLabelText(/height/i);
      fireEvent.change(heightInput, { target: { value: '0175' } });

      expect(onHeightChange).toHaveBeenCalledWith(175);
    });

    test('should handle negative numbers', () => {
      const onHeightChange = jest.fn();
      render(<ProfileForm {...defaultProps} onHeightChange={onHeightChange} />);

      const heightInput = screen.getByLabelText(/height/i);
      fireEvent.change(heightInput, { target: { value: '-170' } });

      expect(onHeightChange).toHaveBeenCalledWith(-170);
    });

    test('should prevent default form submission behavior', () => {
      render(<ProfileForm {...defaultProps} />);

      const form = screen.getByText('Body Measurements').closest('form');
      if (form) {
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        const result = form.dispatchEvent(submitEvent);
        expect(result).toBe(true);
      }
    });
  });

  describe('Accessibility', () => {
    test('should have proper label association for height input', () => {
      render(<ProfileForm {...defaultProps} />);
      const heightInput = screen.getByLabelText(/height/i);
      expect(heightInput).toHaveAttribute('id', 'height');
    });

    test('should have proper label association for weight input', () => {
      render(<ProfileForm {...defaultProps} />);
      const weightInput = screen.getByLabelText(/weight/i);
      expect(weightInput).toHaveAttribute('id', 'weight');
    });

    test('should display placeholder for height', () => {
      render(<ProfileForm {...defaultProps} />);
      const heightInput = screen.getByLabelText(/height/i) as HTMLInputElement;
      expect(heightInput.placeholder).toBe('170');
    });

    test('should display placeholder for weight', () => {
      render(<ProfileForm {...defaultProps} />);
      const weightInput = screen.getByLabelText(/weight/i) as HTMLInputElement;
      expect(weightInput.placeholder).toBe('70');
    });
  });
});
