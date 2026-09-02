'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Building2,
  Landmark,
  ShieldCheck,
  AlertTriangle,
  Users,
  CheckCircle2,
  XCircle,
  Sparkles,
  Save,
  UserPlus,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/lib/auth-context';
import { getApiErrorMessage } from '@/lib/api-client';
import * as businessService from '@/lib/business-service';
import { BusinessProfile, TeamMember, ComplianceReport } from '@/lib/types';
import { validateAbnClient, AUSTRALIAN_STATES, InviteTeamMemberFormValues } from '@/lib/validators';

function SettingsContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'profile' | 'banking' | 'team'>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [industry, setIndustry] = useState('NDIS Support Worker');
  const [abn, setAbn] = useState('');
  const [bsb, setBsb] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('');
  const [invoicePrefix, setInvoicePrefix] = useState('INV');
  const [isGstRegistered, setIsGstRegistered] = useState(false);
  const [address, setAddress] = useState('');
  const [suburb, setSuburb] = useState('');
  const [state, setState] = useState('NSW');
  const [postcode, setPostcode] = useState('');

  // Team Management State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFirstName, setInviteFirstName] = useState('');
  const [inviteLastName, setInviteLastName] = useState('');
  const [inviteRole, setInviteRole] = useState<'OFFICE_MANAGER' | 'TECHNICIAN'>('OFFICE_MANAGER');
  const [isInviting, setIsInviting] = useState(false);

  // 1-Click Quick Fill & Jump Helper
  function jumpToField(tab: 'profile' | 'banking', fieldId: string) {
    setActiveTab(tab);
    setTimeout(() => {
      const el = document.getElementById(fieldId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
        el.classList.add('ring-2', 'ring-[#16A085]', 'ring-offset-2', 'ring-offset-[#080B0D]');
        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-[#16A085]', 'ring-offset-2', 'ring-offset-[#080B0D]');
        }, 2500);
      }
    }, 150);
  }

  // Handle URL Query Params for direct deep-linking
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const focusParam = searchParams.get('focus');
    if (tabParam === 'banking' || tabParam === 'profile' || tabParam === 'team') {
      setActiveTab(tabParam);
    }
    if (focusParam) {
      setTimeout(() => {
        const el = document.getElementById(focusParam);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
          el.classList.add('ring-2', 'ring-[#16A085]', 'ring-offset-2', 'ring-offset-[#080B0D]');
          setTimeout(() => {
            el.classList.remove('ring-2', 'ring-[#16A085]', 'ring-offset-2', 'ring-offset-[#080B0D]');
          }, 2500);
        }
      }, 300);
    }
  }, [searchParams]);

  // Load Business Profile
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await businessService.getBusinessProfile();
        setProfile(data);
        setName(data.name || '');
        setPhone(data.phone || '');
        setIndustry(data.industry || 'NDIS Support Worker');
        setAbn(data.abn || '');
        setBsb(data.bsb || '');
        setAccountNumber(data.accountNumber || '');
        setAccountName(data.accountName || data.name || '');
        setBankName(data.bankName || '');
        setInvoicePrefix(data.invoicePrefix || 'INV');
        setIsGstRegistered(data.isGstRegistered || false);
        setAddress(data.address || '');
        setSuburb(data.suburb || '');
        setState(data.state || 'NSW');
        setPostcode(data.postcode || '');
      } catch (err: any) {
        if (err?.response?.status !== 401) {
          toast.error(getApiErrorMessage(err, 'Failed to load business profile.'));
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Load Team Members when Team tab is selected
  useEffect(() => {
    if (activeTab === 'team' && user?.role === 'OWNER') {
      businessService
        .listTeamMembers()
        .then((res) => setTeamMembers(res.records))
        .catch((err) => toast.error(getApiErrorMessage(err, 'Could not load team.')));
    }
  }, [activeTab, user?.role]);

  // Real-time ABN Checksum Evaluation (ATO Modulo-89)
  const abnStatus = useMemo(() => {
    if (!abn) return { isValid: false, message: 'Add your 11-digit ABN for valid tax invoicing.' };
    const digits = abn.replace(/\D/g, '');
    if (digits.length !== 11) {
      return { isValid: false, message: `ABN must be 11 digits (${digits.length}/11 entered).` };
    }
    const isValid = validateAbnClient(digits);
    return {
      isValid,
      message: isValid ? 'Valid ATO Modulo-89 Verified ABN' : 'Invalid ABN checksum according to ATO Modulo-89 algorithm',
    };
  }, [abn]);

  // Real-time BSB Bank Name Auto-Detection
  const detectedBank = useMemo(() => {
    if (!bsb) return null;
    const digits = bsb.replace(/\D/g, '');
    if (digits.length < 2) return null;
    const prefix = digits.slice(0, 2);
    const bankMap: Record<string, string> = {
      '01': 'ANZ Banking Group',
      '02': 'ANZ Banking Group',
      '03': 'Westpac Banking Corporation',
      '73': 'Westpac Banking Corporation',
      '06': 'Commonwealth Bank of Australia (CBA)',
      '07': 'Commonwealth Bank of Australia (CBA)',
      '08': 'National Australia Bank (NAB)',
      '09': 'National Australia Bank (NAB)',
      '11': 'St. George Bank / BankSA / Bank of Melbourne',
      '18': 'Macquarie Bank',
      '48': 'Suncorp Bank',
      '91': 'ING Bank Australia',
      '92': 'Bendigo and Adelaide Bank',
      '94': 'AMP Bank',
    };
    return bankMap[prefix] || 'Australian Financial Institution';
  }, [bsb]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (user?.role !== 'OWNER') {
      toast.error('Only the Business Owner can update organization settings.');
      return;
    }

    try {
      setIsSaving(true);
      const updated = await businessService.updateBusinessProfile({
        name,
        phone,
        industry,
        abn: abn || undefined,
        bsb: bsb || undefined,
        accountNumber: accountNumber || undefined,
        accountName: accountName || undefined,
        bankName: bankName || detectedBank || undefined,
        invoicePrefix,
        isGstRegistered,
        address: address || undefined,
        suburb: suburb || undefined,
        state: state as any,
        postcode: postcode || undefined,
      });

      setProfile(updated);
      toast.success('Business settings & compliance profile updated successfully.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to save settings.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleInviteMember(e: React.FormEvent) {
    e.preventDefault();
    try {
      setIsInviting(true);
      const newMember = await businessService.inviteTeamMember({
        email: inviteEmail,
        firstName: inviteFirstName,
        lastName: inviteLastName,
        role: inviteRole,
      });
      setTeamMembers((prev) => [newMember, ...prev]);
      toast.success(`Invitation email dispatched to ${inviteEmail}.`);
      setIsInviteModalOpen(false);
      setInviteEmail('');
      setInviteFirstName('');
      setInviteLastName('');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to invite team member.'));
    } finally {
      setIsInviting(false);
    }
  }

  async function handleToggleSuspend(member: TeamMember) {
    try {
      if (member.status === 'SUSPENDED') {
        await businessService.reactivateTeamMember(member.id);
        toast.success(`${member.firstName} reactivated.`);
        setTeamMembers((prev) =>
          prev.map((m) => (m.id === member.id ? { ...m, status: 'ACTIVE' } : m))
        );
      } else {
        await businessService.suspendTeamMember(member.id);
        toast.success(`${member.firstName} suspended.`);
        setTeamMembers((prev) =>
          prev.map((m) => (m.id === member.id ? { ...m, status: 'SUSPENDED' } : m))
        );
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  if (isLoading) {
    return (
      <AppLayout title="Business Settings & Compliance" subtitle="Loading organization profile...">
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-[#5EE0C1]" />
        </div>
      </AppLayout>
    );
  }

  const compliance = profile?.compliance;

  return (
    <AppLayout
      title="Business Profile & Banking"
      subtitle="Australian Sole-Trader Compliance, ABN, BSB & NDIS Tax Invoicing Settings"
    >
      <div className="space-y-6">
        {/* Pre-Flight Compliance Shield Readiness Card */}
        <div
          className={`rounded-2xl border p-6 shadow-glow transition-all ${
            compliance?.isCompliant
              ? 'border-[#166534] bg-gradient-to-r from-[#0B2B1B] via-[#0D332D] to-[#0A0F10]'
              : 'border-[#92400E] bg-gradient-to-r from-[#2A210B] via-[#1D1708] to-[#0A0F10]'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`rounded-xl p-2.5 ${
                  compliance?.isCompliant
                    ? 'bg-[#0D332D] text-[#22C55E] border border-[#166534]'
                    : 'bg-[#382D0F] text-[#F59E0B] border border-[#92400E]'
                }`}
              >
                {compliance?.isCompliant ? (
                  <ShieldCheck className="h-7 w-7" />
                ) : (
                  <AlertTriangle className="h-7 w-7" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-[#F1F5F4]">
                    Pre-Flight Auto-Rejection Shield Readiness
                  </h3>
                  <Badge variant={compliance?.isCompliant ? 'success' : 'warning'}>
                    {compliance?.readinessPercentage || 0}% Ready
                  </Badge>
                </div>
                <p className="text-xs text-[#9AA9A5] mt-1 max-w-2xl">
                  {compliance?.isCompliant
                    ? 'All mandatory Australian Tax Office (ATO) and NDIA parameters are satisfied. Your invoices will pass Plan Manager validation with zero rejections.'
                    : 'Complete your ABN, banking EFT remittance, and business address to unlock rejection-free automated invoice dispatch.'}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Compliance Checklist Items with Direct Quick Fill */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-4 border-t border-[#253130]">
            {/* 1. ABN */}
            <button
              type="button"
              onClick={() => jumpToField('profile', 'abn-input')}
              className={`flex items-center justify-between gap-2 rounded-xl p-2.5 border transition-all text-left group ${
                compliance?.checklist.abn
                  ? 'border-[#166534]/50 bg-[#0B2B1B]/40 hover:border-[#22C55E]'
                  : 'border-[#EF4444]/40 bg-[#2A1212]/60 hover:border-[#EF4444] shadow-sm hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-center gap-2">
                {compliance?.checklist.abn ? (
                  <CheckCircle2 className="h-4 w-4 text-[#22C55E] shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-[#EF4444] shrink-0" />
                )}
                <div>
                  <span className={`text-xs font-semibold block ${compliance?.checklist.abn ? 'text-[#F1F5F4]' : 'text-[#FCA5A5]'}`}>
                    11-Digit ABN
                  </span>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors shrink-0 ${
                compliance?.checklist.abn
                  ? 'bg-[#166534]/40 text-[#5EE0C1] group-hover:bg-[#166534]'
                  : 'bg-[#EF4444] text-white animate-pulse group-hover:bg-[#DC2626]'
              }`}>
                {compliance?.checklist.abn ? 'Edit' : '+ Fill Now'}
              </span>
            </button>

            {/* 2. BSB & Bank */}
            <button
              type="button"
              onClick={() => jumpToField('banking', 'bsb-input')}
              className={`flex items-center justify-between gap-2 rounded-xl p-2.5 border transition-all text-left group ${
                compliance?.checklist.bankDetails
                  ? 'border-[#166534]/50 bg-[#0B2B1B]/40 hover:border-[#22C55E]'
                  : 'border-[#EF4444]/40 bg-[#2A1212]/60 hover:border-[#EF4444] shadow-sm hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-center gap-2">
                {compliance?.checklist.bankDetails ? (
                  <CheckCircle2 className="h-4 w-4 text-[#22C55E] shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-[#EF4444] shrink-0" />
                )}
                <div>
                  <span className={`text-xs font-semibold block ${compliance?.checklist.bankDetails ? 'text-[#F1F5F4]' : 'text-[#FCA5A5]'}`}>
                    BSB & Account
                  </span>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors shrink-0 ${
                compliance?.checklist.bankDetails
                  ? 'bg-[#166534]/40 text-[#5EE0C1] group-hover:bg-[#166534]'
                  : 'bg-[#EF4444] text-white animate-pulse group-hover:bg-[#DC2626]'
              }`}>
                {compliance?.checklist.bankDetails ? 'Edit' : '+ Fill Now'}
              </span>
            </button>

            {/* 3. Physical Address */}
            <button
              type="button"
              onClick={() => jumpToField('profile', 'address-input')}
              className={`flex items-center justify-between gap-2 rounded-xl p-2.5 border transition-all text-left group ${
                compliance?.checklist.businessAddress
                  ? 'border-[#166534]/50 bg-[#0B2B1B]/40 hover:border-[#22C55E]'
                  : 'border-[#EF4444]/40 bg-[#2A1212]/60 hover:border-[#EF4444] shadow-sm hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-center gap-2">
                {compliance?.checklist.businessAddress ? (
                  <CheckCircle2 className="h-4 w-4 text-[#22C55E] shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-[#EF4444] shrink-0" />
                )}
                <div>
                  <span className={`text-xs font-semibold block ${compliance?.checklist.businessAddress ? 'text-[#F1F5F4]' : 'text-[#FCA5A5]'}`}>
                    Physical Address
                  </span>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors shrink-0 ${
                compliance?.checklist.businessAddress
                  ? 'bg-[#166534]/40 text-[#5EE0C1] group-hover:bg-[#166534]'
                  : 'bg-[#EF4444] text-white animate-pulse group-hover:bg-[#DC2626]'
              }`}>
                {compliance?.checklist.businessAddress ? 'Edit' : '+ Fill Now'}
              </span>
            </button>

            {/* 4. Contact Details */}
            <button
              type="button"
              onClick={() => jumpToField('profile', 'phone-input')}
              className={`flex items-center justify-between gap-2 rounded-xl p-2.5 border transition-all text-left group ${
                compliance?.checklist.contactInfo
                  ? 'border-[#166534]/50 bg-[#0B2B1B]/40 hover:border-[#22C55E]'
                  : 'border-[#EF4444]/40 bg-[#2A1212]/60 hover:border-[#EF4444] shadow-sm hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-center gap-2">
                {compliance?.checklist.contactInfo ? (
                  <CheckCircle2 className="h-4 w-4 text-[#22C55E] shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-[#EF4444] shrink-0" />
                )}
                <div>
                  <span className={`text-xs font-semibold block ${compliance?.checklist.contactInfo ? 'text-[#F1F5F4]' : 'text-[#FCA5A5]'}`}>
                    Contact Details
                  </span>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors shrink-0 ${
                compliance?.checklist.contactInfo
                  ? 'bg-[#166534]/40 text-[#5EE0C1] group-hover:bg-[#166534]'
                  : 'bg-[#EF4444] text-white animate-pulse group-hover:bg-[#DC2626]'
              }`}>
                {compliance?.checklist.contactInfo ? 'Edit' : '+ Fill Now'}
              </span>
            </button>

            {/* 5. Invoice Prefix */}
            <button
              type="button"
              onClick={() => jumpToField('profile', 'invoice-prefix-input')}
              className={`flex items-center justify-between gap-2 rounded-xl p-2.5 border transition-all text-left group ${
                compliance?.checklist.invoicePrefix
                  ? 'border-[#166534]/50 bg-[#0B2B1B]/40 hover:border-[#22C55E]'
                  : 'border-[#EF4444]/40 bg-[#2A1212]/60 hover:border-[#EF4444] shadow-sm hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-center gap-2">
                {compliance?.checklist.invoicePrefix ? (
                  <CheckCircle2 className="h-4 w-4 text-[#22C55E] shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-[#EF4444] shrink-0" />
                )}
                <div>
                  <span className={`text-xs font-semibold block ${compliance?.checklist.invoicePrefix ? 'text-[#F1F5F4]' : 'text-[#FCA5A5]'}`}>
                    Invoice Prefix
                  </span>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors shrink-0 ${
                compliance?.checklist.invoicePrefix
                  ? 'bg-[#166534]/40 text-[#5EE0C1] group-hover:bg-[#166534]'
                  : 'bg-[#EF4444] text-white animate-pulse group-hover:bg-[#DC2626]'
              }`}>
                {compliance?.checklist.invoicePrefix ? 'Edit' : '+ Fill Now'}
              </span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#253130] gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-all ${
              activeTab === 'profile'
                ? 'border-[#16A085] text-[#5EE0C1]'
                : 'border-transparent text-[#9AA9A5] hover:text-[#F1F5F4]'
            }`}
          >
            <Building2 className="h-4 w-4" />
            Business Profile & ABN
          </button>
          <button
            onClick={() => setActiveTab('banking')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-all ${
              activeTab === 'banking'
                ? 'border-[#16A085] text-[#5EE0C1]'
                : 'border-transparent text-[#9AA9A5] hover:text-[#F1F5F4]'
            }`}
          >
            <Landmark className="h-4 w-4" />
            Banking & EFT Remittance
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-all ${
              activeTab === 'team'
                ? 'border-[#16A085] text-[#5EE0C1]'
                : 'border-transparent text-[#9AA9A5] hover:text-[#F1F5F4]'
            }`}
          >
            <Users className="h-4 w-4" />
            Team Management
          </button>
        </div>

        {/* Tab 1: Business Profile & Tax Settings */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <Card className="p-6 space-y-5">
              <div>
                <h4 className="text-base font-semibold text-[#F1F5F4]">Sole-Trader Entity Details</h4>
                <p className="text-xs text-[#9AA9A5]">
                  This information appears on the header of all generated Australian NDIS Tax Invoices.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  id="name-input"
                  label="Business Legal / Trading Name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Liam Support Services"
                  required
                />
                <Input
                  id="phone-input"
                  label="Contact Phone Number *"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0412 345 678"
                  helperText="Australian mobile or landline for Plan Manager remittances."
                />
                <Input
                  label="Registered Account Email"
                  value={profile?.email || ''}
                  disabled
                  helperText="Primary email used for billing and system notifications."
                />
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#9AA9A5]">Industry / Support Niche</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full rounded-lg bg-[#0E1617] border border-[#253130] px-3.5 py-2.5 text-sm text-[#F1F5F4] focus:border-[#16A085] focus:outline-none"
                  >
                    <option value="NDIS Support Worker">NDIS Independent Support Worker</option>
                    <option value="Independent Carer">Independent Carer</option>
                    <option value="Allied Health Assistant">Allied Health Assistant (AHA)</option>
                    <option value="Specialist Cleaner">NDIS Domestic / Cleaning Services</option>
                    <option value="Support Coordinator">Independent Support Coordinator</option>
                  </select>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-5">
              <div>
                <h4 className="text-base font-semibold text-[#F1F5F4]">Australian Taxation & Invoicing Configuration</h4>
                <p className="text-xs text-[#9AA9A5]">
                  Mandatory ATO tax rules. Non-registered sole traders issue tax invoices stating $0.00 GST.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Input
                    id="abn-input"
                    label="Australian Business Number (ABN) *"
                    value={abn}
                    onChange={(e) => setAbn(e.target.value)}
                    placeholder="e.g. 51 824 753 556"
                    helperText={abnStatus.message}
                  />
                  {abn && (
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      {abnStatus.isValid ? (
                        <span className="text-[#22C55E] flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> ATO Modulo-89 Checksum Verified
                        </span>
                      ) : (
                        <span className="text-[#EF4444] flex items-center gap-1">
                          <XCircle className="h-3.5 w-3.5" /> Invalid ABN Checksum
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <Input
                  id="invoice-prefix-input"
                  label="Sequential Invoice Prefix"
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value.toUpperCase())}
                  placeholder="INV"
                  helperText="Prefix for auto-generated invoices (e.g. INV-001, LSW-001)."
                />
              </div>

              {/* GST Toggle */}
              <div className="flex items-center justify-between rounded-xl bg-[#0E1617] border border-[#253130] p-4">
                <div className="space-y-0.5">
                  <span className="text-sm font-semibold text-[#F1F5F4]">
                    GST Registered Sole Trader
                  </span>
                  <p className="text-xs text-[#9AA9A5] max-w-xl">
                    Under ATO guidelines, most NDIS Core and Capacity Building support services are GST-free. If not registered, Rayvice automatically sets GST to $0.00.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isGstRegistered}
                  onChange={(e) => setIsGstRegistered(e.target.checked)}
                  className="h-5 w-5 rounded border-[#253130] bg-[#0E1617] text-[#16A085] focus:ring-[#16A085] cursor-pointer"
                />
              </div>
            </Card>

            <Card className="p-6 space-y-5">
              <div>
                <h4 className="text-base font-semibold text-[#F1F5F4]">Physical Business Location</h4>
                <p className="text-xs text-[#9AA9A5]">
                  Required by Australian Tax Office for valid tax invoice issuance.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    id="address-input"
                    label="Street Address *"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 123 George Street"
                  />
                </div>
                <Input
                  id="suburb-input"
                  label="Suburb / City *"
                  value={suburb}
                  onChange={(e) => setSuburb(e.target.value)}
                  placeholder="e.g. Sydney"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#9AA9A5]">State *</label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full rounded-lg bg-[#0E1617] border border-[#253130] px-3 py-2.5 text-sm text-[#F1F5F4] focus:border-[#16A085] focus:outline-none"
                    >
                      {AUSTRALIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Input
                    id="postcode-input"
                    label="Postcode *"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    placeholder="2000"
                    maxLength={4}
                  />
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button variant="primary" type="submit" isLoading={isSaving} className="shadow-glow flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Business Profile
              </Button>
            </div>
          </form>
        )}

        {/* Tab 2: Banking & EFT Remittance */}
        {activeTab === 'banking' && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <Card className="p-6 space-y-5">
              <div>
                <h4 className="text-base font-semibold text-[#F1F5F4]">Direct EFT Bank Remittance Details</h4>
                <p className="text-xs text-[#9AA9A5]">
                  Plan Managers use these banking credentials to process direct Electronic Funds Transfer (EFT) payments into your bank account.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Input
                    id="bsb-input"
                    label="Bank State Branch (BSB) Code *"
                    value={bsb}
                    onChange={(e) => setBsb(e.target.value)}
                    placeholder="e.g. 062-000"
                    maxLength={7}
                    helperText="6-digit Australian BSB format (e.g. 062-000)."
                  />
                  {detectedBank && (
                    <div className="flex items-center gap-1.5 text-xs text-[#5EE0C1] font-medium bg-[#0D332D] p-2 rounded-lg border border-[#117A65]">
                      <Landmark className="h-3.5 w-3.5" />
                      Detected: {detectedBank}
                    </div>
                  )}
                </div>

                <Input
                  id="account-number-input"
                  label="Bank Account Number *"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 12345678"
                  maxLength={9}
                  helperText="6 to 9 numeric digits."
                />

                <Input
                  id="account-name-input"
                  label="Account Holder Name *"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g. Liam Support Services"
                  helperText="Name registered with your Australian bank."
                />

                <Input
                  label="Bank Name (Optional Override)"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder={detectedBank || 'e.g. Commonwealth Bank of Australia'}
                />
              </div>
            </Card>

            <div className="flex justify-end">
              <Button variant="primary" type="submit" isLoading={isSaving} className="shadow-glow flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Banking Details
              </Button>
            </div>
          </form>
        )}

        {/* Tab 3: Team Management */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-semibold text-[#F1F5F4]">Organization Team Members</h4>
                <p className="text-xs text-[#9AA9A5]">
                  Invite bookkeepers, office managers, or secondary support workers into your business.
                </p>
              </div>
              {user?.role === 'OWNER' && (
                <Button
                  variant="primary"
                  size="sm"
                  className="shadow-glow flex items-center gap-2"
                  onClick={() => setIsInviteModalOpen(true)}
                >
                  <UserPlus className="h-4 w-4" />
                  Invite Team Member
                </Button>
              )}
            </div>

            <Card className="overflow-hidden border border-[#253130]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#F1F5F4]">
                  <thead className="border-b border-[#253130] bg-[#0A0F10] text-[#9AA9A5] uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3">Member</th>
                      <th className="px-5 py-3">Role</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#253130]">
                    {teamMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-[#182122]/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-medium text-[#F1F5F4]">
                            {member.firstName} {member.lastName}
                          </div>
                          <div className="text-[11px] text-[#9AA9A5]">{member.email}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="rounded bg-[#0D332D] px-2 py-0.5 text-[11px] font-semibold text-[#5EE0C1] border border-[#117A65]">
                            {member.role === 'OWNER'
                              ? 'Owner'
                              : member.role === 'OFFICE_MANAGER'
                              ? 'Office Manager'
                              : 'Support Worker'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge
                            variant={
                              member.status === 'ACTIVE'
                                ? 'success'
                                : member.status === 'INVITED'
                                ? 'warning'
                                : 'danger'
                            }
                          >
                            {member.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {member.role !== 'OWNER' && user?.role === 'OWNER' && (
                            <button
                              onClick={() => handleToggleSuspend(member)}
                              className="text-xs font-semibold text-[#EF4444] hover:underline"
                            >
                              {member.status === 'SUSPENDED' ? 'Reactivate' : 'Suspend'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Team Member"
        description="Send an onboarding invitation link to a colleague or support worker."
      >
        <form onSubmit={handleInviteMember} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name *"
              value={inviteFirstName}
              onChange={(e) => setInviteFirstName(e.target.value)}
              required
            />
            <Input
              label="Last Name *"
              value={inviteLastName}
              onChange={(e) => setInviteLastName(e.target.value)}
              required
            />
          </div>
          <Input
            label="Email Address *"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@example.com.au"
            required
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#9AA9A5]">Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as any)}
              className="w-full rounded-lg bg-[#0E1617] border border-[#253130] px-3.5 py-2.5 text-sm text-[#F1F5F4] focus:border-[#16A085] focus:outline-none"
            >
              <option value="OFFICE_MANAGER">Office Manager (Billing & Invoicing Access)</option>
              <option value="TECHNICIAN">Support Worker (Shift Logging & Timesheets)</option>
            </select>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isInviting}>
              Dispatch Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <AppLayout title="Business Settings & Compliance" subtitle="Loading organization profile...">
          <div className="flex h-64 items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-[#5EE0C1]" />
          </div>
        </AppLayout>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
