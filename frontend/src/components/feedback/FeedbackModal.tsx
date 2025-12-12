/**
 * Feedback Modal Component
 *
 * Full feedback form for submitting detailed feedback.
 */

import React, { useState } from 'react';
import { useCreateFeedback, FEEDBACK_TYPE_LABELS, FEEDBACK_CATEGORY_LABELS } from '../../services/feedbackService';
import type { FeedbackType, FeedbackCategory } from '../../services/feedbackService';
import './feedback.css';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType?: string;
  entityId?: string;
  entityName?: string;
  defaultType?: FeedbackType;
  defaultCategory?: FeedbackCategory;
  onSubmitted?: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  entityType: defaultEntityType,
  entityId: defaultEntityId,
  entityName: defaultEntityName,
  defaultType = 'SUGGESTION',
  defaultCategory = 'OTHER',
  onSubmitted,
}) => {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(defaultType);
  const [category, setCategory] = useState<FeedbackCategory>(defaultCategory);
  const [entityType, setEntityType] = useState(defaultEntityType || '');
  const [entityId, setEntityId] = useState(defaultEntityId || '');
  const [entityName, setEntityName] = useState(defaultEntityName || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState<number | null>(null);

  const { mutate: createFeedback, isPending, error } = useCreateFeedback();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!entityType || !entityId) {
      return;
    }

    createFeedback(
      {
        feedbackType,
        category,
        entityType,
        entityId,
        entityName: entityName || undefined,
        title: title || undefined,
        description: description || undefined,
        rating: rating || undefined,
      },
      {
        onSuccess: () => {
          onSubmitted?.();
          onClose();
          // Reset form
          setTitle('');
          setDescription('');
          setRating(null);
        },
      }
    );
  };

  if (!isOpen) return null;

  // Filter out quick feedback types
  const feedbackTypes = Object.entries(FEEDBACK_TYPE_LABELS).filter(
    ([key]) => !['THUMBS_UP', 'THUMBS_DOWN'].includes(key)
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal feedback-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2>Submit Feedback</h2>
          <button className="modal__close" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="feedbackType">Feedback Type *</label>
                <select
                  id="feedbackType"
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value as FeedbackType)}
                  required
                >
                  {feedbackTypes.map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                  required
                >
                  {Object.entries(FEEDBACK_CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="entityType">Entity Type *</label>
                <select
                  id="entityType"
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value)}
                  required
                >
                  <option value="">Select...</option>
                  <option value="Job">Job</option>
                  <option value="Plan">Plan</option>
                  <option value="Estimate">Estimate</option>
                  <option value="Import">Import</option>
                  <option value="Agent">Agent</option>
                  <option value="Feature">Feature</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="entityId">Reference ID *</label>
                <input
                  id="entityId"
                  type="text"
                  value={entityId}
                  onChange={(e) => setEntityId(e.target.value)}
                  placeholder="ID or identifier"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="entityName">Reference Name (optional)</label>
              <input
                id="entityName"
                type="text"
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                placeholder="Human-readable name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details about your feedback..."
                rows={4}
              />
            </div>

            <div className="form-group">
              <label>Rating (optional)</label>
              <div className="rating-input">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`rating-star ${rating && rating >= star ? 'active' : ''}`}
                    onClick={() => setRating(rating === star ? null : star)}
                  >
                    {rating && rating >= star ? '★' : '☆'}
                  </button>
                ))}
                {rating && (
                  <span className="rating-label">
                    {rating === 1 && 'Poor'}
                    {rating === 2 && 'Fair'}
                    {rating === 3 && 'Good'}
                    {rating === 4 && 'Very Good'}
                    {rating === 5 && 'Excellent'}
                  </span>
                )}
              </div>
            </div>

            {error && (
              <div className="form-error">
                Failed to submit feedback. Please try again.
              </div>
            )}
          </div>

          <div className="modal__footer">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={isPending}>
              {isPending ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
