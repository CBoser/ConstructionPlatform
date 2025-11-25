import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { useToast } from '../common/Toast';
import {
  useCreateContact,
  useUpdateContact,
} from '../../services/customerService';
import type {
  CustomerContact,
  CreateCustomerContactInput,
  UpdateCustomerContactInput,
} from '../../../../shared/types/customer';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  contact?: CustomerContact | null;
  onSuccess?: () => void;
}

interface FormData {
  contactName: string;
  role: string;
  email: string;
  phone: string;
  receivesNotifications: boolean;
  isPrimary: boolean;
}

interface FormErrors {
  contactName?: string;
  email?: string;
  phone?: string;
}

const ContactFormModal: React.FC<ContactFormModalProps> = ({
  isOpen,
  onClose,
  customerId,
  contact,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();

  const [formData, setFormData] = useState<FormData>({
    contactName: '',
    role: '',
    email: '',
    phone: '',
    receivesNotifications: true,
    isPrimary: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Reset form when modal opens/closes or contact changes
  useEffect(() => {
    if (isOpen) {
      if (contact) {
        setFormData({
          contactName: contact.contactName,
          role: contact.role || '',
          email: contact.email || '',
          phone: contact.phone || '',
          receivesNotifications: contact.receivesNotifications,
          isPrimary: contact.isPrimary,
        });
      } else {
        setFormData({
          contactName: '',
          role: '',
          email: '',
          phone: '',
          receivesNotifications: true,
          isPrimary: false,
        });
      }
      setErrors({});
    }
  }, [isOpen, contact]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
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

    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Contact name is required';
    } else if (formData.contactName.length > 255) {
      newErrors.contactName = 'Contact name must be 255 characters or less';
    }

    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
    }

    if (formData.phone && formData.phone.length > 50) {
      newErrors.phone = 'Phone number must be 50 characters or less';
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
      if (contact) {
        // Update existing contact
        const updateData: UpdateCustomerContactInput = {
          contactName: formData.contactName,
          role: formData.role || undefined,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          receivesNotifications: formData.receivesNotifications,
          isPrimary: formData.isPrimary,
        };

        await updateContact.mutateAsync({
          customerId,
          contactId: contact.id,
          data: updateData,
        });

        showToast('Contact updated successfully', 'success');
      } else {
        // Create new contact
        const createData: Omit<CreateCustomerContactInput, 'customerId'> = {
          contactName: formData.contactName,
          role: formData.role || undefined,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          receivesNotifications: formData.receivesNotifications,
          isPrimary: formData.isPrimary,
        };

        await createContact.mutateAsync({
          customerId,
          data: createData,
        });

        showToast('Contact added successfully', 'success');
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error saving contact:', error);
      const errorMessage =
        error.data?.error || error.message || 'Failed to save contact';
      showToast(errorMessage, 'error');
    }
  };

  const isLoading = createContact.isPending || updateContact.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={contact ? 'Edit Contact' : 'Add Contact'}
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
            {contact ? 'Save Changes' : 'Add Contact'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <Input
            label="Contact Name"
            name="contactName"
            value={formData.contactName}
            onChange={handleChange}
            error={errors.contactName}
            placeholder="e.g., John Doe"
            required
            disabled={isLoading}
          />

          <Input
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            placeholder="e.g., Project Manager"
            disabled={isLoading}
          />

          <Input
            label="Email"
            name="email"
            inputType="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="e.g., john@example.com"
            disabled={isLoading}
          />

          <Input
            label="Phone"
            name="phone"
            inputType="tel"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            placeholder="e.g., (555) 123-4567"
            disabled={isLoading}
          />

          <div className="input-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="receivesNotifications"
                checked={formData.receivesNotifications}
                onChange={handleChange}
                disabled={isLoading}
              />
              <span>Receives Notifications</span>
            </label>
            <div className="input-helper-text">
              This contact will receive email notifications about jobs
            </div>
          </div>

          <div className="input-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isPrimary"
                checked={formData.isPrimary}
                onChange={handleChange}
                disabled={isLoading}
              />
              <span>Primary Contact</span>
            </label>
            <div className="input-helper-text">
              The main point of contact for this customer
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default ContactFormModal;
