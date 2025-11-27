import React, { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import Loading from '../common/Loading';
import { useToast } from '../common/Toast';
import type {
  PlanElevation,
  PlanAssignedOption,
  OptionCategory,
  CreateAssignedOptionInput,
} from '../../services/planService';
import {
  useAssignedOptions,
  useCreateAssignedOption,
  useUpdateAssignedOption,
  useDeleteAssignedOption,
} from '../../services/planService';

interface PlanOptionsSectionProps {
  planId: string;
  elevations: PlanElevation[];
}

interface OptionFormData {
  name: string;
  description: string;
  category: OptionCategory | '';
  elevationId: string;
  estimatedCost: string;
  notes: string;
  isStandard: boolean;
}

const CATEGORY_OPTIONS: { value: OptionCategory; label: string }[] = [
  { value: 'DECK', label: 'Deck' },
  { value: 'FENCING', label: 'Fencing' },
  { value: 'ROOM_ADDITION', label: 'Room Addition' },
  { value: 'GARAGE', label: 'Garage' },
  { value: 'PATIO', label: 'Patio' },
  { value: 'STRUCTURAL', label: 'Structural' },
  { value: 'FINISH', label: 'Finish' },
  { value: 'OTHER', label: 'Other' },
];

// Format category for display
const formatCategory = (category: string): string => {
  return category
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
};

// Format currency
const formatCurrency = (amount: number | null): string => {
  if (amount === null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const PlanOptionsSection: React.FC<PlanOptionsSectionProps> = ({
  planId,
  elevations,
}) => {
  const { showToast } = useToast();

  // Fetch options
  const { data: options, isLoading } = useAssignedOptions(planId);

  // Mutations
  const createOption = useCreateAssignedOption();
  const updateOption = useUpdateAssignedOption();
  const deleteOption = useDeleteAssignedOption();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<PlanAssignedOption | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<OptionFormData>({
    name: '',
    description: '',
    category: '',
    elevationId: '',
    estimatedCost: '',
    notes: '',
    isStandard: false,
  });
  const [formErrors, setFormErrors] = useState<{ name?: string }>({});

  // Build elevation options for dropdown
  const elevationOptions = [
    { value: '', label: 'Plan-Level (All Elevations)' },
    ...elevations.map((e) => ({
      value: e.id,
      label: `Elevation ${e.code}${e.name ? ` - ${e.name}` : ''}`,
    })),
  ];

  // Separate plan-level and elevation-specific options
  const planLevelOptions = options?.filter((o) => !o.elevationId) || [];
  const elevationOptions2 = options?.filter((o) => o.elevationId) || [];

  // Group elevation options by elevation
  const optionsByElevation = elevations.reduce<
    Record<string, { elevation: PlanElevation; options: PlanAssignedOption[] }>
  >((acc, elevation) => {
    acc[elevation.id] = {
      elevation,
      options: elevationOptions2.filter((o) => o.elevationId === elevation.id),
    };
    return acc;
  }, {});

  const handleOpenModal = (option?: PlanAssignedOption) => {
    if (option) {
      setEditingOption(option);
      setFormData({
        name: option.name,
        description: option.description || '',
        category: option.category,
        elevationId: option.elevationId || '',
        estimatedCost: option.estimatedCost?.toString() || '',
        notes: option.notes || '',
        isStandard: option.isStandard,
      });
    } else {
      setEditingOption(null);
      setFormData({
        name: '',
        description: '',
        category: '',
        elevationId: '',
        estimatedCost: '',
        notes: '',
        isStandard: false,
      });
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingOption(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      elevationId: '',
      estimatedCost: '',
      notes: '',
      isStandard: false,
    });
    setFormErrors({});
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (name === 'name' && formErrors.name) {
      setFormErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  const validate = (): boolean => {
    const errors: { name?: string } = {};
    if (!formData.name.trim()) {
      errors.name = 'Option name is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const data: CreateAssignedOptionInput = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        category: (formData.category as OptionCategory) || 'OTHER',
        elevationId: formData.elevationId || undefined,
        estimatedCost: formData.estimatedCost
          ? Number(formData.estimatedCost)
          : undefined,
        notes: formData.notes.trim() || undefined,
        isStandard: formData.isStandard,
      };

      if (editingOption) {
        await updateOption.mutateAsync({
          planId,
          optionId: editingOption.id,
          data,
        });
        showToast('Option updated successfully', 'success');
      } else {
        await createOption.mutateAsync({ planId, data });
        showToast('Option created successfully', 'success');
      }

      handleCloseModal();
    } catch (error) {
      console.error('Failed to save option:', error);
      showToast('Failed to save option', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (option: PlanAssignedOption) => {
    if (
      !confirm(
        `Are you sure you want to delete the option "${option.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteOption.mutateAsync({ planId, optionId: option.id });
      showToast('Option deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete option:', error);
      showToast('Failed to delete option', 'error');
    }
  };

  const renderOptionCard = (option: PlanAssignedOption) => (
    <div key={option.id} className="option-card">
      <div className="option-card-header">
        <div className="option-card-title">
          <span className="option-card-name">{option.name}</span>
          <span className={`option-card-badge badge-${option.isStandard ? 'success' : 'secondary'}`}>
            {option.isStandard ? 'Standard' : 'Upgrade'}
          </span>
        </div>
        <div className="option-card-actions">
          <button
            className="option-card-btn"
            onClick={() => handleOpenModal(option)}
            title="Edit option"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            className="option-card-btn option-card-btn-danger"
            onClick={() => handleDelete(option)}
            title="Delete option"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      <div className="option-card-details">
        <span className="option-card-category">{formatCategory(option.category)}</span>
        {option.estimatedCost !== null && (
          <span className="option-card-cost">{formatCurrency(option.estimatedCost)}</span>
        )}
      </div>

      {option.description && (
        <p className="option-card-description">{option.description}</p>
      )}
    </div>
  );

  return (
    <>
      <div className="plan-detail-section">
        <div className="plan-detail-section-header">
          <h4 className="plan-detail-section-title">
            Options ({options?.length || 0})
          </h4>
          <Button variant="ghost" size="sm" onClick={() => handleOpenModal()}>
            + Add Option
          </Button>
        </div>

        {isLoading ? (
          <div className="options-loading">
            <Loading size="sm" />
          </div>
        ) : options && options.length > 0 ? (
          <div className="options-container">
            {/* Plan-Level Options */}
            {planLevelOptions.length > 0 && (
              <div className="options-group">
                <h5 className="options-group-title">Plan-Level Options</h5>
                <div className="options-grid">
                  {planLevelOptions.map(renderOptionCard)}
                </div>
              </div>
            )}

            {/* Elevation-Specific Options */}
            {Object.values(optionsByElevation).map(
              ({ elevation, options: elevOpts }) =>
                elevOpts.length > 0 && (
                  <div key={elevation.id} className="options-group">
                    <h5 className="options-group-title">
                      Elevation {elevation.code}
                      {elevation.name && ` - ${elevation.name}`}
                    </h5>
                    <div className="options-grid">
                      {elevOpts.map(renderOptionCard)}
                    </div>
                  </div>
                )
            )}
          </div>
        ) : (
          <div className="options-empty">
            <p>No options defined for this plan.</p>
            <Button variant="secondary" size="sm" onClick={() => handleOpenModal()}>
              Add First Option
            </Button>
          </div>
        )}
      </div>

      {/* Option Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingOption ? 'Edit Option' : 'Add Option'}
        size="md"
        footer={
          <div className="modal-footer-actions">
            <div className="modal-footer-right">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                isLoading={isSubmitting}
              >
                {editingOption ? 'Save Changes' : 'Create Option'}
              </Button>
            </div>
          </div>
        }
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div className="form-grid form-grid-2">
            <Input
              label="Option Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={formErrors.name}
              placeholder="e.g., Extended Deck"
              required
              disabled={isSubmitting}
            />

            <Input
              label="Category"
              name="category"
              inputType="select"
              value={formData.category}
              onChange={handleChange}
              options={CATEGORY_OPTIONS}
              disabled={isSubmitting}
            />

            <Input
              label="Scope"
              name="elevationId"
              inputType="select"
              value={formData.elevationId}
              onChange={handleChange}
              options={elevationOptions}
              helperText="Select which elevation(s) this option applies to"
              disabled={isSubmitting}
            />

            <Input
              label="Estimated Cost"
              name="estimatedCost"
              type="number"
              value={formData.estimatedCost}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              disabled={isSubmitting}
            />

            <div className="form-grid-span-2">
              <Input
                label="Description"
                name="description"
                inputType="textarea"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the option..."
                disabled={isSubmitting}
              />
            </div>

            <div className="form-grid-span-2">
              <Input
                label="Notes"
                name="notes"
                inputType="textarea"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes..."
                disabled={isSubmitting}
              />
            </div>

            <div className="form-grid-span-2">
              <label className="checkbox-field">
                <input
                  type="checkbox"
                  name="isStandard"
                  checked={formData.isStandard}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                <span className="checkbox-label">Standard Option</span>
                <span className="checkbox-helper">
                  Check if this is a standard option included in the base plan
                </span>
              </label>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default PlanOptionsSection;
