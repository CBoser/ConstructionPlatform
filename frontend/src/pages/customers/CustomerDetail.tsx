import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Table from '../../components/common/Table';
import { useToast } from '../../components/common/Toast';
import CustomerFormModal from '../../components/customers/CustomerFormModal';
import ContactFormModal from '../../components/customers/ContactFormModal';
import ExternalIdManager from '../../components/customers/ExternalIdManager';
import {
  useCustomer,
  useDeleteContact,
  useCustomerPricingTiers,
} from '../../services/customerService';
import type {
  CustomerContact,
  CustomerPricingTier,
  CustomerType,
} from '../../../../shared/types/customer';

type TabType = 'overview' | 'contacts' | 'pricing' | 'external';

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<CustomerContact | null>(
    null
  );

  // Fetch customer data
  const {
    data: customer,
    isLoading,
    error,
    refetch,
  } = useCustomer(id || '');

  // Fetch pricing tiers
  const { data: pricingTiers } = useCustomerPricingTiers(id || '');

  // Delete contact mutation
  const deleteContact = useDeleteContact();

  // Handle edit customer
  const handleEditCustomer = () => {
    setIsEditModalOpen(true);
  };

  // Handle add contact
  const handleAddContact = () => {
    setSelectedContact(null);
    setIsContactModalOpen(true);
  };

  // Handle edit contact
  const handleEditContact = (contact: CustomerContact) => {
    setSelectedContact(contact);
    setIsContactModalOpen(true);
  };

  // Handle delete contact
  const handleDeleteContact = async (contact: CustomerContact) => {
    if (
      !confirm(
        `Are you sure you want to delete contact "${contact.contactName}"?`
      )
    ) {
      return;
    }

    try {
      await deleteContact.mutateAsync({
        customerId: id!,
        contactId: contact.id,
      });

      showToast('Contact deleted successfully', 'success');
      refetch();
    } catch (error: any) {
      console.error('Error deleting contact:', error);
      const errorMessage =
        error.data?.error || error.message || 'Failed to delete contact';
      showToast(errorMessage, 'error');
    }
  };

  // Format customer type
  const formatCustomerType = (type: CustomerType): string => {
    const typeMap: Record<CustomerType, string> = {
      PRODUCTION: 'Production',
      SEMI_CUSTOM: 'Semi-Custom',
      FULL_CUSTOM: 'Full Custom',
    };
    return typeMap[type] || type;
  };

  // Format date
  const formatDate = (date: Date | string): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="loading-page">
        <Loading size="lg" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="error-page">
        <h2>Customer Not Found</h2>
        <p>The requested customer could not be found.</p>
        <Button variant="primary" onClick={() => navigate('/foundation/customers')}>
          Back to Customers
        </Button>
      </div>
    );
  }

  // Contact table columns
  const contactColumns = [
    {
      header: 'Name',
      accessor: 'contactName' as keyof CustomerContact,
    },
    {
      header: 'Role',
      accessor: 'role' as keyof CustomerContact,
      cell: (contact: CustomerContact) => contact.role || '—',
    },
    {
      header: 'Email',
      accessor: 'email' as keyof CustomerContact,
      cell: (contact: CustomerContact) =>
        contact.email ? (
          <a href={`mailto:${contact.email}`} className="link">
            {contact.email}
          </a>
        ) : (
          '—'
        ),
    },
    {
      header: 'Phone',
      accessor: 'phone' as keyof CustomerContact,
      cell: (contact: CustomerContact) =>
        contact.phone ? (
          <a href={`tel:${contact.phone}`} className="link">
            {contact.phone}
          </a>
        ) : (
          '—'
        ),
    },
    {
      header: 'Primary',
      accessor: 'isPrimary' as keyof CustomerContact,
      cell: (contact: CustomerContact) =>
        contact.isPrimary ? (
          <span className="badge badge-primary">Primary</span>
        ) : null,
    },
    {
      header: 'Actions',
      accessor: 'id' as keyof CustomerContact,
      cell: (contact: CustomerContact) => (
        <div className="table-actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditContact(contact)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteContact(contact)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  // Pricing tier table columns
  const pricingColumns = [
    {
      header: 'Tier Name',
      accessor: 'tierName' as keyof CustomerPricingTier,
    },
    {
      header: 'Discount',
      accessor: 'discountPercentage' as keyof CustomerPricingTier,
      cell: (tier: CustomerPricingTier) => `${tier.discountPercentage}%`,
    },
    {
      header: 'Effective Date',
      accessor: 'effectiveDate' as keyof CustomerPricingTier,
      cell: (tier: CustomerPricingTier) => formatDate(tier.effectiveDate),
    },
    {
      header: 'Expiration Date',
      accessor: 'expirationDate' as keyof CustomerPricingTier,
      cell: (tier: CustomerPricingTier) =>
        tier.expirationDate ? formatDate(tier.expirationDate) : 'No expiration',
    },
  ];

  return (
    <div>
      <PageHeader
        title={customer.customerName}
        subtitle={formatCustomerType(customer.customerType)}
        breadcrumbs={[
          { label: 'Foundation', path: '/foundation' },
          { label: 'Customers', path: '/foundation/customers' },
          { label: customer.customerName },
        ]}
        actions={
          <div className="page-header-actions">
            <Button variant="secondary" onClick={handleEditCustomer}>
              Edit Customer
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/foundation/customers')}
            >
              Back to List
            </Button>
          </div>
        }
      />

      <div className="section">
        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab ${activeTab === 'contacts' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('contacts')}
          >
            Contacts ({customer.contacts?.length || 0})
          </button>
          <button
            className={`tab ${activeTab === 'pricing' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('pricing')}
          >
            Pricing History ({pricingTiers?.length || 0})
          </button>
          <button
            className={`tab ${activeTab === 'external' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('external')}
          >
            External Systems ({customer.externalIds?.length || 0})
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-2">
              <Card>
                <h3 className="card-title">Customer Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Customer Name</label>
                    <div>{customer.customerName}</div>
                  </div>

                  <div className="info-item">
                    <label>Customer Type</label>
                    <div>{formatCustomerType(customer.customerType)}</div>
                  </div>

                  <div className="info-item">
                    <label>Pricing Tier</label>
                    <div>{customer.pricingTier || '—'}</div>
                  </div>

                  <div className="info-item">
                    <label>Status</label>
                    <div>
                      <span
                        className={`badge badge-${customer.isActive ? 'success' : 'secondary'}`}
                      >
                        {customer.isActive ? 'Active' : 'Archived'}
                      </span>
                    </div>
                  </div>

                  <div className="info-item">
                    <label>Created</label>
                    <div>{formatDate(customer.createdAt)}</div>
                  </div>

                  <div className="info-item">
                    <label>Last Updated</label>
                    <div>{formatDate(customer.updatedAt)}</div>
                  </div>
                </div>

                {customer.notes && (
                  <div className="info-item mt-4">
                    <label>Notes</label>
                    <div className="text-gray-600">{customer.notes}</div>
                  </div>
                )}
              </Card>

              <Card>
                <h3 className="card-title">External IDs</h3>
                {customer.externalIds && customer.externalIds.length > 0 ? (
                  <div className="info-grid">
                    {customer.externalIds.map((externalId) => (
                      <div key={externalId.id} className="info-item">
                        <label>{externalId.externalSystem}</label>
                        <div>
                          {externalId.externalCustomerId}
                          {externalId.externalCustomerName && (
                            <span className="text-gray-500">
                              {' '}
                              ({externalId.externalCustomerName})
                            </span>
                          )}
                          {externalId.isPrimary && (
                            <span className="badge badge-primary ml-2">
                              Primary
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No external IDs mapped</p>
                )}
              </Card>
            </div>
          )}

          {/* Contacts Tab */}
          {activeTab === 'contacts' && (
            <Card>
              <div className="card-header-with-actions">
                <h3 className="card-title">Contacts</h3>
                <Button variant="primary" size="sm" onClick={handleAddContact}>
                  + Add Contact
                </Button>
              </div>

              {customer.contacts && customer.contacts.length > 0 ? (
                <Table columns={contactColumns} data={customer.contacts} />
              ) : (
                <div className="empty-state">
                  <h3>No contacts yet</h3>
                  <p>Add a contact to get started</p>
                  <Button variant="primary" onClick={handleAddContact}>
                    + Add Contact
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* Pricing History Tab */}
          {activeTab === 'pricing' && (
            <Card>
              <h3 className="card-title">Pricing Tier History</h3>

              {pricingTiers && pricingTiers.length > 0 ? (
                <Table columns={pricingColumns} data={pricingTiers} />
              ) : (
                <div className="empty-state">
                  <h3>No pricing tiers configured</h3>
                  <p>
                    Pricing tiers define discount percentages and effective
                    dates
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* External Systems Tab */}
          {activeTab === 'external' && (
            <ExternalIdManager customerId={id!} onRefresh={() => refetch()} />
          )}
        </div>
      </div>

      {/* Edit Customer Modal */}
      <CustomerFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        customer={customer}
        onSuccess={() => refetch()}
      />

      {/* Contact Modal */}
      <ContactFormModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        customerId={id!}
        contact={selectedContact}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

export default CustomerDetail;
