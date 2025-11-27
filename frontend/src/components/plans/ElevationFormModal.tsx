import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { useToast } from '../common/Toast';
import ElevationVersionHistory from './ElevationVersionHistory';
import type { PlanElevation, CustomDetail } from '../../services/planService';

interface ElevationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  elevation: PlanElevation | null;
  planCode: string;
  onSave: (data: ElevationFormData, changeNotes?: string) => Promise<void>;
}

export interface ElevationFormData {
  code: string;
  name: string;
  description: string;
  architectDesigner: string;
  architectDesignerDate: string;
  structuralEngineer: string;
  structuralEngineerDate: string;
  iJoistCompany: string;
  iJoistCompanyDate: string;
  floorTrussCompany: string;
  floorTrussCompanyDate: string;
  roofTrussCompany: string;
  roofTrussCompanyDate: string;
  customDetails: CustomDetail[];
}

interface FormErrors {
  code?: string;
}

const ElevationFormModal: React.FC<ElevationFormModalProps> = ({
  isOpen,
  onClose,
  elevation,
  planCode,
  onSave,
}) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [changeNotes, setChangeNotes] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const [formData, setFormData] = useState<ElevationFormData>({
    code: '',
    name: '',
    description: '',
    architectDesigner: '',
    architectDesignerDate: '',
    structuralEngineer: '',
    structuralEngineerDate: '',
    iJoistCompany: '',
    iJoistCompanyDate: '',
    floorTrussCompany: '',
    floorTrussCompanyDate: '',
    roofTrussCompany: '',
    roofTrussCompanyDate: '',
    customDetails: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Reset form when modal opens/closes or elevation changes
  useEffect(() => {
    if (isOpen) {
      if (elevation) {
        setFormData({
          code: elevation.code,
          name: elevation.name || '',
          description: elevation.description || '',
          architectDesigner: elevation.architectDesigner || '',
          architectDesignerDate: elevation.architectDesignerDate?.split('T')[0] || '',
          structuralEngineer: elevation.structuralEngineer || '',
          structuralEngineerDate: elevation.structuralEngineerDate?.split('T')[0] || '',
          iJoistCompany: elevation.iJoistCompany || '',
          iJoistCompanyDate: elevation.iJoistCompanyDate?.split('T')[0] || '',
          floorTrussCompany: elevation.floorTrussCompany || '',
          floorTrussCompanyDate: elevation.floorTrussCompanyDate?.split('T')[0] || '',
          roofTrussCompany: elevation.roofTrussCompany || '',
          roofTrussCompanyDate: elevation.roofTrussCompanyDate?.split('T')[0] || '',
          customDetails: elevation.customDetails || [],
        });
      } else {
        setFormData({
          code: '',
          name: '',
          description: '',
          architectDesigner: '',
          architectDesignerDate: '',
          structuralEngineer: '',
          structuralEngineerDate: '',
          iJoistCompany: '',
          iJoistCompanyDate: '',
          floorTrussCompany: '',
          floorTrussCompanyDate: '',
          roofTrussCompany: '',
          roofTrussCompanyDate: '',
          customDetails: [],
        });
      }
      setChangeNotes('');
      setShowHistory(false);
      setErrors({});
    }
  }, [isOpen, elevation]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleCustomDetailChange = (index: number, field: keyof CustomDetail, value: string) => {
    setFormData((prev) => {
      const newDetails = [...prev.customDetails];
      newDetails[index] = { ...newDetails[index], [field]: value };
      return { ...prev, customDetails: newDetails };
    });
  };

  const addCustomDetail = () => {
    setFormData((prev) => ({
      ...prev,
      customDetails: [...prev.customDetails, { label: '', value: '', date: '' }],
    }));
  };

  const removeCustomDetail = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      customDetails: prev.customDetails.filter((_, i) => i !== index),
    }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Elevation code is required';
    } else if (formData.code.length > 10) {
      newErrors.code = 'Elevation code must be 10 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData, elevation ? changeNotes : undefined);
      showToast(
        elevation ? 'Elevation updated successfully' : 'Elevation created successfully',
        'success'
      );
      onClose();
    } catch (error: unknown) {
      console.error('Error saving elevation:', error);
      const apiError = error as { data?: { error?: string }; message?: string };
      const errorMessage =
        apiError?.data?.error || apiError?.message || 'Failed to save elevation';
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const isEditing = !!elevation;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Elevation ${elevation.code}` : `Add Elevation to ${planCode}`}
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
            {isEditing ? 'Save Changes' : 'Create Elevation'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="form-section">
          <h4 className="form-section-title">Basic Information</h4>
          <div className="form-grid form-grid-2">
            <Input
              label="Elevation Code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              error={errors.code}
              placeholder="e.g., A, B, C"
              required
              disabled={isLoading || isEditing}
              helperText={isEditing ? 'Code cannot be changed' : undefined}
            />

            <Input
              label="Elevation Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Craftsman, Contemporary"
              disabled={isLoading}
            />
          </div>

          <div className="form-grid">
            <Input
              label="Description"
              name="description"
              inputType="textarea"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description of this elevation variant..."
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Vendor Information */}
        <div className="form-section">
          <h4 className="form-section-title">Vendor / Designer Information</h4>

          {/* Architect/Designer */}
          <div className="vendor-row">
            <div className="vendor-row-fields">
              <Input
                label="Architect / Designer"
                name="architectDesigner"
                value={formData.architectDesigner}
                onChange={handleChange}
                placeholder="Company or person name"
                disabled={isLoading}
              />
              <Input
                label="Date"
                name="architectDesignerDate"
                inputType="date"
                value={formData.architectDesignerDate}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Structural Engineer */}
          <div className="vendor-row">
            <div className="vendor-row-fields">
              <Input
                label="Structural Engineer"
                name="structuralEngineer"
                value={formData.structuralEngineer}
                onChange={handleChange}
                placeholder="Company or person name"
                disabled={isLoading}
              />
              <Input
                label="Date"
                name="structuralEngineerDate"
                inputType="date"
                value={formData.structuralEngineerDate}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* I-Joist Company */}
          <div className="vendor-row">
            <div className="vendor-row-fields">
              <Input
                label="I-Joist Company"
                name="iJoistCompany"
                value={formData.iJoistCompany}
                onChange={handleChange}
                placeholder="Company name"
                disabled={isLoading}
              />
              <Input
                label="Date"
                name="iJoistCompanyDate"
                inputType="date"
                value={formData.iJoistCompanyDate}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Floor Truss Company */}
          <div className="vendor-row">
            <div className="vendor-row-fields">
              <Input
                label="Floor Truss Company"
                name="floorTrussCompany"
                value={formData.floorTrussCompany}
                onChange={handleChange}
                placeholder="Company name"
                disabled={isLoading}
              />
              <Input
                label="Date"
                name="floorTrussCompanyDate"
                inputType="date"
                value={formData.floorTrussCompanyDate}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Roof Truss Company */}
          <div className="vendor-row">
            <div className="vendor-row-fields">
              <Input
                label="Roof Truss Company"
                name="roofTrussCompany"
                value={formData.roofTrussCompany}
                onChange={handleChange}
                placeholder="Company name"
                disabled={isLoading}
              />
              <Input
                label="Date"
                name="roofTrussCompanyDate"
                inputType="date"
                value={formData.roofTrussCompanyDate}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Custom Details */}
        <div className="form-section">
          <div className="form-section-header">
            <h4 className="form-section-title">Additional Details</h4>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addCustomDetail}
              disabled={isLoading}
            >
              + Add Detail
            </Button>
          </div>

          {formData.customDetails.length > 0 ? (
            <div className="custom-details-list">
              {formData.customDetails.map((detail, index) => (
                <div key={index} className="custom-detail-row">
                  <Input
                    label="Label"
                    value={detail.label}
                    onChange={(e) => handleCustomDetailChange(index, 'label', e.target.value)}
                    placeholder="e.g., MEP Engineer"
                    disabled={isLoading}
                  />
                  <Input
                    label="Value"
                    value={detail.value}
                    onChange={(e) => handleCustomDetailChange(index, 'value', e.target.value)}
                    placeholder="Company or person name"
                    disabled={isLoading}
                  />
                  <Input
                    label="Date"
                    inputType="date"
                    value={detail.date || ''}
                    onChange={(e) => handleCustomDetailChange(index, 'date', e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="custom-detail-remove"
                    onClick={() => removeCustomDetail(index)}
                    disabled={isLoading}
                    title="Remove detail"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="custom-details-empty">
              No additional details. Click "Add Detail" to add custom vendor or designer information.
            </p>
          )}
        </div>

        {/* Version Notes (only for editing) */}
        {isEditing && (
          <div className="form-section">
            <h4 className="form-section-title">Version Notes</h4>
            <Input
              label="Change Notes"
              name="changeNotes"
              inputType="textarea"
              value={changeNotes}
              onChange={(e) => setChangeNotes(e.target.value)}
              placeholder="Describe what changed in this version..."
              helperText="These notes will be saved in the version history"
              disabled={isLoading}
            />
          </div>
        )}

        {/* Version History (only for editing) */}
        {isEditing && elevation && (
          <div className="form-section">
            <div className="form-section-header">
              <h4 className="form-section-title">Version History</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
              >
                {showHistory ? 'Hide History' : 'Show History'}
              </Button>
            </div>

            {showHistory && (
              <ElevationVersionHistory
                planId={elevation.planId}
                elevationId={elevation.id}
                elevationCode={elevation.code}
              />
            )}
          </div>
        )}
      </form>
    </Modal>
  );
};

export default ElevationFormModal;
