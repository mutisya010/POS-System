import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Switch,
  useWindowDimensions,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePOS } from '../context/POSContext';
import { triggerFeedback } from '../utils/sound';

export type StaffRole =
  | 'Store Manager'
  | 'Cashier Lead'
  | 'Cashier'
  | 'Inventory Mgr'
  | 'Accountant'
  | 'Super Admin';

export interface StaffMemberRecord {
  id: string;
  name: string;
  empId: string;
  contractType: string;
  role: StaffRole;
  phone: string;
  email: string;
  station: string;
  status: 'On Shift' | 'Active' | 'On Break' | 'Off Duty';
  lastActive: string;
  avatar: string;
  roleTier: string;
}

interface RolePermissions {
  // POS Terminal & Sales (4 rules)
  processSales: boolean;
  issueDiscounts: boolean;
  voidTransactions: boolean;
  manualDrawerPop: boolean;

  // Inventory & Products (3 rules)
  viewInventory: boolean;
  adjustStock: boolean;
  modifyPrices: boolean;

  // Shift Logs & Financials (2 rules)
  printReports: boolean;
  viewMarginCogs: boolean;
}

const DEFAULT_ROLE_PERMISSIONS: Record<string, RolePermissions> = {
  'Cashier (Standard Lane)': {
    processSales: true,
    issueDiscounts: false,
    voidTransactions: false,
    manualDrawerPop: true,
    viewInventory: true,
    adjustStock: false,
    modifyPrices: false,
    printReports: true,
    viewMarginCogs: false,
  },
  'Cashier Lead': {
    processSales: true,
    issueDiscounts: true,
    voidTransactions: true,
    manualDrawerPop: true,
    viewInventory: true,
    adjustStock: false,
    modifyPrices: false,
    printReports: true,
    viewMarginCogs: false,
  },
  'Store Manager': {
    processSales: true,
    issueDiscounts: true,
    voidTransactions: true,
    manualDrawerPop: true,
    viewInventory: true,
    adjustStock: true,
    modifyPrices: true,
    printReports: true,
    viewMarginCogs: true,
  },
  'Inventory Mgr': {
    processSales: false,
    issueDiscounts: false,
    voidTransactions: false,
    manualDrawerPop: false,
    viewInventory: true,
    adjustStock: true,
    modifyPrices: false,
    printReports: false,
    viewMarginCogs: true,
  },
  'Super Admin': {
    processSales: true,
    issueDiscounts: true,
    voidTransactions: true,
    manualDrawerPop: true,
    viewInventory: true,
    adjustStock: true,
    modifyPrices: true,
    printReports: true,
    viewMarginCogs: true,
  },
};

const INITIAL_STAFF_RECORDS: StaffMemberRecord[] = [
  {
    id: 'emp-101',
    name: 'John Doe',
    empId: 'EMP-101',
    contractType: 'Permanent',
    role: 'Store Manager',
    phone: '0722 123 456',
    email: 'john.doe@landmarkstores.co.ke',
    station: 'Register #01 (NBO)',
    status: 'On Shift',
    lastActive: 'Just now',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
    roleTier: 'Manager',
  },
  {
    id: 'emp-104',
    name: 'Mercy Chebet',
    empId: 'EMP-104',
    contractType: 'Full-Time',
    role: 'Cashier Lead',
    phone: '0721 345 890',
    email: 'mercy.c@landmarkstores.co.ke',
    station: 'Lane #02 (NBO)',
    status: 'On Shift',
    lastActive: '3 mins ago',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&q=80',
    roleTier: 'Cashier',
  },
  {
    id: 'emp-108',
    name: 'Kelvin Mwangi',
    empId: 'EMP-108',
    contractType: 'Shift Staff',
    role: 'Cashier',
    phone: '0700 882 199',
    email: 'kelvin.m@landmarkstores.co.ke',
    station: 'Lane #03 (NBO)',
    status: 'On Shift',
    lastActive: '14 mins ago',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80',
    roleTier: 'Cashier',
  },
  {
    id: 'emp-112',
    name: 'Faith Achieng',
    empId: 'EMP-112',
    contractType: 'Lead Ops',
    role: 'Inventory Mgr',
    phone: '0733 445 566',
    email: 'faith.a@landmarkstores.co.ke',
    station: 'Central Warehouse',
    status: 'Active',
    lastActive: '1 hour ago',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&q=80',
    roleTier: 'Inventory & Audit',
  },
  {
    id: 'emp-115',
    name: 'Brian Ochieng',
    empId: 'EMP-115',
    contractType: 'Finance',
    role: 'Accountant',
    phone: '0711 987 234',
    email: 'brian.o@landmarkstores.co.ke',
    station: 'HQ Finance Desk',
    status: 'Active',
    lastActive: '3 hours ago',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80',
    roleTier: 'Inventory & Audit',
  },
  {
    id: 'emp-100',
    name: 'Grace Njeri',
    empId: 'EMP-100',
    contractType: 'Executive',
    role: 'Super Admin',
    phone: '0799 112 233',
    email: 'grace.njeri@landmarkstores.co.ke',
    station: 'Executive Suite',
    status: 'Active',
    lastActive: 'Yesterday',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&q=80',
    roleTier: 'Super Admin',
  },
];

const SECURITY_AUDIT_LOGS = [
  { id: 'sec-1', time: '14:42:10 EAT', staff: 'John Doe (#402)', action: 'Cash Drawer Manual Pop', lane: 'Lane #01', status: 'Authorized' },
  { id: 'sec-2', time: '14:15:32 EAT', staff: 'Kelvin Mwangi (#108)', action: 'Supervisor Override Requested', lane: 'Lane #03', status: 'Approved by Mgr' },
  { id: 'sec-3', time: '13:58:04 EAT', staff: 'Mercy Chebet (#104)', action: 'Item Void (KSh 350.00)', lane: 'Lane #02', status: 'Logged' },
  { id: 'sec-4', time: '11:22:18 EAT', staff: 'Faith Achieng (#112)', action: 'Bulk Stock Write-off (+24 units)', lane: 'Central Warehouse', status: 'Audit Flagged' },
  { id: 'sec-5', time: '07:02:11 EAT', staff: 'John Doe (#402)', action: 'Register Lane #01 Shift Open (Float KSh 10,000)', lane: 'Register #01', status: 'Success' },
];

export const UsersScreen: React.FC = () => {
  const { theme } = usePOS();
  const { width } = useWindowDimensions();
  const isWide = width >= 1180;

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterPill, setSelectedFilterPill] = useState<
    'All Team' | 'On Duty Now' | 'Cashiers' | 'Managers' | 'Inventory & Audit'
  >('All Team');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All');
  const [branchFilter, setBranchFilter] = useState('Nairobi Flagship');

  // Staff records state
  const [staffList, setStaffList] = useState<StaffMemberRecord[]>(INITIAL_STAFF_RECORDS);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('emp-101');

  // Permissions Matrix configuration state
  const [configuredRole, setConfiguredRole] = useState('Cashier (Standard Lane)');
  const [permissions, setPermissions] = useState<RolePermissions>(
    DEFAULT_ROLE_PERMISSIONS['Cashier (Standard Lane)']
  );
  const [matrixSaved, setMatrixSaved] = useState(false);

  // Quick Enroll Staff form state
  const [enrollName, setEnrollName] = useState('');
  const [enrollEmail, setEnrollEmail] = useState('');
  const [enrollPhone, setEnrollPhone] = useState('');
  const [enrollRole, setEnrollRole] = useState<StaffRole>('Cashier');
  const [enrollStation, setEnrollStation] = useState('Lane #04 (Nairobi Flagship)');
  const [autoGenPin, setAutoGenPin] = useState(true);

  // Audit Log Modal
  const [isAuditModalVisible, setIsAuditModalVisible] = useState(false);

  // Handler for Role configuration change
  const handleSelectRoleForMatrix = (roleName: string) => {
    triggerFeedback.tap();
    setConfiguredRole(roleName);
    setPermissions(DEFAULT_ROLE_PERMISSIONS[roleName] || DEFAULT_ROLE_PERMISSIONS['Cashier (Standard Lane)']);
  };

  // Toggle single permission
  const handleTogglePermission = (key: keyof RolePermissions) => {
    triggerFeedback.tap();
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Reset defaults
  const handleResetMatrix = () => {
    triggerFeedback.warning();
    setPermissions(
      DEFAULT_ROLE_PERMISSIONS[configuredRole] || DEFAULT_ROLE_PERMISSIONS['Cashier (Standard Lane)']
    );
  };

  // Save matrix
  const handleSaveMatrix = () => {
    triggerFeedback.success();
    setMatrixSaved(true);
    setTimeout(() => setMatrixSaved(false), 2500);
  };

  // Quick Enroll Staff
  const handleEnrollStaff = () => {
    if (!enrollName.trim()) {
      triggerFeedback.warning();
      Alert.alert('Missing Field', 'Please provide employee full legal name.');
      return;
    }

    triggerFeedback.success();
    const newEmpId = `EMP-${Math.floor(120 + Math.random() * 80)}`;
    const newRecord: StaffMemberRecord = {
      id: `emp-${Date.now()}`,
      name: enrollName.trim(),
      empId: newEmpId,
      contractType: 'Full-Time',
      role: enrollRole,
      phone: enrollPhone.trim() || '0712 000 000',
      email: enrollEmail.trim() || `${enrollName.trim().toLowerCase().replace(/\s+/g, '.')}@landmarkstores.co.ke`,
      station: enrollStation,
      status: 'On Shift',
      lastActive: 'Just now',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&q=80',
      roleTier: enrollRole === 'Store Manager' ? 'Managers' : enrollRole.includes('Cashier') ? 'Cashiers' : 'Inventory & Audit',
    };

    setStaffList((prev) => [newRecord, ...prev]);
    setSelectedStaffId(newRecord.id);

    Alert.alert(
      'Staff Credentials Issued',
      `Employee ${newRecord.name} enrolled with ID ${newRecord.empId}. 4-digit POS PIN has been dispatched via Safaricom SMS to ${newRecord.phone}.`
    );

    // Reset Form
    setEnrollName('');
    setEnrollEmail('');
    setEnrollPhone('');
  };

  // Export Roster
  const handleExportRoster = () => {
    triggerFeedback.tap();
    const csvContent =
      'ID,Name,Role,Station,Phone,Email,Status,Last Active\n' +
      staffList
        .map(
          (s) =>
            `${s.empId},"${s.name}","${s.role}","${s.station}","${s.phone}","${s.email}","${s.status}","${s.lastActive}"`
        )
        .join('\n');

    if (Platform.OS === 'web') {
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Landmark_Staff_Roster_Nairobi.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      Alert.alert('Roster Exported', 'Staff roster CSV ready for download.');
    }
  };

  // Filtered staff list
  const filteredStaff = staffList.filter((staff) => {
    const matchSearch =
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.phone.includes(searchQuery) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchRole =
      roleFilter === 'All Roles' ||
      staff.role.toLowerCase() === roleFilter.toLowerCase();

    const matchStatus =
      statusFilter === 'All' ||
      (statusFilter === 'On Shift' && staff.status === 'On Shift') ||
      (statusFilter === 'Active' && staff.status === 'Active');

    const matchPill =
      selectedFilterPill === 'All Team' ||
      (selectedFilterPill === 'On Duty Now' && staff.status === 'On Shift') ||
      (selectedFilterPill === 'Cashiers' && staff.role.includes('Cashier')) ||
      (selectedFilterPill === 'Managers' && (staff.role.includes('Manager') || staff.role.includes('Admin'))) ||
      (selectedFilterPill === 'Inventory & Audit' && (staff.role.includes('Inventory') || staff.role.includes('Accountant')));

    return matchSearch && matchRole && matchStatus && matchPill;
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header & Quick Actions */}
      <View style={styles.headerRow}>
        <View style={styles.titleColumn}>
          <View style={styles.titleWithIconRow}>
            <View style={[styles.headerIconSquare, { backgroundColor: '#E8F6F5' }]}>
              <Ionicons name="people" size={20} color="#006A66" />
            </View>
            <Text style={[styles.mainHeading, { color: theme.textPrimary }]}>
              Users & Staff Management
            </Text>
          </View>
          <Text style={[styles.subText, { color: theme.textSecondary }]}>
            Manage employee credentials, system roles, lane shift access, and granular POS permissions
            across Landmark store branches in real time.
          </Text>
        </View>

        <View style={styles.headerBtnGroup}>
          <TouchableOpacity
            style={[styles.btnOutline, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}
            onPress={() => {
              triggerFeedback.tap();
              setIsAuditModalVisible(true);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="shield-checkmark-outline" size={15} color="#263238" />
            <Text style={[styles.btnOutlineText, { color: '#263238' }]}>Security Audit Log</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnOutline, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}
            onPress={handleExportRoster}
            activeOpacity={0.8}
          >
            <Ionicons name="download-outline" size={15} color="#263238" />
            <Text style={[styles.btnOutlineText, { color: '#263238' }]}>Export Staff Roster</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnPrimary, { backgroundColor: '#006A66' }]}
            onPress={() => {
              triggerFeedback.tap();
              Alert.alert('New User Registration', 'Use the Quick Enroll Staff panel on the right rail.');
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="person-add-outline" size={16} color="#FFFFFF" />
            <Text style={styles.btnPrimaryText}>+ Add New User</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. KPI Summary Cards (4 Columns) */}
      <View style={styles.kpiGrid}>
        {/* Card 1: Total Users & Staff */}
        <View style={[styles.kpiCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
          <View style={styles.kpiTopRow}>
            <Text style={styles.kpiLabel}>TOTAL USERS & STAFF</Text>
            <View style={[styles.kpiIconCircle, { backgroundColor: '#E8F6F5' }]}>
              <Ionicons name="people-outline" size={18} color="#006A66" />
            </View>
          </View>
          <Text style={[styles.kpiValue, { color: theme.textPrimary }]}>28</Text>
          <View style={styles.kpiFooterRow}>
            <View style={styles.trendRow}>
              <Ionicons name="trending-up" size={13} color="#32B67A" />
              <Text style={styles.trendTextGreen}>+2 joined this mo</Text>
            </View>
            <Text style={styles.kpiFooterMuted}>18 Floor • 10 HQ</Text>
          </View>
        </View>

        {/* Card 2: Active On Duty */}
        <View style={[styles.kpiCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
          <View style={styles.kpiTopRow}>
            <Text style={styles.kpiLabel}>ACTIVE ON DUTY</Text>
            <View style={[styles.kpiIconCircle, { backgroundColor: '#E3F0F8' }]}>
              <Ionicons name="time-outline" size={18} color="#006A66" />
            </View>
          </View>
          <View style={styles.valueWithBadgeRow}>
            <Text style={[styles.kpiValue, { color: theme.textPrimary }]}>12</Text>
            <View style={[styles.shiftBadge, { backgroundColor: '#E8F6F5' }]}>
              <Text style={styles.shiftBadgeText}>Shift A Morning</Text>
            </View>
          </View>
          <View style={styles.kpiFooterRow}>
            <View style={styles.dotTextRow}>
              <View style={styles.greenLiveDot} />
              <Text style={styles.kpiFooterTextBold}>Lanes 01-08 Active</Text>
            </View>
            <Text style={styles.kpiFooterMuted}>Nairobi Flagship</Text>
          </View>
        </View>

        {/* Card 3: Cashiers & Floor */}
        <View style={[styles.kpiCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
          <View style={styles.kpiTopRow}>
            <Text style={styles.kpiLabel}>CASHIERS & FLOOR</Text>
            <View style={[styles.kpiIconCircle, { backgroundColor: '#E8F6F5' }]}>
              <Ionicons name="calculator-outline" size={18} color="#006A66" />
            </View>
          </View>
          <Text style={[styles.kpiValue, { color: theme.textPrimary }]}>16</Text>
          <View style={styles.kpiFooterRow}>
            <View style={styles.trendRow}>
              <Ionicons name="checkmark-circle-outline" size={13} color="#006A66" />
              <Text style={styles.kpiFooterTextBold}>98.4% Accuracy</Text>
            </View>
            <Text style={styles.kpiFooterMuted}>Shift settlements</Text>
          </View>
        </View>

        {/* Card 4: Store Administrators */}
        <View style={[styles.kpiCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
          <View style={styles.kpiTopRow}>
            <Text style={styles.kpiLabel}>STORE ADMINISTRATORS</Text>
            <View style={[styles.kpiIconCircle, { backgroundColor: '#E3F0F8' }]}>
              <Ionicons name="shield-outline" size={18} color="#006A66" />
            </View>
          </View>
          <Text style={[styles.kpiValue, { color: theme.textPrimary }]}>4</Text>
          <View style={styles.kpiFooterRow}>
            <Text style={styles.kpiFooterTextBold}>1 Super • 3 Ops</Text>
            <Text style={styles.kpiFooterMuted}>MFA Enforced</Text>
          </View>
        </View>
      </View>

      {/* 3. Main Two-Column Structure */}
      <View style={[styles.mainLayout, isWide ? styles.mainLayoutWide : styles.mainLayoutStack]}>
        {/* Left Column: Staff Table & Filter Terminal */}
        <View style={isWide ? styles.leftColWide : styles.leftColStack}>
          {/* Filter Bar Row */}
          <View style={[styles.filterBarCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
            <View style={styles.filterInputsRow}>
              {/* Search Field */}
              <View style={[styles.searchBox, { borderColor: '#E8ECEF' }]}>
                <Ionicons name="search-outline" size={15} color="#6D7A78" />
                <TextInput
                  style={[styles.searchInput, { color: theme.textPrimary }]}
                  placeholder="Search staff by name, EMP ID..."
                  placeholderTextColor="#8A969B"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={16} color="#6D7A78" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Role Dropdown */}
              <View style={[styles.dropdownSelect, { borderColor: '#E8ECEF' }]}>
                <Text style={styles.dropdownSelectText}>Role: {roleFilter}</Text>
                <Ionicons name="chevron-down" size={14} color="#6D7A78" />
              </View>

              {/* Status Dropdown */}
              <View style={[styles.dropdownSelect, { borderColor: '#E8ECEF' }]}>
                <Text style={styles.dropdownSelectText}>Status: {statusFilter}</Text>
                <Ionicons name="chevron-down" size={14} color="#6D7A78" />
              </View>

              {/* Branch Dropdown */}
              <View style={[styles.dropdownSelect, { borderColor: '#E8ECEF' }]}>
                <Text style={styles.dropdownSelectText}>{branchFilter}</Text>
                <Ionicons name="chevron-down" size={14} color="#6D7A78" />
              </View>
            </View>

            {/* Filter Pills */}
            <View style={styles.pillsRow}>
              <Text style={styles.filterViewLabel}>FILTER VIEW:</Text>
              {(
                [
                  'All Team',
                  'On Duty Now',
                  'Cashiers',
                  'Managers',
                  'Inventory & Audit',
                ] as const
              ).map((pill) => {
                const isActive = selectedFilterPill === pill;
                const count =
                  pill === 'All Team'
                    ? 28
                    : pill === 'On Duty Now'
                    ? 12
                    : pill === 'Cashiers'
                    ? 16
                    : pill === 'Managers'
                    ? 4
                    : 8;

                return (
                  <TouchableOpacity
                    key={pill}
                    style={[
                      styles.filterPillBtn,
                      isActive
                        ? { backgroundColor: '#006A66', borderColor: '#006A66' }
                        : { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' },
                    ]}
                    onPress={() => {
                      triggerFeedback.tap();
                      setSelectedFilterPill(pill);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.filterPillBtnText,
                        { color: isActive ? '#FFFFFF' : '#263238' },
                        isActive && { fontFamily: 'Inter_700Bold' },
                      ]}
                    >
                      {pill} ({count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Staff Table */}
          <View style={[styles.tableCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.th, { flex: 2.2 }]}>STAFF MEMBER</Text>
              <Text style={[styles.th, { flex: 1.5 }]}>ROLE & TIER</Text>
              <Text style={[styles.th, { flex: 2 }]}>CONTACT</Text>
              <Text style={[styles.th, { flex: 1.8 }]}>STATION / LANE</Text>
              <Text style={[styles.th, { flex: 1.2 }]}>STATUS</Text>
              <Text style={[styles.th, { flex: 1.1 }]}>LAST ACTIVE</Text>
            </View>

            {filteredStaff.map((staff) => {
              const isSelected = selectedStaffId === staff.id;
              const isOnShift = staff.status === 'On Shift';
              const isSuperAdmin = staff.role === 'Super Admin';

              return (
                <TouchableOpacity
                  key={staff.id}
                  style={[
                    styles.tableRow,
                    isSelected && { backgroundColor: '#F4FAFF' },
                  ]}
                  onPress={() => {
                    triggerFeedback.tap();
                    setSelectedStaffId(staff.id);
                  }}
                  activeOpacity={0.7}
                >
                  {/* Staff Member Col */}
                  <View style={[styles.staffMemberCell, { flex: 2.2 }]}>
                    <Image source={{ uri: staff.avatar }} style={styles.avatarImg} />
                    <View>
                      <Text style={[styles.staffNameText, { color: theme.textPrimary }]}>
                        {staff.name}
                      </Text>
                      <Text style={styles.empIdSub}>
                        {staff.empId} • {staff.contractType}
                      </Text>
                    </View>
                  </View>

                  {/* Role & Tier Col */}
                  <View style={{ flex: 1.5, justifyContent: 'center' }}>
                    <View
                      style={[
                        styles.roleBadge,
                        isSuperAdmin
                          ? { backgroundColor: '#FFDAD6' }
                          : staff.role.includes('Manager')
                          ? { backgroundColor: '#E8F6F5' }
                          : { backgroundColor: '#E9F6FD' },
                      ]}
                    >
                      <Ionicons
                        name={
                          isSuperAdmin
                            ? 'star'
                            : staff.role.includes('Manager')
                            ? 'shield-checkmark'
                            : staff.role.includes('Cashier')
                            ? 'person'
                            : 'cube-outline'
                        }
                        size={12}
                        color={isSuperAdmin ? '#BA1A1A' : '#006A66'}
                      />
                      <Text
                        style={[
                          styles.roleBadgeText,
                          { color: isSuperAdmin ? '#BA1A1A' : '#006A66' },
                        ]}
                      >
                        {staff.role}
                      </Text>
                    </View>
                  </View>

                  {/* Contact Col */}
                  <View style={{ flex: 2, justifyContent: 'center' }}>
                    <Text style={[styles.contactPhone, { color: theme.textPrimary }]}>
                      {staff.phone}
                    </Text>
                    <Text style={styles.contactEmail} numberOfLines={1}>
                      {staff.email}
                    </Text>
                  </View>

                  {/* Station / Lane Col */}
                  <View style={[styles.stationCell, { flex: 1.8 }]}>
                    <Ionicons
                      name={
                        staff.station.includes('Lane') || staff.station.includes('Register')
                          ? 'calculator-outline'
                          : staff.station.includes('Warehouse')
                          ? 'business-outline'
                          : 'desktop-outline'
                      }
                      size={14}
                      color="#6D7A78"
                    />
                    <Text style={[styles.stationText, { color: theme.textPrimary }]}>
                      {staff.station}
                    </Text>
                  </View>

                  {/* Status Col */}
                  <View style={{ flex: 1.2, justifyContent: 'center' }}>
                    <View
                      style={[
                        styles.statusPill,
                        isOnShift
                          ? { backgroundColor: '#E8F6F5' }
                          : { backgroundColor: '#E9F6FD' },
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: isOnShift ? '#32B67A' : '#3FAFA9' },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusPillText,
                          { color: isOnShift ? '#006A66' : '#263238' },
                        ]}
                      >
                        {staff.status}
                      </Text>
                    </View>
                  </View>

                  {/* Last Active Col */}
                  <View style={{ flex: 1.1, justifyContent: 'center' }}>
                    <Text style={styles.lastActiveText}>{staff.lastActive}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Table Footer / Pagination */}
            <View style={styles.tableFooterRow}>
              <View style={styles.footerLeft}>
                <Text style={styles.footerText}>
                  Showing 1 - {filteredStaff.length} of 28 staff members
                </Text>
                <View style={styles.perPageDropdown}>
                  <Text style={styles.perPageText}>20 per page</Text>
                  <Ionicons name="chevron-down" size={12} color="#6D7A78" />
                </View>
              </View>

              <View style={styles.paginationCluster}>
                <TouchableOpacity style={styles.pageBtn}>
                  <Ionicons name="chevron-back" size={14} color="#6D7A78" />
                </TouchableOpacity>
                <View style={[styles.pageBtn, styles.pageBtnActive]}>
                  <Text style={styles.pageBtnTextActive}>1</Text>
                </View>
                <TouchableOpacity style={styles.pageBtn}>
                  <Text style={styles.pageBtnText}>2</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.pageBtn}>
                  <Text style={styles.pageBtnText}>3</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.pageBtn}>
                  <Ionicons name="chevron-forward" size={14} color="#6D7A78" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Right Column: Permissions Matrix & Quick Enroll Panels */}
        <View style={isWide ? styles.rightColWide : styles.rightColStack}>
          {/* Panel 1: Permissions Matrix */}
          <View style={[styles.panelBox, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
            <View style={styles.panelHeaderRow}>
              <View>
                <Text style={styles.panelHeaderTitle}>Permissions Matrix</Text>
                <Text style={styles.panelHeaderSub}>Live role security rules</Text>
              </View>
              <View style={[styles.iconCircleTeal, { backgroundColor: '#E8F6F5' }]}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#006A66" />
              </View>
            </View>

            {/* Configuring Role Dropdown */}
            <View style={styles.roleSelectContainer}>
              <Text style={styles.configuringLabel}>CONFIGURING:</Text>
              <View style={[styles.roleDropdownBtn, { borderColor: '#E8ECEF' }]}>
                <Text style={styles.roleDropdownBtnText}>{configuredRole}</Text>
                <Ionicons name="chevron-down" size={14} color="#6D7A78" />
              </View>
            </View>

            {/* Section 1: POS TERMINAL & SALES (4 RULES) */}
            <View style={styles.permGroup}>
              <View style={styles.groupHeaderRow}>
                <View style={styles.groupTitleCluster}>
                  <Ionicons name="storefront-outline" size={14} color="#006A66" />
                  <Text style={styles.groupHeading}>POS TERMINAL & SALES</Text>
                </View>
                <Text style={styles.ruleCountText}>4 RULES</Text>
              </View>

              {/* Item 1 */}
              <View style={styles.permItemRow}>
                <View style={styles.permTextCol}>
                  <Text style={styles.permTitle}>Process regular sales & scan barcode</Text>
                  <Text style={styles.permSub}>Core checkout barcode flow</Text>
                </View>
                <Switch
                  value={permissions.processSales}
                  onValueChange={() => handleTogglePermission('processSales')}
                  trackColor={{ false: '#CFDCE4', true: '#3FAFA9' }}
                  thumbColor={permissions.processSales ? '#006A66' : '#FFFFFF'}
                />
              </View>

              {/* Item 2 */}
              <View style={styles.permItemRow}>
                <View style={styles.permTextCol}>
                  <Text style={styles.permTitle}>Issue custom / item discounts</Text>
                  <Text style={styles.permSub}>Supervisor PIN prompt required</Text>
                </View>
                <Switch
                  value={permissions.issueDiscounts}
                  onValueChange={() => handleTogglePermission('issueDiscounts')}
                  trackColor={{ false: '#CFDCE4', true: '#3FAFA9' }}
                  thumbColor={permissions.issueDiscounts ? '#006A66' : '#FFFFFF'}
                />
              </View>

              {/* Item 3 */}
              <View style={styles.permItemRow}>
                <View style={styles.permTextCol}>
                  <Text style={styles.permTitle}>Void active transactions</Text>
                  <Text style={[styles.permSub, { color: '#BA1A1A' }]}>
                    Restricted to Store Lead
                  </Text>
                </View>
                <Switch
                  value={permissions.voidTransactions}
                  onValueChange={() => handleTogglePermission('voidTransactions')}
                  trackColor={{ false: '#CFDCE4', true: '#3FAFA9' }}
                  thumbColor={permissions.voidTransactions ? '#006A66' : '#FFFFFF'}
                />
              </View>

              {/* Item 4 */}
              <View style={styles.permItemRow}>
                <View style={styles.permTextCol}>
                  <Text style={styles.permTitle}>Manual cash drawer pop</Text>
                  <Text style={styles.permSub}>Without checkout trigger</Text>
                </View>
                <Switch
                  value={permissions.manualDrawerPop}
                  onValueChange={() => handleTogglePermission('manualDrawerPop')}
                  trackColor={{ false: '#CFDCE4', true: '#3FAFA9' }}
                  thumbColor={permissions.manualDrawerPop ? '#006A66' : '#FFFFFF'}
                />
              </View>
            </View>

            {/* Section 2: INVENTORY & PRODUCTS (3 RULES) */}
            <View style={styles.permGroup}>
              <View style={styles.groupHeaderRow}>
                <View style={styles.groupTitleCluster}>
                  <Ionicons name="cube-outline" size={14} color="#006A66" />
                  <Text style={styles.groupHeading}>INVENTORY & PRODUCTS</Text>
                </View>
                <Text style={styles.ruleCountText}>3 RULES</Text>
              </View>

              {/* Item 1 */}
              <View style={styles.permItemRow}>
                <View style={styles.permTextCol}>
                  <Text style={styles.permTitle}>View store inventory levels</Text>
                  <Text style={styles.permSub}>Shelf and backroom counts</Text>
                </View>
                <Switch
                  value={permissions.viewInventory}
                  onValueChange={() => handleTogglePermission('viewInventory')}
                  trackColor={{ false: '#CFDCE4', true: '#3FAFA9' }}
                  thumbColor={permissions.viewInventory ? '#006A66' : '#FFFFFF'}
                />
              </View>

              {/* Item 2 */}
              <View style={styles.permItemRow}>
                <View style={styles.permTextCol}>
                  <Text style={styles.permTitle}>Adjust stock & write-offs</Text>
                  <Text style={styles.permSub}>Damaged/expired goods</Text>
                </View>
                <Switch
                  value={permissions.adjustStock}
                  onValueChange={() => handleTogglePermission('adjustStock')}
                  trackColor={{ false: '#CFDCE4', true: '#3FAFA9' }}
                  thumbColor={permissions.adjustStock ? '#006A66' : '#FFFFFF'}
                />
              </View>

              {/* Item 3 */}
              <View style={styles.permItemRow}>
                <View style={styles.permTextCol}>
                  <Text style={styles.permTitle}>Modify product selling prices</Text>
                  <Text style={styles.permSub}>Locked by HQ pricing board</Text>
                </View>
                <Switch
                  value={permissions.modifyPrices}
                  onValueChange={() => handleTogglePermission('modifyPrices')}
                  trackColor={{ false: '#CFDCE4', true: '#3FAFA9' }}
                  thumbColor={permissions.modifyPrices ? '#006A66' : '#FFFFFF'}
                />
              </View>
            </View>

            {/* Section 3: SHIFT LOGS & FINANCIALS (2 RULES) */}
            <View style={styles.permGroup}>
              <View style={styles.groupHeaderRow}>
                <View style={styles.groupTitleCluster}>
                  <Ionicons name="bar-chart-outline" size={14} color="#006A66" />
                  <Text style={styles.groupHeading}>SHIFT LOGS & FINANCIALS</Text>
                </View>
                <Text style={styles.ruleCountText}>2 RULES</Text>
              </View>

              {/* Item 1 */}
              <View style={styles.permItemRow}>
                <View style={styles.permTextCol}>
                  <Text style={styles.permTitle}>Print own shift end-of-day X/Z report</Text>
                  <Text style={styles.permSub}>Tender breakdown report</Text>
                </View>
                <Switch
                  value={permissions.printReports}
                  onValueChange={() => handleTogglePermission('printReports')}
                  trackColor={{ false: '#CFDCE4', true: '#3FAFA9' }}
                  thumbColor={permissions.printReports ? '#006A66' : '#FFFFFF'}
                />
              </View>

              {/* Item 2 */}
              <View style={styles.permItemRow}>
                <View style={styles.permTextCol}>
                  <Text style={styles.permTitle}>View store Gross Margin & COGS</Text>
                  <Text style={styles.permSub}>Restricted ledger metric</Text>
                </View>
                <Switch
                  value={permissions.viewMarginCogs}
                  onValueChange={() => handleTogglePermission('viewMarginCogs')}
                  trackColor={{ false: '#CFDCE4', true: '#3FAFA9' }}
                  thumbColor={permissions.viewMarginCogs ? '#006A66' : '#FFFFFF'}
                />
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.matrixBtnRow}>
              <TouchableOpacity
                style={[styles.btnOutlineSmall, { borderColor: '#E8ECEF' }]}
                onPress={handleResetMatrix}
                activeOpacity={0.8}
              >
                <Text style={styles.btnOutlineSmallText}>Reset Defaults</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.btnPrimarySmall,
                  { backgroundColor: matrixSaved ? '#32B67A' : '#006A66' },
                ]}
                onPress={handleSaveMatrix}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={matrixSaved ? 'checkmark-circle' : 'save-outline'}
                  size={14}
                  color="#FFFFFF"
                />
                <Text style={styles.btnPrimarySmallText}>
                  {matrixSaved ? 'Matrix Saved!' : 'Save Matrix'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Panel 2: Quick Enroll Staff */}
          <View style={[styles.panelBox, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
            <View style={styles.panelHeaderRow}>
              <View>
                <Text style={styles.panelHeaderTitle}>Quick Enroll Staff</Text>
                <Text style={styles.panelHeaderSub}>Provision instant POS terminal access</Text>
              </View>
              <View style={[styles.newPill, { backgroundColor: '#E8F6F5' }]}>
                <Text style={styles.newPillText}>NEW</Text>
              </View>
            </View>

            {/* Enroll Form */}
            <View style={styles.enrollForm}>
              {/* Full Legal Name */}
              <View style={styles.fieldCol}>
                <Text style={styles.enrollLabel}>Full Legal Name</Text>
                <TextInput
                  style={[styles.enrollInput, { borderColor: '#E8ECEF', color: theme.textPrimary }]}
                  placeholder="e.g. Dennis Kipchumba"
                  placeholderTextColor="#8A969B"
                  value={enrollName}
                  onChangeText={setEnrollName}
                />
              </View>

              {/* Row 2: Email & Phone */}
              <View style={styles.fieldRow}>
                <View style={styles.fieldCol}>
                  <Text style={styles.enrollLabel}>Official Email</Text>
                  <TextInput
                    style={[styles.enrollInput, { borderColor: '#E8ECEF', color: theme.textPrimary }]}
                    placeholder="d.kipchumba@landm..."
                    placeholderTextColor="#8A969B"
                    value={enrollEmail}
                    onChangeText={setEnrollEmail}
                    keyboardType="email-address"
                  />
                </View>
                <View style={styles.fieldCol}>
                  <Text style={styles.enrollLabel}>Phone (Kenya M-PESA)</Text>
                  <TextInput
                    style={[styles.enrollInput, { borderColor: '#E8ECEF', color: theme.textPrimary }]}
                    placeholder="0712 000 000"
                    placeholderTextColor="#8A969B"
                    value={enrollPhone}
                    onChangeText={setEnrollPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* Row 3: Role & Station */}
              <View style={styles.fieldRow}>
                <View style={styles.fieldCol}>
                  <Text style={styles.enrollLabel}>Assigned Role</Text>
                  <View style={[styles.enrollSelect, { borderColor: '#E8ECEF' }]}>
                    <Text style={[styles.enrollSelectText, { color: theme.textPrimary }]}>
                      Floor Cashier
                    </Text>
                    <Ionicons name="chevron-down" size={13} color="#6D7A78" />
                  </View>
                </View>
                <View style={styles.fieldCol}>
                  <Text style={styles.enrollLabel}>Initial Lane / Station</Text>
                  <View style={[styles.enrollSelect, { borderColor: '#E8ECEF' }]}>
                    <Text
                      style={[styles.enrollSelectText, { color: theme.textPrimary }]}
                      numberOfLines={1}
                    >
                      Lane #04 (Nairobi...
                    </Text>
                    <Ionicons name="chevron-down" size={13} color="#6D7A78" />
                  </View>
                </View>
              </View>

              {/* Auto PIN Generator Toggle Box */}
              <View style={[styles.autoPinBox, { backgroundColor: '#E8F6F5', borderColor: '#BCC9C7' }]}>
                <View style={styles.autoPinLeft}>
                  <Ionicons name="chatbubble-ellipses-outline" size={18} color="#006A66" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.autoPinTitle}>Auto-generate 4-digit POS PIN</Text>
                    <Text style={styles.autoPinSub}>
                      SMS PIN sent to employee phone immediately
                    </Text>
                  </View>
                </View>
                <Switch
                  value={autoGenPin}
                  onValueChange={(val) => {
                    triggerFeedback.tap();
                    setAutoGenPin(val);
                  }}
                  trackColor={{ false: '#CFDCE4', true: '#3FAFA9' }}
                  thumbColor={autoGenPin ? '#006A66' : '#FFFFFF'}
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.btnEnrollSubmit, { backgroundColor: '#006A66' }]}
                onPress={handleEnrollStaff}
                activeOpacity={0.8}
              >
                <Ionicons name="person-add" size={15} color="#FFFFFF" />
                <Text style={styles.btnEnrollSubmitText}>Issue Credentials & Enroll</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Security Audit Log Modal */}
      <Modal
        visible={isAuditModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAuditModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContentCard}>
            <View style={styles.modalHeaderRow}>
              <View style={styles.titleWithIconRow}>
                <Ionicons name="shield-checkmark" size={20} color="#006A66" />
                <Text style={styles.modalTitle}>Security & Cashier Audit Log</Text>
              </View>
              <TouchableOpacity onPress={() => setIsAuditModalVisible(false)}>
                <Ionicons name="close" size={20} color="#263238" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }}>
              {SECURITY_AUDIT_LOGS.map((item) => (
                <View key={item.id} style={styles.auditLogRow}>
                  <View style={{ flex: 1.5 }}>
                    <Text style={styles.auditLogTime}>{item.time}</Text>
                    <Text style={styles.auditLogStaff}>{item.staff}</Text>
                  </View>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.auditLogAction}>{item.action}</Text>
                    <Text style={styles.auditLogLane}>{item.lane}</Text>
                  </View>
                  <View style={styles.auditBadge}>
                    <Text style={styles.auditBadgeText}>{item.status}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setIsAuditModalVisible(false)}
            >
              <Text style={styles.modalCloseBtnText}>Close Audit Trail</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  titleColumn: {
    flex: 1,
    minWidth: 320,
  },
  titleWithIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  headerIconSquare: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainHeading: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.3,
  },
  subText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
    maxWidth: 680,
  },
  headerBtnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
  },
  btnOutlineText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 8,
  },
  btnPrimaryText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    minWidth: 200,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  kpiTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  kpiLabel: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#6D7A78',
    letterSpacing: 0.5,
  },
  kpiIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
  },
  valueWithBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shiftBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  shiftBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#006A66',
  },
  kpiFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendTextGreen: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#32B67A',
  },
  dotTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  greenLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#32B67A',
  },
  kpiFooterTextBold: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#006A66',
  },
  kpiFooterMuted: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: '#8A969B',
  },
  mainLayout: {
    gap: 16,
  },
  mainLayoutWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  mainLayoutStack: {
    flexDirection: 'column',
  },
  leftColWide: {
    flex: 1.8,
    gap: 14,
  },
  leftColStack: {
    width: '100%',
    gap: 14,
  },
  rightColWide: {
    flex: 1.1,
    maxWidth: 420,
    minWidth: 340,
    gap: 14,
  },
  rightColStack: {
    width: '100%',
    gap: 14,
  },
  filterBarCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  filterInputsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  searchBox: {
    flex: 2,
    minWidth: 200,
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  dropdownSelect: {
    flex: 1,
    minWidth: 120,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
  },
  dropdownSelectText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: '#263238',
  },
  pillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 4,
  },
  filterViewLabel: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#6D7A78',
    marginRight: 4,
  },
  filterPillBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  filterPillBtnText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  tableCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F5F7F8',
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECEF',
  },
  th: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#6D7A78',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECEF',
  },
  staffMemberCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarImg: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  staffNameText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  empIdSub: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: '#6D7A78',
    marginTop: 1,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  roleBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
  contactPhone: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  contactEmail: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: '#6D7A78',
    marginTop: 1,
  },
  stationCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stationText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
  lastActiveText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#6D7A78',
  },
  tableFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  footerText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#6D7A78',
  },
  perPageDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E8ECEF',
  },
  perPageText: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    color: '#263238',
  },
  paginationCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pageBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8ECEF',
    backgroundColor: '#FFFFFF',
  },
  pageBtnActive: {
    backgroundColor: '#006A66',
    borderColor: '#006A66',
  },
  pageBtnTextActive: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  pageBtnText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: '#263238',
  },
  panelBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  panelHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  panelHeaderTitle: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#111D23',
  },
  panelHeaderSub: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: '#6D7A78',
    marginTop: 1,
  },
  iconCircleTeal: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newPillText: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: '#006A66',
  },
  roleSelectContainer: {
    marginBottom: 12,
  },
  configuringLabel: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: '#6D7A78',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  roleDropdownBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
  },
  roleDropdownBtnText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: '#006A66',
  },
  permGroup: {
    borderTopWidth: 1,
    borderTopColor: '#E8ECEF',
    paddingTop: 10,
    marginTop: 10,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupTitleCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  groupHeading: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#006A66',
    letterSpacing: 0.5,
  },
  ruleCountText: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: '#6D7A78',
  },
  permItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  permTextCol: {
    flex: 1,
    paddingRight: 8,
  },
  permTitle: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: '#263238',
  },
  permSub: {
    fontSize: 9.5,
    fontFamily: 'Inter_400Regular',
    color: '#6D7A78',
    marginTop: 1,
  },
  matrixBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E8ECEF',
    paddingTop: 10,
  },
  btnOutlineSmall: {
    paddingHorizontal: 10,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  btnOutlineSmallText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: '#263238',
  },
  btnPrimarySmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 6,
  },
  btnPrimarySmallText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  enrollForm: {
    gap: 10,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 8,
  },
  fieldCol: {
    flex: 1,
  },
  enrollLabel: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: '#263238',
    marginBottom: 4,
  },
  enrollInput: {
    height: 34,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    backgroundColor: '#FFFFFF',
  },
  enrollSelect: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 34,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
  },
  enrollSelectText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  autoPinBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 2,
  },
  autoPinLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    paddingRight: 6,
  },
  autoPinTitle: {
    fontSize: 10.5,
    fontFamily: 'Inter_700Bold',
    color: '#006A66',
  },
  autoPinSub: {
    fontSize: 9,
    fontFamily: 'Inter_400Regular',
    color: '#6D7A78',
    marginTop: 1,
  },
  btnEnrollSubmit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 36,
    borderRadius: 8,
    marginTop: 4,
  },
  btnEnrollSubmitText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContentCard: {
    width: '100%',
    maxWidth: 540,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECEF',
    paddingBottom: 12,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: '#111D23',
  },
  auditLogRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECEF',
  },
  auditLogTime: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#006A66',
  },
  auditLogStaff: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    color: '#263238',
  },
  auditLogAction: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: '#111D23',
  },
  auditLogLane: {
    fontSize: 9,
    fontFamily: 'Inter_400Regular',
    color: '#6D7A78',
  },
  auditBadge: {
    backgroundColor: '#E8F6F5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  auditBadgeText: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: '#006A66',
  },
  modalCloseBtn: {
    marginTop: 14,
    backgroundColor: '#F4FAFF',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CFDCE4',
    alignItems: 'center',
  },
  modalCloseBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#263238',
  },
});
