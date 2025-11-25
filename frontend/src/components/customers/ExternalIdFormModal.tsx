import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { useToast } from '../common/Toast';
import {
  useCreateExternalId,
  useUpdateExternalId,
} from '../../services/customerService';
import type {
  CustomerExternalId,
  CreateCustomerExternalIdInput,
  UpdateCustomerExternalIdInput,
} from '../../../../shared/types/customer';

interface ExternalIdFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  externalId?: CustomerExternalId | null;
  existingMappings?: CustomerExternalId[];
  onSuccess?: () => void;
}

interface FormData {
  externalSystem: string;
  externalCustomerId: string;
  externalCustomerName: string;
  isPrimary: boolean;
}

interface FormErrors {
  externalSystem?: string;
  externalCustomerId?: string;
}

const EXTERNAL_SYSTEMS = [
  { value: 'SALES_1440', label: 'Sales 1440', example: 'e.g., CUST-001' },
  {
    value: 'HYPHEN_BUILDPRO',
    label: 'Hyphen BuildPro',
    example: 'e.g., RICH-001',
  },
  {
    value: 'HOLT_BUILDER_PORTAL',
    label: 'Holt Builder Portal',
    example: 'e.g., HOLT-RICHMOND',
  },
  { value: 'OTHER', label: 'Other', example: 'e.g., EXT-12345' },
];

const ExternalIdFormModal: React.FC<ExternalIdFormModalProps> = ({
  isOpen,
  onClose,
  customerId,
  externalId,
  existingMappings = [],
  onSuccess,
}) => {
  const { showToast } = useToast();
  const createExternalId = useCreateExternalId();
  const updateExternalId = useUpdateExternalId();

  const [formData, setFormData] = useState<FormData>({
    externalSystem: '',
    externalCustomerId: '',
    externalCustomerName: '',
    isPrimary: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPrimaryWarning, setShowPrimaryWarning] = useState(false);

  // Reset form when modal opens/closes or externalId changes
  useEffect(() => {
    if (isOpen) {
      if (externalId) {
        setFormData({
          externalSystem: externalId.externalSystem,
          externalCustomerId: externalId.externalCustomerId,
          externalCustomerName: externalId.externalCustomerName || '',
          isPrimary: externalId.isPrimary,
        });
      } else {
        setFormData({
          externalSystem: '',
          externalCustomerId: '',
          externalCustomerName: '',
          isPrimary: false,
        });
      }
      setErrors({});
      setShowPrimaryWarning(false);
    }
  }, [isOpen, externalId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;

      // Show warning if changing to primary and there's already a primary
      if (name === 'isPrimary' && checked) {
        const hasPrimaryForSystem = existingMappings.some(
          (mapping) =>
            mapping.externalSystem === formData.externalSystem &&
            mapping.isPrimary &&
            mapping.id !== externalId?.id
        );
        setShowPrimaryWarning(hasPrimaryForSystem);
      } else if (name === 'isPrimary' && !checked) {
        setShowPrimaryWarning(false);
      }

      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Reset primary warning when system changes
      if (name === 'externalSystem') {
        setShowPrimaryWarning(false);
        setFormData((prev) => ({
          ...prev,
          isPrimary: false,
        }));
      }
    }

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

    if (!formData.externalSystem) {
      newErrors.externalSystem = 'External system is required';
    }

    if (!formData.externalCustomerId.trim()) {
      newErrors.externalCustomerId = 'External customer ID is required';
    } else if (formData.externalCustomerId.length > 255) {
      newErrors.externalCustomerId =
        'External customer ID must be 255 characters or less';
    }

    // Check for duplicates (same system for this customer)
    if (!externalId) {
      // Creating new mapping
      const duplicate = existingMappings.some(
        (mapping) => mapping.externalSystem === formData.externalSystem
      );
      if (duplicate) {
        newErrors.externalSystem =
          'A mapping for this system already exists. Please edit the existing mapping instead.';
      }
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
      if (externalId) {
        // Update existing mapping
        const updateData: UpdateCustomerExternalIdInput = {
          externalCustomerId: formData.externalCustomerId,
          externalCustomerName: formData.externalCustomerName || undefined,
          isPrimary: formData.isPrimary,
        };

        await updateExternalId.mutateAsync({
          customerId,
          externalIdId: externalId.id,
          data: updateData,
        });

        showToast('External ID mapping updated successfully', 'success');
      } else {
        // Create new mapping
        const createData: Omit<CreateCustomerExternalIdInput, 'customerId'> = {
          externalSystem: formData.externalSystem,
          externalCustomerId: formData.externalCustomerId,
          externalCustomerName: formData.externalCustomerName || undefined,
          isPrimary: formData.isPrimary,
        };

        await createExternalId.mutateAsync({
          customerId,
          data: createData,
        });

        showToast('External ID mapping added successfully', 'success');
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error saving external ID mapping:', error);
      const errorMessage =
        error.data?.error || error.message || 'Failed to save external ID mapping';
      showToast(errorMessage, 'error');
    }
  };

  const isLoading = createExternalId.isPending || updateExternalId.isPending;

  const selectedSystem = EXTERNAL_SYSTEMS.find(
    (sys) => sys.value === formData.externalSystem
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={externalId ? 'Edit External ID Mapping' : 'Add External ID Mapping'}
      size="md"
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
            {externalId ? 'Save Changes' : 'Add Mapping'}
          </Button>
        </div>
      }
    >
      <div className="external-id-info">
        <p className="text-gray-600">
          External ID mappings allow you to link this customer to records in other systems
          for bidirectional synchronization. Each customer can have one mapping per system.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <Input
            label="External System"
            name="externalSystem"
            inputType="select"
            value={formData.externalSystem}
            onChange={handleChange}
            error={errors.externalSystem}
            options={EXTERNAL_SYSTEMS.map((sys) => ({
              value: sys.value,
              label: sys.label,
            }))}
            required
            disabled={isLoading || !!externalId} // Can't change system on edit
            helperText={
              externalId ? 'System cannot be changed after creation' : undefined
            }
          />

          <Input
            label="External Customer ID"
            name="externalCustomerId"
            value={formData.externalCustomerId}
            onChange={handleChange}
            error={errors.externalCustomerId}
            placeholder={selectedSystem?.example || 'e.g., CUST-001'}
            required
            disabled={isLoading}
            helperText="The unique identifier used in the external system"
          />

          <Input
            label="External Customer Name"
            name="externalCustomerName"
            value={formData.externalCustomerName}
            onChange={handleChange}
            placeholder="e.g., Richmond American Homes"
            disabled={isLoading}
            helperText="Optional - the customer's name in the external system"
          />

          <div className="input-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isPrimary"
                checked={formData.isPrimary}
                onChange={handleChange}
                disabled={isLoading}
              />
              <span>Primary Mapping</span>
            </label>
            <div className="input-helper-text">
              Mark this as the primary mapping for this system
            </div>
            {showPrimaryWarning && (
              <div className="warning-box">
                <strong>⚠️ Warning:</strong> Setting this as primary will remove the
                primary flag from the existing mapping for this system.
              </div>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default ExternalIdFormModal;
