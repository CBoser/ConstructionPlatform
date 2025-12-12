/**
 * Variance Input Component
 *
 * Form for submitting estimate vs actual variance reports.
 */

import React, { useState, useMemo } from 'react';
import {
  useVarianceReport,
  FeedbackCategory,
  FEEDBACK_CATEGORY_LABELS,
  getVarianceColor,
} from '../../services/feedbackService';
import './feedback.css';

interface VarianceInputProps {
  entityType: string;
  entityId: string;
  entityName?: string;
  defaultCategory?: FeedbackCategory;
  initialEstimated?: number;
  initialActual?: number;
  onSubmitted?: () => void;
  onCancel?: () => void;
}

const VarianceInput: React.FC<VarianceInputProps> = ({
  entityType,
  entityId,
  entityName,
  defaultCategory = 'MATERIAL',
  initialEstimated,
  initialActual,
  onSubmitted,
  onCancel,
}) => {
  const [category, setCategory] = useState<FeedbackCategory>(defaultCategory);
  const [estimated, setEstimated] = useState<string>(
    initialEstimated?.toString() || ''
  );
  const [actual, setActual] = useState<string>(initialActual?.toString() || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const { mutate: submitVariance, isPending, error } = useVarianceReport();

  const variance = useMemo(() => {
    const est = parseFloat(estimated) || 0;
    const act = parseFloat(actual) || 0;
    if (est === 0 && act === 0) return null;

    const amount = act - est;
    const percent = est !== 0 ? (amount / est) * 100 : 0;
    return { amount, percent };
  }, [estimated, actual]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const est = parseFloat(estimated);
    const act = parseFloat(actual);

    if (isNaN(est) || isNaN(act)) {
      return;
    }

    submitVariance(
      {
        entityType,
        entityId,
        entityName,
        category,
        estimatedValue: est,
        actualValue: act,
        title: title || undefined,
        description: description || undefined,
      },
      {
        onSuccess: () => {
          onSubmitted?.();
        },
      }
    );
  };

  return (
    <form className="variance-input" onSubmit={handleSubmit}>
      <h3 className="variance-input__title">Report Variance</h3>

      {entityName && (
        <p className="variance-input__entity">
          {entityType}: <strong>{entityName}</strong>
        </p>
      )}

      <div className="variance-input__row">
        <div className="variance-input__field">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
          >
            {Object.entries(FEEDBACK_CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="variance-input__row variance-input__row--values">
        <div className="variance-input__field">
          <label htmlFor="estimated">Estimated</label>
          <div className="variance-input__currency">
            <span>$</span>
            <input
              id="estimated"
              type="number"
              step="0.01"
              value={estimated}
              onChange={(e) => setEstimated(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div className="variance-input__field">
          <label htmlFor="actual">Actual</label>
          <div className="variance-input__currency">
            <span>$</span>
            <input
              id="actual"
              type="number"
              step="0.01"
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
        </div>
      </div>

      {variance && (
        <div
          className="variance-input__result"
          style={{ borderColor: getVarianceColor(variance.percent) }}
        >
          <div className="variance-input__result-row">
            <span>Variance:</span>
            <span
              className="variance-input__result-value"
              style={{ color: getVarianceColor(variance.percent) }}
            >
              {variance.amount >= 0 ? '+' : ''}$
              {variance.amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="variance-input__result-row">
            <span>Percentage:</span>
            <span
              className="variance-input__result-value"
              style={{ color: getVarianceColor(variance.percent) }}
            >
              {variance.percent >= 0 ? '+' : ''}
              {variance.percent.toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      <div className="variance-input__field">
        <label htmlFor="title">Title (optional)</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Brief description of variance"
        />
      </div>

      <div className="variance-input__field">
        <label htmlFor="description">Notes (optional)</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What caused this variance? Any lessons learned?"
          rows={3}
        />
      </div>

      {error && (
        <div className="variance-input__error">
          Failed to submit variance report. Please try again.
        </div>
      )}

      <div className="variance-input__actions">
        {onCancel && (
          <button
            type="button"
            className="btn btn--secondary"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn--primary" disabled={isPending}>
          {isPending ? 'Submitting...' : 'Submit Variance Report'}
        </button>
      </div>
    </form>
  );
};

export default VarianceInput;
