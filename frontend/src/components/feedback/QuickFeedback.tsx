/**
 * Quick Feedback Component
 *
 * Simple thumbs up/down feedback widget that can be embedded anywhere.
 */

import React, { useState } from 'react';
import { useQuickFeedback, FeedbackCategory } from '../../services/feedbackService';
import './feedback.css';

interface QuickFeedbackProps {
  entityType: string;
  entityId: string;
  entityName?: string;
  category?: FeedbackCategory;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onFeedbackSubmitted?: (isPositive: boolean) => void;
}

const QuickFeedback: React.FC<QuickFeedbackProps> = ({
  entityType,
  entityId,
  entityName,
  category = 'OTHER',
  showLabel = true,
  size = 'md',
  onFeedbackSubmitted,
}) => {
  const [submitted, setSubmitted] = useState<'up' | 'down' | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');

  const { mutate: submitFeedback, isPending } = useQuickFeedback();

  const handleFeedback = (isPositive: boolean) => {
    if (submitted || isPending) return;

    submitFeedback(
      {
        entityType,
        entityId,
        entityName,
        isPositive,
        category,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          setSubmitted(isPositive ? 'up' : 'down');
          setShowNotes(false);
          onFeedbackSubmitted?.(isPositive);
        },
      }
    );
  };

  const sizeClasses = {
    sm: 'quick-feedback--sm',
    md: 'quick-feedback--md',
    lg: 'quick-feedback--lg',
  };

  if (submitted) {
    return (
      <div className={`quick-feedback quick-feedback--submitted ${sizeClasses[size]}`}>
        <span className="quick-feedback__thanks">
          {submitted === 'up' ? '👍' : '👎'} Thanks for your feedback!
        </span>
      </div>
    );
  }

  return (
    <div className={`quick-feedback ${sizeClasses[size]}`}>
      {showLabel && <span className="quick-feedback__label">Was this helpful?</span>}

      <div className="quick-feedback__buttons">
        <button
          className="quick-feedback__btn quick-feedback__btn--up"
          onClick={() => handleFeedback(true)}
          disabled={isPending}
          title="Yes, this was helpful"
        >
          👍
        </button>
        <button
          className="quick-feedback__btn quick-feedback__btn--down"
          onClick={() => setShowNotes(true)}
          disabled={isPending}
          title="No, this needs improvement"
        >
          👎
        </button>
      </div>

      {showNotes && (
        <div className="quick-feedback__notes">
          <textarea
            placeholder="What could be improved? (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
          <div className="quick-feedback__notes-actions">
            <button
              className="btn btn--sm btn--secondary"
              onClick={() => setShowNotes(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn--sm btn--primary"
              onClick={() => handleFeedback(false)}
              disabled={isPending}
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickFeedback;
