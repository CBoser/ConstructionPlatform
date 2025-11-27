import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { useToast } from '../common/Toast';
import {
  useCreatePlan,
  useUpdatePlan,
  type Plan,
  type PlanType,
  type CreatePlanInput,
  type UpdatePlanInput,
} from '../../services/planService';

interface PlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: Plan | null;
  onSuccess?: () => void;
}

interface FormData {
  code: string;
  name: string;
  type: PlanType | '';
  sqft: string;
  bedrooms: string;
  bathrooms: string;
  garage: string;
  style: string;
  pdssUrl: string;
  notes: string;
  isActive: boolean;
}

interface FormErrors {
  code?: string;
  name?: string;
  type?: string;
  sqft?: string;
  bedrooms?: string;
  bathrooms?: string;
}

const PLAN_TYPES: { value: PlanType; label: string }[] = [
  { value: 'SINGLE_STORY', label: 'Single Story' },
  { value: 'TWO_STORY', label: 'Two Story' },
  { value: 'THREE_STORY', label: 'Three Story' },
  { value: 'DUPLEX', label: 'Duplex' },
  { value: 'TOWNHOME', label: 'Townhome' },
];

const GARAGE_OPTIONS = [
  { value: '', label: 'No Garage' },
  { value: '1-Car', label: '1-Car Garage' },
  { value: '2-Car', label: '2-Car Garage' },
  { value: '3-Car', label: '3-Car Garage' },
  { value: '2-Car Tandem', label: '2-Car Tandem' },
  { value: '3-Car Tandem', label: '3-Car Tandem' },
  { value: 'Carport', label: 'Carport' },
];

const PlanFormModal: React.FC<PlanFormModalProps> = ({
  isOpen,
  onClose,
  plan,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();

  const [formData, setFormData] = useState<FormData>({
    code: '',
    name: '',
    type: '',
    sqft: '',
    bedrooms: '',
    bathrooms: '',
    garage: '',
    style: '',
    pdssUrl: '',
    notes: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Reset form when modal opens/closes or plan changes
  useEffect(() => {
    if (isOpen) {
      if (plan) {
        setFormData({
          code: plan.code,
          name: plan.name || '',
          type: plan.type,
          sqft: plan.sqft?.toString() || '',
          bedrooms: plan.bedrooms?.toString() || '',
          bathrooms: plan.bathrooms?.toString() || '',
          garage: plan.garage || '',
          style: plan.style || '',
          pdssUrl: plan.pdssUrl || '',
          notes: plan.notes || '',
          isActive: plan.isActive,
        });
      } else {
        setFormData({
          code: '',
          name: '',
          type: '',
          sqft: '',
          bedrooms: '',
          bathrooms: '',
          garage: '',
          style: '',
          pdssUrl: '',
          notes: '',
          isActive: true,
        });
      }
      setErrors({});
    }
  }, [isOpen, plan]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Plan code is required';
    } else if (formData.code.length > 50) {
      newErrors.code = 'Plan code must be 50 characters or less';
    }

    if (!formData.type) {
      newErrors.type = 'Plan type is required';
    }

    if (formData.sqft && (isNaN(Number(formData.sqft)) || Number(formData.sqft) < 0)) {
      newErrors.sqft = 'Square footage must be a positive number';
    }

    if (formData.bedrooms && (isNaN(Number(formData.bedrooms)) || Number(formData.bedrooms) < 0)) {
      newErrors.bedrooms = 'Bedrooms must be a positive number';
    }

    if (formData.bathrooms && (isNaN(Number(formData.bathrooms)) || Number(formData.bathrooms) < 0)) {
      newErrors.bathrooms = 'Bathrooms must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      if (plan) {
        // Update existing plan
        const updateData: UpdatePlanInput = {
          code: formData.code,
          name: formData.name || undefined,
          type: formData.type as PlanType,
          sqft: formData.sqft ? Number(formData.sqft) : undefined,
          bedrooms: formData.bedrooms ? Number(formData.bedrooms) : undefined,
          bathrooms: formData.bathrooms ? Number(formData.bathrooms) : undefined,
          garage: formData.garage || undefined,
          style: formData.style || undefined,
          pdssUrl: formData.pdssUrl || undefined,
          notes: formData.notes || undefined,
          isActive: formData.isActive,
        };

        await updatePlan.mutateAsync({
          id: plan.id,
          data: updateData,
        });

        showToast('Plan updated successfully', 'success');
      } else {
        // Create new plan
        const createData: CreatePlanInput = {
          code: formData.code,
          name: formData.name || undefined,
          type: formData.type as PlanType,
          sqft: formData.sqft ? Number(formData.sqft) : undefined,
          bedrooms: formData.bedrooms ? Number(formData.bedrooms) : undefined,
          bathrooms: formData.bathrooms ? Number(formData.bathrooms) : undefined,
          garage: formData.garage || undefined,
          style: formData.style || undefined,
          pdssUrl: formData.pdssUrl || undefined,
          notes: formData.notes || undefined,
          isActive: formData.isActive,
        };

        await createPlan.mutateAsync(createData);

        showToast('Plan created successfully', 'success');
      }

      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      console.error('Error saving plan:', error);
      const apiError = error as { data?: { error?: string }; message?: string };
      const errorMessage =
        apiError?.data?.error || apiError?.message || 'Failed to save plan';
      showToast(errorMessage, 'error');
    }
  };

  const isLoading = createPlan.isPending || updatePlan.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={plan ? 'Edit Plan' : 'Add Plan'}
      size="lg"
      footer={
        <div className="modal-footer-actions">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isLoading}
          >
            {plan ? 'Save Changes' : 'Create Plan'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h4 className="form-section-title">Basic Information</h4>
          <div className="form-grid form-grid-2">
            <Input
              label="Plan Code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              error={errors.code}
              placeholder="e.g., 2150-A"
              required
              disabled={isLoading}
            />

            <Input
              label="Plan Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., The Evergreen"
              disabled={isLoading}
            />

            <Input
              label="Plan Type"
              name="type"
              inputType="select"
              value={formData.type}
              onChange={handleChange}
              error={errors.type}
              options={PLAN_TYPES}
              required
              disabled={isLoading}
            />

            <Input
              label="Style"
              name="style"
              value={formData.style}
              onChange={handleChange}
              placeholder="e.g., Modern, Traditional, Craftsman"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="form-section">
          <h4 className="form-section-title">Specifications</h4>
          <div className="form-grid form-grid-4">
            <Input
              label="Square Feet"
              name="sqft"
              value={formData.sqft}
              onChange={handleChange}
              error={errors.sqft}
              placeholder="e.g., 2150"
              inputMode="numeric"
              disabled={isLoading}
            />

            <Input
              label="Bedrooms"
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleChange}
              error={errors.bedrooms}
              placeholder="e.g., 4"
              inputMode="numeric"
              disabled={isLoading}
            />

            <Input
              label="Bathrooms"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleChange}
              error={errors.bathrooms}
              placeholder="e.g., 2.5"
              inputMode="decimal"
              disabled={isLoading}
            />

            <Input
              label="Garage"
              name="garage"
              inputType="select"
              value={formData.garage}
              onChange={handleChange}
              options={GARAGE_OPTIONS}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="form-section">
          <h4 className="form-section-title">Additional Details</h4>
          <div className="form-grid">
            <Input
              label="PDSS URL"
              name="pdssUrl"
              value={formData.pdssUrl}
              onChange={handleChange}
              placeholder="https://..."
              helperText="Link to plan documentation or drawings"
              disabled={isLoading}
            />

            <Input
              label="Notes"
              name="notes"
              inputType="textarea"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional information about this plan..."
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="form-section">
          <h4 className="form-section-title">Status</h4>
          <div className="form-checkbox">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                disabled={isLoading}
              />
              <span className="checkbox-text">Active Plan</span>
            </label>
            <span className="checkbox-helper">
              Inactive plans won't appear in job creation or selection lists
            </span>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default PlanFormModal;
