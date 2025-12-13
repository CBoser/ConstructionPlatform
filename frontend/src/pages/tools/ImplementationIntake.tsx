import React, { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import PageHeader from '../../components/layout/PageHeader';

// ============================================================================
// Types
// ============================================================================

interface CustomerCodeXref {
  id: string;
  customerId: string;
  customerCode: string;
  customerDescription: string | null;
  codeType: string;
  unifiedCode: string | null;
  unifiedPhaseId: string | null;
  batPackId: string | null;
  richmondCode: string | null;
  isValidated: boolean;
  validatedBy: string | null;
  validatedAt: string | null;
  notes: string | null;
  isActive: boolean;
}

interface CodeSystemStats {
  totalPhases: number;
  totalOptions: number;
  totalItemTypes: number;
  totalHoltMappings: number;
  totalLayer2Materials: number;
  totalCustomerXrefs: number;
  validatedXrefs: number;
  pendingXrefs: number;
}

interface Customer {
  id: string;
  name: string;
  customerCode: string;
}

interface UnifiedPhase {
  id: string;
  phaseCode: string;
  name: string;
}

// ============================================================================
// API Functions
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

async function fetchCodeSystemStats(): Promise<CodeSystemStats> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/v1/code-system/stats`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!response.ok) {
    // Return default stats if endpoint not available
    return {
      totalPhases: 0,
      totalOptions: 0,
      totalItemTypes: 0,
      totalHoltMappings: 0,
      totalLayer2Materials: 0,
      totalCustomerXrefs: 0,
      validatedXrefs: 0,
      pendingXrefs: 0,
    };
  }
  const data = await response.json();
  return data.data;
}

async function fetchCustomers(): Promise<Customer[]> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/v1/customers?limit=100`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!response.ok) return [];
  const data = await response.json();
  return data.data || [];
}

async function fetchUnifiedPhases(): Promise<UnifiedPhase[]> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/v1/code-system/phases`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!response.ok) return [];
  const data = await response.json();
  return data.data || [];
}

async function fetchCustomerXrefs(customerId?: string): Promise<CustomerCodeXref[]> {
  const token = getAuthToken();
  const url = customerId
    ? `${API_BASE_URL}/api/v1/code-system/xrefs?customerId=${customerId}`
    : `${API_BASE_URL}/api/v1/code-system/xrefs`;
  const response = await fetch(url, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!response.ok) return [];
  const data = await response.json();
  return data.data || [];
}

async function createCustomerXref(xref: Partial<CustomerCodeXref>): Promise<CustomerCodeXref> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/v1/code-system/xrefs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(xref),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to create cross-reference');
  }
  const data = await response.json();
  return data.data;
}

async function validateXref(id: string): Promise<CustomerCodeXref> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/v1/code-system/xrefs/${id}/validate`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!response.ok) {
    throw new Error('Failed to validate cross-reference');
  }
  const data = await response.json();
  return data.data;
}

// ============================================================================
// Stats Card Component
// ============================================================================

interface StatsCardProps {
  stats: CodeSystemStats;
}

const StatsCard: React.FC<StatsCardProps> = ({ stats }) => {
  const statItems = [
    { label: 'Unified Phases', value: stats.totalPhases, color: 'blue' },
    { label: 'Option Suffixes', value: stats.totalOptions, color: 'purple' },
    { label: 'Item Types', value: stats.totalItemTypes, color: 'cyan' },
    { label: 'Holt Mappings', value: stats.totalHoltMappings, color: 'green' },
    { label: 'Layer 2 SKUs', value: stats.totalLayer2Materials, color: 'yellow' },
    { label: 'Customer Xrefs', value: stats.totalCustomerXrefs, color: 'orange' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statItems.map((item) => (
        <div key={item.label} className={`bg-${item.color}-50 p-4 rounded-lg`}>
          <p className={`text-2xl font-bold text-${item.color}-600`}>{item.value}</p>
          <p className="text-sm text-gray-600">{item.label}</p>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// New Xref Form Component
// ============================================================================

interface NewXrefFormProps {
  customers: Customer[];
  phases: UnifiedPhase[];
  onSubmit: (data: Partial<CustomerCodeXref>) => void;
  isLoading: boolean;
}

const NewXrefForm: React.FC<NewXrefFormProps> = ({ customers, phases, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    customerId: '',
    customerCode: '',
    customerDescription: '',
    codeType: 'phase',
    unifiedPhaseId: '',
    batPackId: '',
    richmondCode: '',
    notes: '',
  });

  const codeTypes = [
    { value: 'phase', label: 'Phase Code' },
    { value: 'option', label: 'Option Code' },
    { value: 'material', label: 'Material Code' },
    { value: 'cost_code', label: 'Cost Code' },
  ];

  const batPacks = [
    { value: '|10', label: '|10 - Foundation/Framing' },
    { value: '|20', label: '|20 - Exterior/Siding' },
    { value: '|22', label: '|22 - Roofing' },
    { value: '|40', label: '|40 - Trim/Interior' },
    { value: '|60', label: '|60 - Deck/Special' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      unifiedPhaseId: formData.unifiedPhaseId || undefined,
      batPackId: formData.batPackId || undefined,
      richmondCode: formData.richmondCode || undefined,
      customerDescription: formData.customerDescription || undefined,
      notes: formData.notes || undefined,
    });
    // Reset form
    setFormData({
      customerId: '',
      customerCode: '',
      customerDescription: '',
      codeType: 'phase',
      unifiedPhaseId: '',
      batPackId: '',
      richmondCode: '',
      notes: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
          <select
            name="customerId"
            value={formData.customerId}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Customer...</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.customerCode})
              </option>
            ))}
          </select>
        </div>

        {/* Code Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Code Type *</label>
          <select
            name="codeType"
            value={formData.codeType}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {codeTypes.map((ct) => (
              <option key={ct.value} value={ct.value}>
                {ct.label}
              </option>
            ))}
          </select>
        </div>

        {/* Customer Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer Code *</label>
          <input
            type="text"
            name="customerCode"
            value={formData.customerCode}
            onChange={handleChange}
            required
            placeholder="e.g., 10100 or ELVA"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Customer Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer Description</label>
          <input
            type="text"
            name="customerDescription"
            value={formData.customerDescription}
            onChange={handleChange}
            placeholder="Customer's name for this code"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Unified Phase */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Map to Unified Phase</label>
          <select
            name="unifiedPhaseId"
            value={formData.unifiedPhaseId}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Phase...</option>
            {phases.map((p) => (
              <option key={p.id} value={p.id}>
                {p.phaseCode} - {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* BAT Pack */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">BAT Pack</label>
          <select
            name="batPackId"
            value={formData.batPackId}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select BAT Pack...</option>
            {batPacks.map((bp) => (
              <option key={bp.value} value={bp.value}>
                {bp.label}
              </option>
            ))}
          </select>
        </div>

        {/* Richmond Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Richmond Code</label>
          <input
            type="text"
            name="richmondCode"
            value={formData.richmondCode}
            onChange={handleChange}
            placeholder="e.g., ELVA, 3CARA"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={2}
          placeholder="Additional notes about this mapping..."
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="primary" disabled={isLoading} isLoading={isLoading}>
          Add Cross-Reference
        </Button>
      </div>
    </form>
  );
};

// ============================================================================
// Xref Table Component
// ============================================================================

interface XrefTableProps {
  xrefs: CustomerCodeXref[];
  onValidate: (id: string) => void;
  isValidating: boolean;
}

const XrefTable: React.FC<XrefTableProps> = ({ xrefs, onValidate, isValidating }) => {
  if (xrefs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No cross-references found. Add one above to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer Code</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unified Code</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">BAT Pack</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {xrefs.map((xref) => (
            <tr key={xref.id}>
              <td className="px-4 py-3 whitespace-nowrap font-mono text-sm">{xref.customerCode}</td>
              <td className="px-4 py-3 whitespace-nowrap text-sm capitalize">{xref.codeType.replace('_', ' ')}</td>
              <td className="px-4 py-3 text-sm">{xref.customerDescription || '-'}</td>
              <td className="px-4 py-3 whitespace-nowrap font-mono text-sm">{xref.unifiedCode || '-'}</td>
              <td className="px-4 py-3 whitespace-nowrap font-mono text-sm">{xref.batPackId || '-'}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                {xref.isValidated ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Validated
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {!xref.isValidated && (
                  <button
                    onClick={() => onValidate(xref.id)}
                    disabled={isValidating}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
                  >
                    Validate
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============================================================================
// Code Format Reference Component
// ============================================================================

const CodeFormatReference: React.FC = () => {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Unified Code Format: PPPP-XXX.XXX-XX-XXXX</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="border rounded-lg p-3">
          <h5 className="font-medium text-blue-700">Plan Code (PPPP)</h5>
          <p className="text-gray-600">4-digit builder plan code</p>
          <p className="font-mono text-xs mt-1">Example: 1234</p>
        </div>
        <div className="border rounded-lg p-3">
          <h5 className="font-medium text-blue-700">Phase.Option (XXX.XXX)</h5>
          <p className="text-gray-600">Phase code with option suffix</p>
          <p className="font-mono text-xs mt-1">Example: 101.001 (Foundation, ReadyFrame)</p>
        </div>
        <div className="border rounded-lg p-3">
          <h5 className="font-medium text-blue-700">Elevation (XX)</h5>
          <p className="text-gray-600">Elevation letter or code</p>
          <p className="font-mono text-xs mt-1">Example: A, B, C, D, 01-99</p>
        </div>
        <div className="border rounded-lg p-3">
          <h5 className="font-medium text-blue-700">Item Type (XXXX)</h5>
          <p className="text-gray-600">Material class or cost code</p>
          <p className="font-mono text-xs mt-1">Example: 1000 (Framing), 4085 (Lumber)</p>
        </div>
      </div>

      <div className="mt-4 bg-gray-50 rounded-lg p-4">
        <h5 className="font-medium mb-2">Common Option Suffixes</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div><span className="font-mono">.000</span> - Base/Standard</div>
          <div><span className="font-mono">.001</span> - ReadyFrame</div>
          <div><span className="font-mono">.008</span> - Top Chord</div>
          <div><span className="font-mono">.011</span> - Energy Code</div>
          <div><span className="font-mono">.020</span> - Owner's Suite</div>
          <div><span className="font-mono">.030</span> - 3-Car Garage</div>
          <div><span className="font-mono">.040</span> - Front Door</div>
          <div><span className="font-mono">.050</span> - Basement</div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

const ImplementationIntake: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'add' | 'view' | 'reference'>('add');

  // Fetch data
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['codeSystemStats'],
    queryFn: fetchCodeSystemStats,
  });

  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: fetchCustomers,
  });

  const { data: phases = [] } = useQuery({
    queryKey: ['unifiedPhases'],
    queryFn: fetchUnifiedPhases,
  });

  const { data: xrefs = [], isLoading: xrefsLoading } = useQuery({
    queryKey: ['customerXrefs', selectedCustomer],
    queryFn: () => fetchCustomerXrefs(selectedCustomer || undefined),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createCustomerXref,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerXrefs'] });
      queryClient.invalidateQueries({ queryKey: ['codeSystemStats'] });
    },
  });

  const validateMutation = useMutation({
    mutationFn: validateXref,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerXrefs'] });
      queryClient.invalidateQueries({ queryKey: ['codeSystemStats'] });
    },
  });

  const handleCreateXref = useCallback(
    (data: Partial<CustomerCodeXref>) => {
      createMutation.mutate(data);
    },
    [createMutation]
  );

  const handleValidateXref = useCallback(
    (id: string) => {
      validateMutation.mutate(id);
    },
    [validateMutation]
  );

  const tabs = [
    { id: 'add', label: 'Add Cross-Reference' },
    { id: 'view', label: 'View Mappings' },
    { id: 'reference', label: 'Code Reference' },
  ] as const;

  return (
    <div>
      <PageHeader
        title="Implementation Intake"
        subtitle="Map customer codes to the unified code system"
        breadcrumbs={[{ label: 'Tools', path: '/tools' }, { label: 'Implementation Intake' }]}
      />

      {/* Stats Overview */}
      <Card className="mb-6">
        <div className="p-4">
          <h3 className="font-medium mb-4">Code System Overview</h3>
          {statsLoading ? (
            <div className="text-center py-4 text-gray-500">Loading stats...</div>
          ) : stats ? (
            <StatsCard stats={stats} />
          ) : null}
        </div>
      </Card>

      {/* Validation Status */}
      {stats && (stats.pendingXrefs > 0 || stats.validatedXrefs > 0) && (
        <Card className="mb-6">
          <div className="p-4">
            <h3 className="font-medium mb-3">Validation Status</h3>
            <div className="flex gap-4">
              <div className="flex-1 bg-green-50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-green-600">{stats.validatedXrefs}</span>
                  <span className="text-sm text-gray-600">Validated</span>
                </div>
              </div>
              <div className="flex-1 bg-yellow-50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-yellow-600">{stats.pendingXrefs}</span>
                  <span className="text-sm text-gray-600">Pending Review</span>
                </div>
              </div>
              <div className="flex-1 bg-blue-50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-blue-600">
                    {stats.totalCustomerXrefs > 0
                      ? Math.round((stats.validatedXrefs / stats.totalCustomerXrefs) * 100)
                      : 0}
                    %
                  </span>
                  <span className="text-sm text-gray-600">Complete</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'add' && (
        <Card>
          <div className="p-4">
            <h3 className="font-medium mb-4">Add New Customer Code Cross-Reference</h3>
            {customersLoading ? (
              <div className="text-center py-4 text-gray-500">Loading customers...</div>
            ) : (
              <NewXrefForm
                customers={customers}
                phases={phases}
                onSubmit={handleCreateXref}
                isLoading={createMutation.isPending}
              />
            )}
            {createMutation.isError && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {(createMutation.error as Error)?.message || 'Failed to create cross-reference'}
              </div>
            )}
            {createMutation.isSuccess && (
              <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                Cross-reference created successfully!
              </div>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'view' && (
        <Card>
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Customer Code Mappings</h3>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Customers</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            {xrefsLoading ? (
              <div className="text-center py-4 text-gray-500">Loading mappings...</div>
            ) : (
              <XrefTable
                xrefs={xrefs}
                onValidate={handleValidateXref}
                isValidating={validateMutation.isPending}
              />
            )}
          </div>
        </Card>
      )}

      {activeTab === 'reference' && (
        <Card>
          <div className="p-4">
            <CodeFormatReference />
          </div>
        </Card>
      )}

      {/* Help Section */}
      <Card className="mt-6">
        <div className="p-4">
          <h3 className="font-medium mb-3">Implementation Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-100 text-blue-800 font-bold rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  1
                </span>
                <h4 className="font-medium">Collect Customer Codes</h4>
              </div>
              <p className="text-sm text-gray-600">
                Gather all phase codes, option codes, and material codes used by each customer (Holt 5-digit,
                Richmond alpha, etc.)
              </p>
            </div>
            <div className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-100 text-blue-800 font-bold rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  2
                </span>
                <h4 className="font-medium">Map to Unified System</h4>
              </div>
              <p className="text-sm text-gray-600">
                Use this intake form to map each customer code to the unified code system (PPPP-XXX.XXX-XX-XXXX)
              </p>
            </div>
            <div className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-100 text-blue-800 font-bold rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  3
                </span>
                <h4 className="font-medium">Validate Mappings</h4>
              </div>
              <p className="text-sm text-gray-600">
                Review and validate each mapping to ensure accuracy before using in production
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ImplementationIntake;
