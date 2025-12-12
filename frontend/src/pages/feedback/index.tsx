/**
 * Feedback Dashboard Page
 *
 * Shows feedback statistics, patterns, variance trends, and recent feedback.
 */

import React, { useState } from 'react';
import {
  useFeedbackDashboard,
  useFeedbackList,
  useFeedbackPatterns,
  useResolveFeedback,
  FEEDBACK_TYPE_LABELS,
  FEEDBACK_CATEGORY_LABELS,
  FEEDBACK_STATUS_LABELS,
  getStatusColor,
  getTypeColor,
  getVarianceColor,
  formatUserName,
} from '../../services/feedbackService';
import type { Feedback, FeedbackType, FeedbackCategory, FeedbackStatus } from '../../services/feedbackService';
import { FeedbackModal, VarianceInput } from '../../components/feedback';
import './feedback.css';

const FeedbackDashboard: React.FC = () => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showVarianceModal, setShowVarianceModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [filters, setFilters] = useState<{
    feedbackType?: FeedbackType;
    category?: FeedbackCategory;
    status?: FeedbackStatus;
  }>({});

  const { data: dashboard, isLoading: dashboardLoading } = useFeedbackDashboard();
  const { data: feedbackData, isLoading: listLoading } = useFeedbackList({
    ...filters,
    limit: 20,
  });
  const { data: patterns } = useFeedbackPatterns({ isActive: true });
  const { mutate: resolveFeedback } = useResolveFeedback();

  const handleResolve = (id: string, status: 'RESOLVED' | 'DISMISSED') => {
    resolveFeedback({ id, data: { status } });
  };

  if (dashboardLoading) {
    return (
      <div className="feedback-page">
        <div className="loading">Loading feedback dashboard...</div>
      </div>
    );
  }

  return (
    <div className="feedback-page">
      <div className="feedback-page__header">
        <div>
          <h1>Feedback & Learning</h1>
          <p>Track feedback, variance reports, and improvement patterns</p>
        </div>
        <div className="feedback-page__actions">
          <button
            className="btn btn--secondary"
            onClick={() => setShowVarianceModal(true)}
          >
            + Variance Report
          </button>
          <button
            className="btn btn--primary"
            onClick={() => setShowFeedbackModal(true)}
          >
            + New Feedback
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="feedback-stats">
        <div className="stat-card">
          <div className="stat-card__value">{dashboard?.summary.total || 0}</div>
          <div className="stat-card__label">Total Feedback</div>
        </div>
        <div className="stat-card stat-card--new">
          <div className="stat-card__value">{dashboard?.summary.new || 0}</div>
          <div className="stat-card__label">New</div>
        </div>
        <div className="stat-card stat-card--progress">
          <div className="stat-card__value">{dashboard?.summary.inProgress || 0}</div>
          <div className="stat-card__label">In Progress</div>
        </div>
        <div className="stat-card stat-card--resolved">
          <div className="stat-card__value">{dashboard?.summary.resolved || 0}</div>
          <div className="stat-card__label">Resolved</div>
        </div>
      </div>

      {/* Satisfaction & Variance */}
      <div className="feedback-metrics">
        <div className="metric-card">
          <h3>User Satisfaction (7 days)</h3>
          <div className="satisfaction-meter">
            <div className="satisfaction-icons">
              <span className="thumbs-up">👍 {dashboard?.satisfaction.thumbsUp || 0}</span>
              <span className="thumbs-down">👎 {dashboard?.satisfaction.thumbsDown || 0}</span>
            </div>
            {dashboard?.satisfaction.ratio !== null && (
              <div className="satisfaction-bar">
                <div
                  className="satisfaction-bar__fill"
                  style={{ width: `${dashboard?.satisfaction.ratio || 0}%` }}
                />
              </div>
            )}
            <div className="satisfaction-percent">
              {dashboard?.satisfaction.ratio !== null
                ? `${dashboard?.satisfaction.ratio}% Positive`
                : 'No data'}
            </div>
          </div>
        </div>

        <div className="metric-card">
          <h3>Variance Tracking (30 days)</h3>
          <div className="variance-summary">
            <div className="variance-stat">
              <span className="variance-stat__value">
                {dashboard?.variance.reportCount || 0}
              </span>
              <span className="variance-stat__label">Reports</span>
            </div>
            {dashboard?.variance.avgVariancePercent && (
              <div className="variance-stat">
                <span
                  className="variance-stat__value"
                  style={{
                    color: getVarianceColor(
                      parseFloat(dashboard.variance.avgVariancePercent)
                    ),
                  }}
                >
                  {parseFloat(dashboard.variance.avgVariancePercent) >= 0 ? '+' : ''}
                  {dashboard.variance.avgVariancePercent}%
                </span>
                <span className="variance-stat__label">Avg Variance</span>
              </div>
            )}
          </div>
        </div>

        <div className="metric-card">
          <h3>By Category (30 days)</h3>
          <div className="category-breakdown">
            {dashboard?.byCategory &&
              Object.entries(dashboard.byCategory)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([cat, count]) => (
                  <div key={cat} className="category-row">
                    <span className="category-name">
                      {FEEDBACK_CATEGORY_LABELS[cat as FeedbackCategory] || cat}
                    </span>
                    <span className="category-count">{count}</span>
                  </div>
                ))}
          </div>
        </div>
      </div>

      {/* Patterns */}
      {patterns && patterns.length > 0 && (
        <div className="feedback-section">
          <h2>Detected Patterns</h2>
          <div className="patterns-grid">
            {patterns.slice(0, 4).map((pattern) => (
              <div key={pattern.id} className="pattern-card">
                <div className="pattern-card__header">
                  <span className="pattern-card__type">{pattern.patternType}</span>
                  <span className="pattern-card__count">
                    {pattern.occurrenceCount} occurrences
                  </span>
                </div>
                <h4 className="pattern-card__name">{pattern.patternName}</h4>
                {pattern.entityName && (
                  <p className="pattern-card__entity">{pattern.entityName}</p>
                )}
                {pattern.avgVariancePct && (
                  <div
                    className="pattern-card__variance"
                    style={{ color: getVarianceColor(Number(pattern.avgVariancePct)) }}
                  >
                    Avg: {Number(pattern.avgVariancePct) >= 0 ? '+' : ''}
                    {Number(pattern.avgVariancePct).toFixed(1)}%
                  </div>
                )}
                {pattern.recommendation && (
                  <p className="pattern-card__recommendation">
                    {pattern.recommendation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback List */}
      <div className="feedback-section">
        <div className="feedback-section__header">
          <h2>Recent Feedback</h2>
          <div className="feedback-filters">
            <select
              value={filters.status || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  status: (e.target.value as FeedbackStatus) || undefined,
                })
              }
            >
              <option value="">All Status</option>
              {Object.entries(FEEDBACK_STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={filters.feedbackType || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  feedbackType: (e.target.value as FeedbackType) || undefined,
                })
              }
            >
              <option value="">All Types</option>
              {Object.entries(FEEDBACK_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={filters.category || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  category: (e.target.value as FeedbackCategory) || undefined,
                })
              }
            >
              <option value="">All Categories</option>
              {Object.entries(FEEDBACK_CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {listLoading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="feedback-list">
            {feedbackData?.items.map((item) => (
              <div
                key={item.id}
                className="feedback-item"
                onClick={() => setSelectedFeedback(item)}
              >
                <div className="feedback-item__header">
                  <span
                    className="feedback-item__type"
                    style={{ backgroundColor: getTypeColor(item.feedbackType) }}
                  >
                    {FEEDBACK_TYPE_LABELS[item.feedbackType]}
                  </span>
                  <span
                    className="feedback-item__status"
                    style={{ color: getStatusColor(item.status) }}
                  >
                    {FEEDBACK_STATUS_LABELS[item.status]}
                  </span>
                </div>
                <div className="feedback-item__body">
                  <h4>{item.title || `${item.entityType}: ${item.entityName || item.entityId}`}</h4>
                  {item.description && (
                    <p className="feedback-item__desc">
                      {item.description.substring(0, 150)}
                      {item.description.length > 150 ? '...' : ''}
                    </p>
                  )}
                  {item.variancePercent !== null && (
                    <div
                      className="feedback-item__variance"
                      style={{ color: getVarianceColor(Number(item.variancePercent)) }}
                    >
                      Variance: {Number(item.variancePercent) >= 0 ? '+' : ''}
                      {Number(item.variancePercent).toFixed(1)}%
                    </div>
                  )}
                </div>
                <div className="feedback-item__footer">
                  <span className="feedback-item__category">
                    {FEEDBACK_CATEGORY_LABELS[item.category]}
                  </span>
                  <span className="feedback-item__date">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  <span className="feedback-item__user">
                    {formatUserName(item.submittedBy)}
                  </span>
                </div>
                {item.status === 'NEW' && (
                  <div className="feedback-item__actions">
                    <button
                      className="btn btn--sm btn--success"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResolve(item.id, 'RESOLVED');
                      }}
                    >
                      Resolve
                    </button>
                    <button
                      className="btn btn--sm btn--secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResolve(item.id, 'DISMISSED');
                      }}
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            ))}
            {feedbackData?.items.length === 0 && (
              <div className="feedback-empty">
                No feedback found. Be the first to submit feedback!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmitted={() => setShowFeedbackModal(false)}
      />

      {/* Variance Modal */}
      {showVarianceModal && (
        <div className="modal-overlay" onClick={() => setShowVarianceModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <VarianceInput
              entityType="Job"
              entityId=""
              onSubmitted={() => setShowVarianceModal(false)}
              onCancel={() => setShowVarianceModal(false)}
            />
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedFeedback && (
        <div className="modal-overlay" onClick={() => setSelectedFeedback(null)}>
          <div className="modal feedback-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2>Feedback Details</h2>
              <button
                className="modal__close"
                onClick={() => setSelectedFeedback(null)}
              >
                &times;
              </button>
            </div>
            <div className="modal__body">
              <div className="feedback-detail">
                <div className="feedback-detail__row">
                  <span className="label">Type:</span>
                  <span
                    className="value badge"
                    style={{ backgroundColor: getTypeColor(selectedFeedback.feedbackType) }}
                  >
                    {FEEDBACK_TYPE_LABELS[selectedFeedback.feedbackType]}
                  </span>
                </div>
                <div className="feedback-detail__row">
                  <span className="label">Status:</span>
                  <span
                    className="value"
                    style={{ color: getStatusColor(selectedFeedback.status) }}
                  >
                    {FEEDBACK_STATUS_LABELS[selectedFeedback.status]}
                  </span>
                </div>
                <div className="feedback-detail__row">
                  <span className="label">Category:</span>
                  <span className="value">
                    {FEEDBACK_CATEGORY_LABELS[selectedFeedback.category]}
                  </span>
                </div>
                <div className="feedback-detail__row">
                  <span className="label">Entity:</span>
                  <span className="value">
                    {selectedFeedback.entityType}:{' '}
                    {selectedFeedback.entityName || selectedFeedback.entityId}
                  </span>
                </div>
                {selectedFeedback.title && (
                  <div className="feedback-detail__row">
                    <span className="label">Title:</span>
                    <span className="value">{selectedFeedback.title}</span>
                  </div>
                )}
                {selectedFeedback.description && (
                  <div className="feedback-detail__row feedback-detail__row--full">
                    <span className="label">Description:</span>
                    <p className="value">{selectedFeedback.description}</p>
                  </div>
                )}
                {selectedFeedback.variancePercent !== null && (
                  <>
                    <div className="feedback-detail__row">
                      <span className="label">Estimated:</span>
                      <span className="value">
                        ${Number(selectedFeedback.estimatedValue).toLocaleString()}
                      </span>
                    </div>
                    <div className="feedback-detail__row">
                      <span className="label">Actual:</span>
                      <span className="value">
                        ${Number(selectedFeedback.actualValue).toLocaleString()}
                      </span>
                    </div>
                    <div className="feedback-detail__row">
                      <span className="label">Variance:</span>
                      <span
                        className="value"
                        style={{
                          color: getVarianceColor(Number(selectedFeedback.variancePercent)),
                        }}
                      >
                        ${Number(selectedFeedback.varianceAmount).toLocaleString()} (
                        {Number(selectedFeedback.variancePercent) >= 0 ? '+' : ''}
                        {Number(selectedFeedback.variancePercent).toFixed(1)}%)
                      </span>
                    </div>
                  </>
                )}
                <div className="feedback-detail__row">
                  <span className="label">Submitted:</span>
                  <span className="value">
                    {new Date(selectedFeedback.createdAt).toLocaleString()} by{' '}
                    {formatUserName(selectedFeedback.submittedBy)}
                  </span>
                </div>
                {selectedFeedback.resolvedBy && (
                  <div className="feedback-detail__row">
                    <span className="label">Resolved:</span>
                    <span className="value">
                      {new Date(selectedFeedback.resolvedAt!).toLocaleString()} by{' '}
                      {formatUserName(selectedFeedback.resolvedBy)}
                    </span>
                  </div>
                )}
                {selectedFeedback.actionTaken && (
                  <div className="feedback-detail__row feedback-detail__row--full">
                    <span className="label">Action Taken:</span>
                    <p className="value">{selectedFeedback.actionTaken}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal__footer">
              <button
                className="btn btn--secondary"
                onClick={() => setSelectedFeedback(null)}
              >
                Close
              </button>
              {selectedFeedback.status === 'NEW' && (
                <>
                  <button
                    className="btn btn--success"
                    onClick={() => {
                      handleResolve(selectedFeedback.id, 'RESOLVED');
                      setSelectedFeedback(null);
                    }}
                  >
                    Mark Resolved
                  </button>
                  <button
                    className="btn btn--secondary"
                    onClick={() => {
                      handleResolve(selectedFeedback.id, 'DISMISSED');
                      setSelectedFeedback(null);
                    }}
                  >
                    Dismiss
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackDashboard;
