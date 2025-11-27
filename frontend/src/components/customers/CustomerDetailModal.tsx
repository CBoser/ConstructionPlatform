import React from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../common/Modal';
import Button from '../common/Button';
import type { Customer, CustomerFull, CustomerContact } from '../../../../shared/types/customer';

interface CustomerDetailModalProps {
  customer: Customer | CustomerFull | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (customer: Customer) => void;
  onArchive?: (customer: Customer) => void;
}

// Format customer type for display
const formatCustomerType = (type: string): string => {
  const typeMap: Record<string, string> = {
    PRODUCTION: 'Production',
    SEMI_CUSTOM: 'Semi-Custom',
    FULL_CUSTOM: 'Full Custom',
  };
  return typeMap[type] || type;
};

// Get badge variant based on customer type
const getTypeVariant = (type: string): string => {
  const variantMap: Record<string, string> = {
    PRODUCTION: 'primary',
    SEMI_CUSTOM: 'warning',
    FULL_CUSTOM: 'info',
  };
  return variantMap[type] || 'secondary';
};

// Check if customer has contacts array (CustomerFull)
const hasContacts = (customer: Customer | CustomerFull): customer is CustomerFull => {
  return 'contacts' in customer && Array.isArray(customer.contacts);
};

// Find primary contact
const getPrimaryContact = (customer: Customer | CustomerFull): CustomerContact | undefined => {
  if (!hasContacts(customer)) return undefined;
  return customer.contacts.find((c) => c.isPrimary) || customer.contacts[0];
};

const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  isOpen,
  onClose,
  onEdit,
  onArchive,
}) => {
  const navigate = useNavigate();

  if (!customer) return null;

  const primaryContact = getPrimaryContact(customer);
  const contacts = hasContacts(customer) ? customer.contacts : [];

  const handleViewDetails = () => {
    navigate(`/foundation/customers/${customer.id}`);
    onClose();
  };

  const handleEdit = () => {
    onEdit?.(customer);
  };

  const handleArchive = () => {
    const action = customer.isActive ? 'archive' : 'activate';
    if (confirm(`Are you sure you want to ${action} "${customer.customerName}"?`)) {
      onArchive?.(customer);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customer.customerName}
      size="lg"
      footer={
        <div className="modal-footer-actions">
          <div className="modal-footer-left">
            {onArchive && (
              <Button
                variant={customer.isActive ? 'danger' : 'secondary'}
                onClick={handleArchive}
              >
                {customer.isActive ? 'Archive' : 'Activate'}
              </Button>
            )}
          </div>
          <div className="modal-footer-right">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            {onEdit && (
              <Button variant="secondary" onClick={handleEdit}>
                Edit
              </Button>
            )}
            <Button variant="primary" onClick={handleViewDetails}>
              View Full Details
            </Button>
          </div>
        </div>
      }
    >
      <div className="customer-detail">
        {/* Header Info */}
        <div className="customer-detail-header">
          <div className="customer-detail-title-row">
            <h3 className="customer-detail-name">{customer.customerName}</h3>
            <span className={`badge badge-${customer.isActive ? 'success' : 'secondary'}`}>
              {customer.isActive ? 'Active' : 'Archived'}
            </span>
          </div>
          <div className="customer-detail-badges">
            <span className={`badge badge-${getTypeVariant(customer.customerType)}`}>
              {formatCustomerType(customer.customerType)}
            </span>
            {customer.pricingTier && (
              <span className="customer-detail-tier">{customer.pricingTier}</span>
            )}
          </div>
        </div>

        {/* Primary Contact */}
        {primaryContact && (
          <div className="customer-detail-section">
            <h4 className="customer-detail-section-title">Primary Contact</h4>
            <div className="customer-detail-contact-card">
              <div className="customer-detail-contact-name">
                {primaryContact.contactName}
                {primaryContact.role && (
                  <span className="customer-detail-contact-role">
                    {primaryContact.role}
                  </span>
                )}
              </div>
              {primaryContact.email && (
                <div className="customer-detail-contact-info">
                  <a href={`mailto:${primaryContact.email}`}>{primaryContact.email}</a>
                </div>
              )}
              {primaryContact.phone && (
                <div className="customer-detail-contact-info">
                  <a href={`tel:${primaryContact.phone}`}>{primaryContact.phone}</a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Other Contacts */}
        {contacts.length > 1 && (
          <div className="customer-detail-section">
            <h4 className="customer-detail-section-title">
              Other Contacts ({contacts.length - 1})
            </h4>
            <div className="customer-detail-contacts-list">
              {contacts
                .filter((c) => c.id !== primaryContact?.id)
                .slice(0, 3)
                .map((contact) => (
                  <div key={contact.id} className="customer-detail-contact-item">
                    <span className="customer-detail-contact-item-name">
                      {contact.contactName}
                    </span>
                    {contact.role && (
                      <span className="customer-detail-contact-item-role">
                        {contact.role}
                      </span>
                    )}
                    {contact.email && (
                      <span className="customer-detail-contact-item-email">
                        {contact.email}
                      </span>
                    )}
                  </div>
                ))}
              {contacts.length > 4 && (
                <div className="customer-detail-more">
                  +{contacts.length - 4} more contacts
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {customer.notes && (
          <div className="customer-detail-section">
            <h4 className="customer-detail-section-title">Notes</h4>
            <p className="customer-detail-notes">{customer.notes}</p>
          </div>
        )}

        {/* Timestamps */}
        <div className="customer-detail-meta">
          <span>Created: {new Date(customer.createdAt).toLocaleDateString()}</span>
          <span>Updated: {new Date(customer.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </Modal>
  );
};

export default CustomerDetailModal;
