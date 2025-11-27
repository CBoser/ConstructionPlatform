import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { useToast } from '../common/Toast';
import {
  useCreateCustomer,
  useUpdateCustomer,
} from '../../services/customerService';
import type {
  CustomerType,
  CustomerFull,
  CreateCustomerInput,
  UpdateCustomerInput,
} from '../../../../shared/types/customer';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: CustomerFull | null;
  onSuccess?: () => void;
}

interface FormData {
  customerName: string;
  customerType: CustomerType | '';
  pricingTier: string;
  notes: string;
}

interface FormErrors {
  customerName?: string;
  customerType?: string;
}

const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  onClose,
  customer,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    customerType: '',
    pricingTier: '',
    notes: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Reset form when modal opens/closes or customer changes
  useEffect(() => {
    if (isOpen) {
      if (customer) {
        setFormData({
          customerName: customer.customerName,
          customerType: customer.customerType,
          pricingTier: customer.pricingTier || '',
          notes: customer.notes || '',
        });
      } else {
        setFormData({
          customerName: '',
          customerType: '',
          pricingTier: '',
          notes: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, customer]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    } else if (formData.customerName.length > 255) {
      newErrors.customerName = 'Customer name must be 255 characters or less';
    }

    if (!formData.customerType) {
      newErrors.customerType = 'Customer type is required';
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
      if (customer) {
        // Update existing customer
        const updateData: UpdateCustomerInput = {
          customerName: formData.customerName,
          customerType: formData.customerType as CustomerType,
          pricingTier: formData.pricingTier || undefined,
          notes: formData.notes || undefined,
        };

        await updateCustomer.mutateAsync({
          id: customer.id,
          data: updateData,
        });

        showToast('Customer updated successfully', 'success');
      } else {
        // Create new customer
        const createData: CreateCustomerInput = {
          customerName: formData.customerName,
          customerType: formData.customerType as CustomerType,
          pricingTier: formData.pricingTier || undefined,
          notes: formData.notes || undefined,
        };

        await createCustomer.mutateAsync(createData);

        showToast('Customer created successfully', 'success');
      }

      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      console.error('Error saving customer:', error);
      const apiError = error as { data?: { error?: string }; message?: string };
      const errorMessage =
        apiError?.data?.error || apiError?.message || 'Failed to save customer';
      showToast(errorMessage, 'error');
    }
  };

  const isLoading = createCustomer.isPending || updateCustomer.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customer ? 'Edit Customer' : 'Add Customer'}
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
            {customer ? 'Save Changes' : 'Create Customer'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <Input
            label="Customer Name"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            error={errors.customerName}
            placeholder="e.g., Richmond American Homes"
            autoComplete="organization"
            required
            disabled={isLoading}
          />

          <Input
            label="Customer Type"
            name="customerType"
            inputType="select"
            value={formData.customerType}
            onChange={handleChange}
            error={errors.customerType}
            options={[
              { value: 'PRODUCTION', label: 'Production' },
              { value: 'SEMI_CUSTOM', label: 'Semi-Custom' },
              { value: 'FULL_CUSTOM', label: 'Full Custom' },
            ]}
            required
            disabled={isLoading}
          />

          <Input
            label="Pricing Tier"
            name="pricingTier"
            inputType="select"
            value={formData.pricingTier}
            onChange={handleChange}
            options={[
              { value: 'TIER_1', label: 'Tier 1 (Premium)' },
              { value: 'TIER_2', label: 'Tier 2 (Standard)' },
              { value: 'TIER_3', label: 'Tier 3 (Basic)' },
              { value: 'CUSTOM', label: 'Custom' },
            ]}
            helperText="Optional - can be configured later"
            disabled={isLoading}
          />

          <Input
            label="Notes"
            name="notes"
            inputType="textarea"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Additional information about this customer..."
            disabled={isLoading}
          />
        </div>
      </form>
    </Modal>
  );
};

export default CustomerFormModal;
