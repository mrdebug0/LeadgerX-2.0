import React, { useState, useEffect } from 'react';
import {
  Store as StoreIcon,
  Shield,
  Users,
  Save,
  CheckCircle2,
  Lock,
  FileSpreadsheet,
} from 'lucide-react';
import { Store, User, AuditLog } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { api } from '../../api/client';

interface SettingsViewProps {
  store: Store;
  currentUser: User;
  onStoreUpdated: () => void;
  onLogout: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  store,
  currentUser,
  onStoreUpdated,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'store' | 'staff' | 'audit'>('store');
  const [name, setName] = useState(store.name || '');
  const [tagline, setTagline] = useState(store.tagline || '');
  const [phone, setPhone] = useState(store.phone || '');
  const [address, setAddress] = useState(store.address || '');
  const [gstin, setGstin] = useState(store.gstin || '');
  const [currency, setCurrency] = useState(store.currency || 'INR');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const isOwnerOrAdmin = currentUser.role === 'owner' || currentUser.role === 'admin';

  useEffect(() => {
    if (activeTab === 'audit' && isOwnerOrAdmin) {
      loadAuditLogs();
    }
  }, [activeTab]);

  const loadAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const data = await api.getAuditLogs();
      setAuditLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoadingAudit(false);
    }
  };

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(false);
    try {
      await api.updateStore({
        name,
        tagline,
        phone,
        address,
        gstin,
        currency,
      });
      setSuccessMsg(true);
      onStoreUpdated();
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err: any) {
      alert(err?.message || 'Failed to update store');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Settings & Store Preferences
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your store information, staff access, and security logs
          </p>
        </div>

        <Button variant="danger" size="sm" onClick={onLogout}>
          Sign Out of Account
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('store')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'store'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Store Profile
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'staff'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Staff & Roles
        </button>
        {isOwnerOrAdmin && (
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Audit Logs
          </button>
        )}
      </div>

      {/* Tab: Store Profile */}
      {activeTab === 'store' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Store profile updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveStore} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Store / Business Name *"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={!isOwnerOrAdmin}
              />

              <Input
                label="Store Tagline / Bio"
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Trusted Kirana since 2018"
                disabled={!isOwnerOrAdmin}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Business Phone Number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                disabled={!isOwnerOrAdmin}
              />

              <Input
                label="GSTIN Number (Optional)"
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                placeholder="07AAAAA0000A1Z5"
                disabled={!isOwnerOrAdmin}
              />
            </div>

            <Input
              label="Store Address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Shop No., Market, City, State"
              disabled={!isOwnerOrAdmin}
            />

            {isOwnerOrAdmin && (
              <div className="pt-3 flex justify-end">
                <Button type="submit" loading={saving} icon={<Save className="w-4 h-4" />}>
                  Save Store Settings
                </Button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Tab: Staff & Permissions */}
      {activeTab === 'staff' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Your Current Session Role</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Active user: <strong>{currentUser.name}</strong> ({currentUser.email})
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
              Role: {currentUser.role}
            </span>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Role-Based Access Matrix
            </h4>
            <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 text-xs">
              <div className="p-3.5 flex items-center justify-between bg-slate-50">
                <span className="font-bold text-slate-900">Owner</span>
                <span className="text-slate-600">Full administrative control, store settings, staff management, audit logs</span>
              </div>
              <div className="p-3.5 flex items-center justify-between">
                <span className="font-bold text-slate-900">Admin</span>
                <span className="text-slate-600">Daily business management, reports, customer deletes, audit logs</span>
              </div>
              <div className="p-3.5 flex items-center justify-between">
                <span className="font-bold text-slate-900">Staff / Cashier</span>
                <span className="text-slate-600">Counter sales, bill scanning, voice entry, customer ledger view & payment records</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Audit Logs (Owner/Admin only per prompt Section 29) */}
      {activeTab === 'audit' && isOwnerOrAdmin && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">System Security & Audit Trail</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Restricted access for Store Owners and Admins only
              </p>
            </div>
            <Button size="sm" variant="secondary" onClick={loadAuditLogs} loading={loadingAudit}>
              Refresh Logs
            </Button>
          </div>

          {loadingAudit ? (
            <p className="text-xs text-slate-500 py-6 text-center">Loading audit records...</p>
          ) : auditLogs.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No security logs recorded yet.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                    <span className="font-bold text-blue-700">{log.action}</span>
                    <span>{new Date(log.createdAt).toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-slate-800 font-medium">{log.details}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Performed by: {log.userName}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
