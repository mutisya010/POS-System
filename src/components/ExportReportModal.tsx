import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  useWindowDimensions,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import { usePOS } from '../context/POSContext';
import { triggerFeedback } from '../utils/sound';
import { formatCurrency } from '../utils/formatters';

export type ExportReportType =
  | 'sales_summary'
  | 'cashier_z_report'
  | 'etims_tax'
  | 'inventory_valuation'
  | 'payment_gateways';

export type ExportFileFormat = 'pdf' | 'csv' | 'json' | 'thermal';

interface ExportReportModalProps {
  visible: boolean;
  onClose: () => void;
  defaultFormat?: ExportFileFormat;
  defaultReportType?: ExportReportType;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  visible,
  onClose,
  defaultFormat = 'pdf',
  defaultReportType = 'sales_summary',
}) => {
  const { theme, storeSettings } = usePOS();
  const { width } = useWindowDimensions();
  const isNarrow = width < 640;

  // Form States
  const [reportType, setReportType] = useState<ExportReportType>(defaultReportType);
  const [period, setPeriod] = useState<
    'Today' | 'Yesterday' | 'Last 7 Days' | 'This Month' | 'Last Month' | 'Custom'
  >('This Month');
  const [startDate, setStartDate] = useState('2024-10-01');
  const [endDate, setEndDate] = useState('2024-10-31');

  const [selectedLane, setSelectedLane] = useState('All Lanes (Consolidated)');
  const [selectedCashier, setSelectedCashier] = useState('All Personnel');

  // Format
  const [fileFormat, setFileFormat] = useState<ExportFileFormat>(defaultFormat);

  // Inclusions Toggles
  const [incCategoryTurnover, setIncCategoryTurnover] = useState(true);
  const [incItemizedSku, setIncItemizedSku] = useState(true);
  const [incCashierVariances, setIncCashierVariances] = useState(true);
  const [incEtimsQr, setIncEtimsQr] = useState(true);
  const [incMpesaRefs, setIncMpesaRefs] = useState(true);
  const [incLoyaltyPoints, setIncLoyaltyPoints] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);

  // Sync format if defaultFormat prop changes
  React.useEffect(() => {
    if (defaultFormat) setFileFormat(defaultFormat);
  }, [defaultFormat]);

  // Handle Generate and Export
  const handleGenerateReport = async () => {
    triggerFeedback.tap();
    setIsGenerating(true);

    if (fileFormat === 'pdf' || fileFormat === 'thermal') {
      const reportHtml = `
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace; padding: 30px; max-width: 680px; margin: 0 auto; color: #111D23; }
              .header { text-align: center; border-bottom: 2px solid #006A66; padding-bottom: 15px; margin-bottom: 20px; }
              .logo { font-size: 20px; font-weight: bold; color: #006A66; }
              .sub { font-size: 11px; color: #6D7A78; margin-top: 4px; }
              .title { font-size: 16px; font-weight: bold; margin: 15px 0 5px 0; }
              .badge { display: inline-block; background: #E8F6F5; color: #006A66; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; }
              .stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin: 20px 0; }
              .stat-box { background: #F4FAFF; border: 1px solid #CFDCE4; padding: 12px; border-radius: 6px; }
              .stat-label { font-size: 10px; color: #6D7A78; font-weight: bold; text-transform: uppercase; }
              .stat-val { font-size: 18px; font-weight: bold; margin-top: 4px; color: #111D23; }
              table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
              th { background: #E3F0F8; text-align: left; padding: 8px; font-size: 10px; font-weight: bold; color: #006A66; border-bottom: 1px solid #BCC9C7; }
              td { padding: 8px; border-bottom: 1px solid #E8ECEF; }
              .bold { font-weight: bold; }
              .right { text-align: right; }
              .footer { border-top: 1px dashed #BCC9C7; margin-top: 30px; padding-top: 10px; font-size: 10px; color: #6D7A78; text-align: center; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">LANDMARK STORES KENYA</div>
              <div class="sub">Store #001 • Nairobi Flagship Store • Argwings Kodhek Rd, Kilimani</div>
              <div class="sub">KRA Tax PIN: P051284920K • eTIMS Serial: VSCU-2024-004120</div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div class="title">
                  ${
                    reportType === 'sales_summary'
                      ? 'Monthly Sales & Operational Turnover Report'
                      : reportType === 'cashier_z_report'
                      ? 'End of Shift Cashier Till Reconciliation (Z-Report)'
                      : reportType === 'etims_tax'
                      ? 'Kenya Revenue Authority (KRA) eTIMS 16% VAT Remittance Schedule'
                      : reportType === 'inventory_valuation'
                      ? 'Central Depletion & Inventory Valuation Matrix'
                      : 'Payment Channels & Safaricom M-Pesa Settlement Audit'
                  }
                </div>
                <div class="sub">Reporting Period: ${period} (${startDate} to ${endDate}) • Scope: ${selectedLane}</div>
              </div>
              <div class="badge">OFFICIAL POS AUDIT</div>
            </div>

            <div class="stats-grid">
              <div class="stat-box">
                <div class="stat-label">Gross Turnover</div>
                <div class="stat-val">KSh 1,842,590.00</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Orders Billed</div>
                <div class="stat-val">3,428 txns</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">VAT Remittance (16%)</div>
                <div class="stat-val" style="color: #006A66;">KSh 254,150.34</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>PAYMENT CHANNEL</th>
                  <th class="right">VOLUME</th>
                  <th class="right">GROSS COLLECTED</th>
                  <th class="right">NET SETTLEMENT</th>
                  <th>SETTLEMENT STATUS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="bold">Safaricom M-Pesa STK & Till</td>
                  <td class="right">2,194 txns (64%)</td>
                  <td class="right">KSh 1,179,257.00</td>
                  <td class="right bold">KSh 1,167,464.00</td>
                  <td><span class="badge" style="background:#EAF8F1;color:#32B67A;">Settled Realtime</span></td>
                </tr>
                <tr>
                  <td class="bold">Card (Visa / Mastercard)</td>
                  <td class="right">754 txns (22%)</td>
                  <td class="right">KSh 405,370.00</td>
                  <td class="right bold">KSh 397,262.00</td>
                  <td><span class="badge" style="background:#EAF8F1;color:#32B67A;">Bank Settled</span></td>
                </tr>
                <tr>
                  <td class="bold">Cash Drawer Float</td>
                  <td class="right">377 txns (11%)</td>
                  <td class="right">KSh 202,685.00</td>
                  <td class="right bold">KSh 202,685.00</td>
                  <td><span class="badge" style="background:#E3F0F8;color:#006A66;">Till Audited</span></td>
                </tr>
                <tr>
                  <td class="bold">Bank EFT / Direct Transfer</td>
                  <td class="right">103 txns (3%)</td>
                  <td class="right">KSh 55,278.00</td>
                  <td class="right bold">KSh 55,278.00</td>
                  <td><span class="badge" style="background:#E3F0F8;color:#006A66;">Verified</span></td>
                </tr>
              </tbody>
            </table>

            <div style="margin-top: 25px;">
              <div class="title" style="font-size: 13px;">Cashier Lane Reconciliation & Till Variances</div>
              <table>
                <thead>
                  <tr>
                    <th>CASHIER OPERATOR</th>
                    <th>STATION LANE</th>
                    <th class="right">ORDERS</th>
                    <th class="right">COLLECTED TOTAL</th>
                    <th class="right">TILL VARIANCE</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="bold">John Doe (#402)</td>
                    <td>Register Lane #01</td>
                    <td class="right">412</td>
                    <td class="right">KSh 221,400.00</td>
                    <td class="right" style="color: #32B67A; font-weight: bold;">Balanced (0.00)</td>
                  </tr>
                  <tr>
                    <td class="bold">Mercy Chebet (#104)</td>
                    <td>Register Lane #02</td>
                    <td class="right">388</td>
                    <td class="right">KSh 198,650.00</td>
                    <td class="right" style="color: #32B67A; font-weight: bold;">+KSh 50.00</td>
                  </tr>
                  <tr>
                    <td class="bold">Kelvin Mwangi (#108)</td>
                    <td>Register Lane #03</td>
                    <td class="right">340</td>
                    <td class="right">KSh 174,200.00</td>
                    <td class="right" style="color: #BA1A1A; font-weight: bold;">-KSh 20.00</td>
                  </tr>
                  <tr>
                    <td class="bold">Faith Achieng (#112)</td>
                    <td>Register Lane #01 (PM)</td>
                    <td class="right">295</td>
                    <td class="right">KSh 152,800.00</td>
                    <td class="right" style="color: #32B67A; font-weight: bold;">Balanced (0.00)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="footer">
              Generated by Landmark Stores POS v2.4-PROD • KRA eTIMS Hash: QRTR-CK31-4491-9204-A312<br/>
              Report compiled on ${new Date().toLocaleString()} by Authorized Store Operator.
            </div>
          </body>
        </html>
      `;

      try {
        await Print.printAsync({ html: reportHtml });
        triggerFeedback.success();
      } catch (e) {
        console.warn(e);
      }
    } else if (fileFormat === 'csv') {
      const csvData =
        'Category,Metric,Value,Period,Branch\n' +
        `Gross Turnover,KSh,1842590.00,${period},Nairobi Flagship\n` +
        `Total Orders,Count,3428,${period},Nairobi Flagship\n` +
        `VAT 16% Remittance,KSh,254150.34,${period},Nairobi Flagship\n` +
        `Net Profit Margin,Percentage,28.4%,${period},Nairobi Flagship\n` +
        `M-Pesa Collections,KSh,1179257.00,${period},Nairobi Flagship\n` +
        `Card EMV Collections,KSh,405370.00,${period},Nairobi Flagship\n` +
        `Cash Drawer Collections,KSh,202685.00,${period},Nairobi Flagship\n` +
        `EFT Collections,KSh,55278.00,${period},Nairobi Flagship\n`;

      if (Platform.OS === 'web') {
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Landmark_POS_Report_${reportType}_${startDate}_${endDate}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        Alert.alert('CSV Report Exported', 'CSV report file ready for spreadsheet analysis.');
      }
      triggerFeedback.success();
    } else if (fileFormat === 'json') {
      const jsonData = JSON.stringify(
        {
          storeId: 'NBO-FLG-001',
          storeName: 'Landmark Stores - Nairobi Flagship',
          reportType,
          period,
          dateRange: { startDate, endDate },
          scope: { lane: selectedLane, cashier: selectedCashier },
          financials: {
            grossTurnover: 1842590.0,
            vatRemittance: 254150.34,
            netMargin: 0.284,
            totalOrders: 3428,
          },
          tenderBreakdown: {
            mpesa: 1179257.0,
            card: 405370.0,
            cash: 202685.0,
            eft: 55278.0,
          },
          kraValidation: {
            pin: 'P051284920K',
            vscuId: 'KRA-VSCU-2024-004120',
            status: 'VERIFIED_ACTIVE',
          },
        },
        null,
        2
      );

      if (Platform.OS === 'web') {
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Landmark_POS_Data_${reportType}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        Alert.alert('JSON Exported', 'JSON payload exported successfully.');
      }
      triggerFeedback.success();
    }

    setIsGenerating(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.dialogCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { borderBottomColor: '#E8ECEF' }]}>
            <View style={styles.headerLeftCluster}>
              <View style={[styles.headerIconCircle, { backgroundColor: '#E8F6F5' }]}>
                <Ionicons name="document-text" size={20} color="#006A66" />
              </View>
              <View>
                <View style={styles.titleRow}>
                  <Text style={[styles.modalTitle, { color: '#111D23' }]}>
                    Export Financial &amp; Operational Report
                  </Text>
                  <View style={[styles.badgePill, { backgroundColor: '#E3F0F8' }]}>
                    <Text style={styles.badgePillText}>Store #001</Text>
                  </View>
                </View>
                <Text style={styles.modalSubtitle}>
                  Configure date range, lane scope, fiscal inclusions, and export formats.
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color="#6D7A78" />
            </TouchableOpacity>
          </View>

          {/* Form Scroll Body */}
          <ScrollView
            style={styles.formScroll}
            contentContainerStyle={styles.formContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 1. Report Template Selection */}
            <View style={styles.formSection}>
              <Text style={styles.sectionLabel}>1. SELECT REPORT TYPE</Text>
              <View style={styles.reportTypeGrid}>
                {[
                  {
                    id: 'sales_summary',
                    label: 'Sales & Gross Turnover',
                    sub: 'Revenue, margins, top category turnover',
                    icon: 'bar-chart-outline',
                  },
                  {
                    id: 'cashier_z_report',
                    label: 'Cashier Till Z-Report',
                    sub: 'Shift drawer balancing & cash variances',
                    icon: 'calculator-outline',
                  },
                  {
                    id: 'etims_tax',
                    label: 'KRA eTIMS Tax Schedule',
                    sub: '16% VAT audit & fiscal validation codes',
                    icon: 'newspaper-outline',
                  },
                  {
                    id: 'inventory_valuation',
                    label: 'Inventory Valuation',
                    sub: 'Asset valuation, stock depletion & reorders',
                    icon: 'cube-outline',
                  },
                  {
                    id: 'payment_gateways',
                    label: 'Payment Gateways & M-Pesa',
                    sub: 'M-Pesa B2C, Card EMV & Cash tender stats',
                    icon: 'card-outline',
                  },
                ].map((item) => {
                  const isSelected = reportType === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.reportTypeCard,
                        isSelected
                          ? { borderColor: '#3FAFA9', backgroundColor: '#E8F6F5' }
                          : { borderColor: '#E8ECEF', backgroundColor: '#FFFFFF' },
                      ]}
                      onPress={() => {
                        triggerFeedback.tap();
                        setReportType(item.id as ExportReportType);
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.reportTypeHeader}>
                        <View style={styles.reportTypeIconBox}>
                          <Ionicons
                            name={item.icon as any}
                            size={16}
                            color={isSelected ? '#006A66' : '#6D7A78'}
                          />
                        </View>
                        <Ionicons
                          name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                          size={16}
                          color={isSelected ? '#006A66' : '#CFDCE4'}
                        />
                      </View>
                      <Text
                        style={[
                          styles.reportTypeTitle,
                          { color: isSelected ? '#006A66' : '#111D23' },
                        ]}
                      >
                        {item.label}
                      </Text>
                      <Text style={styles.reportTypeSub}>{item.sub}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 2. Date Filter & Custom Range */}
            <View style={styles.formSection}>
              <Text style={styles.sectionLabel}>2. REPORTING PERIOD &amp; TIMEFRAME</Text>
              <View style={styles.periodPillsRow}>
                {(['Today', 'Yesterday', 'Last 7 Days', 'This Month', 'Last Month', 'Custom'] as const).map(
                  (p) => {
                    const isSelected = period === p;
                    return (
                      <TouchableOpacity
                        key={p}
                        style={[
                          styles.periodPill,
                          isSelected
                            ? { backgroundColor: '#006A66', borderColor: '#006A66' }
                            : { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' },
                        ]}
                        onPress={() => {
                          triggerFeedback.tap();
                          setPeriod(p);
                        }}
                      >
                        <Text
                          style={[
                            styles.periodPillText,
                            { color: isSelected ? '#FFFFFF' : '#263238' },
                            isSelected && { fontFamily: 'Inter_700Bold' },
                          ]}
                        >
                          {p}
                        </Text>
                      </TouchableOpacity>
                    );
                  }
                )}
              </View>

              {/* Date Input Boxes */}
              <View style={styles.dateInputsRow}>
                <View style={styles.dateCol}>
                  <Text style={styles.inputLabel}>From Date</Text>
                  <View style={[styles.inputBox, { borderColor: '#E8ECEF' }]}>
                    <Ionicons name="calendar-outline" size={14} color="#6D7A78" />
                    <TextInput
                      style={styles.textInputBare}
                      value={startDate}
                      onChangeText={setStartDate}
                      placeholder="YYYY-MM-DD"
                    />
                  </View>
                </View>

                <View style={styles.dateCol}>
                  <Text style={styles.inputLabel}>To Date</Text>
                  <View style={[styles.inputBox, { borderColor: '#E8ECEF' }]}>
                    <Ionicons name="calendar-outline" size={14} color="#6D7A78" />
                    <TextInput
                      style={styles.textInputBare}
                      value={endDate}
                      onChangeText={setEndDate}
                      placeholder="YYYY-MM-DD"
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* 3. Scope Filters */}
            <View style={styles.formSection}>
              <Text style={styles.sectionLabel}>3. STORE LANE &amp; CASHIER SCOPE</Text>
              <View style={styles.dateInputsRow}>
                <View style={styles.dateCol}>
                  <Text style={styles.inputLabel}>Register Lane</Text>
                  <View style={[styles.inputBox, { borderColor: '#E8ECEF' }]}>
                    <Ionicons name="desktop-outline" size={14} color="#6D7A78" />
                    <Text style={styles.selectText}>{selectedLane}</Text>
                    <Ionicons name="chevron-down" size={13} color="#6D7A78" style={{ marginLeft: 'auto' }} />
                  </View>
                </View>

                <View style={styles.dateCol}>
                  <Text style={styles.inputLabel}>Cashier Operator</Text>
                  <View style={[styles.inputBox, { borderColor: '#E8ECEF' }]}>
                    <Ionicons name="person-outline" size={14} color="#6D7A78" />
                    <Text style={styles.selectText}>{selectedCashier}</Text>
                    <Ionicons name="chevron-down" size={13} color="#6D7A78" style={{ marginLeft: 'auto' }} />
                  </View>
                </View>
              </View>
            </View>

            {/* 4. Data Inclusions & Compliance Checklist */}
            <View style={styles.formSection}>
              <Text style={styles.sectionLabel}>4. DATA GRANULARITY &amp; FISCAL INCLUSIONS</Text>
              <View style={styles.checkboxGrid}>
                {/* 1 */}
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => {
                    triggerFeedback.tap();
                    setIncCategoryTurnover(!incCategoryTurnover);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkboxBox, incCategoryTurnover && styles.checkboxBoxChecked]}>
                    {incCategoryTurnover && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                  </View>
                  <Text style={styles.checkboxLabel}>Category Turnover &amp; Velocity</Text>
                </TouchableOpacity>

                {/* 2 */}
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => {
                    triggerFeedback.tap();
                    setIncItemizedSku(!incItemizedSku);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkboxBox, incItemizedSku && styles.checkboxBoxChecked]}>
                    {incItemizedSku && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                  </View>
                  <Text style={styles.checkboxLabel}>Itemized SKU Sales Ledger</Text>
                </TouchableOpacity>

                {/* 3 */}
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => {
                    triggerFeedback.tap();
                    setIncCashierVariances(!incCashierVariances);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkboxBox, incCashierVariances && styles.checkboxBoxChecked]}>
                    {incCashierVariances && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                  </View>
                  <Text style={styles.checkboxLabel}>Cashier Till Float &amp; Variances</Text>
                </TouchableOpacity>

                {/* 4 */}
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => {
                    triggerFeedback.tap();
                    setIncEtimsQr(!incEtimsQr);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkboxBox, incEtimsQr && styles.checkboxBoxChecked]}>
                    {incEtimsQr && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                  </View>
                  <Text style={styles.checkboxLabel}>KRA eTIMS QR &amp; Verification Hashes</Text>
                </TouchableOpacity>

                {/* 5 */}
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => {
                    triggerFeedback.tap();
                    setIncMpesaRefs(!incMpesaRefs);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkboxBox, incMpesaRefs && styles.checkboxBoxChecked]}>
                    {incMpesaRefs && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                  </View>
                  <Text style={styles.checkboxLabel}>M-Pesa STK Reference Codes</Text>
                </TouchableOpacity>

                {/* 6 */}
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => {
                    triggerFeedback.tap();
                    setIncLoyaltyPoints(!incLoyaltyPoints);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkboxBox, incLoyaltyPoints && styles.checkboxBoxChecked]}>
                    {incLoyaltyPoints && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                  </View>
                  <Text style={styles.checkboxLabel}>Customer Loyalty Point Accruals</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 5. Export Format */}
            <View style={styles.formSection}>
              <Text style={styles.sectionLabel}>5. EXPORT FILE FORMAT</Text>
              <View style={styles.formatCardsRow}>
                {/* PDF */}
                <TouchableOpacity
                  style={[
                    styles.formatCard,
                    fileFormat === 'pdf'
                      ? { borderColor: '#3FAFA9', backgroundColor: '#E8F6F5' }
                      : { borderColor: '#E8ECEF', backgroundColor: '#FFFFFF' },
                  ]}
                  onPress={() => {
                    triggerFeedback.tap();
                    setFileFormat('pdf');
                  }}
                >
                  <Ionicons
                    name="document-text"
                    size={20}
                    color={fileFormat === 'pdf' ? '#006A66' : '#6D7A78'}
                  />
                  <Text style={[styles.formatCardTitle, fileFormat === 'pdf' && { color: '#006A66' }]}>
                    PDF Document
                  </Text>
                  <Text style={styles.formatCardSub}>Formal A4 Audit Slip</Text>
                </TouchableOpacity>

                {/* CSV / Excel */}
                <TouchableOpacity
                  style={[
                    styles.formatCard,
                    fileFormat === 'csv'
                      ? { borderColor: '#3FAFA9', backgroundColor: '#E8F6F5' }
                      : { borderColor: '#E8ECEF', backgroundColor: '#FFFFFF' },
                  ]}
                  onPress={() => {
                    triggerFeedback.tap();
                    setFileFormat('csv');
                  }}
                >
                  <Ionicons
                    name="grid"
                    size={20}
                    color={fileFormat === 'csv' ? '#006A66' : '#6D7A78'}
                  />
                  <Text style={[styles.formatCardTitle, fileFormat === 'csv' && { color: '#006A66' }]}>
                    Excel / CSV
                  </Text>
                  <Text style={styles.formatCardSub}>Tabular Data Analysis</Text>
                </TouchableOpacity>

                {/* JSON */}
                <TouchableOpacity
                  style={[
                    styles.formatCard,
                    fileFormat === 'json'
                      ? { borderColor: '#3FAFA9', backgroundColor: '#E8F6F5' }
                      : { borderColor: '#E8ECEF', backgroundColor: '#FFFFFF' },
                  ]}
                  onPress={() => {
                    triggerFeedback.tap();
                    setFileFormat('json');
                  }}
                >
                  <Ionicons
                    name="code-slash"
                    size={20}
                    color={fileFormat === 'json' ? '#006A66' : '#6D7A78'}
                  />
                  <Text style={[styles.formatCardTitle, fileFormat === 'json' && { color: '#006A66' }]}>
                    Raw JSON
                  </Text>
                  <Text style={styles.formatCardSub}>ERP &amp; Cloud Feed</Text>
                </TouchableOpacity>

                {/* Thermal */}
                <TouchableOpacity
                  style={[
                    styles.formatCard,
                    fileFormat === 'thermal'
                      ? { borderColor: '#3FAFA9', backgroundColor: '#E8F6F5' }
                      : { borderColor: '#E8ECEF', backgroundColor: '#FFFFFF' },
                  ]}
                  onPress={() => {
                    triggerFeedback.tap();
                    setFileFormat('thermal');
                  }}
                >
                  <Ionicons
                    name="print"
                    size={20}
                    color={fileFormat === 'thermal' ? '#006A66' : '#6D7A78'}
                  />
                  <Text style={[styles.formatCardTitle, fileFormat === 'thermal' && { color: '#006A66' }]}>
                    Thermal Slip
                  </Text>
                  <Text style={styles.formatCardSub}>80mm Roll Print</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 6. Live Scope Estimate Box */}
            <View style={[styles.scopePreviewBox, { backgroundColor: '#E8F6F5', borderColor: '#BCC9C7' }]}>
              <Ionicons name="stats-chart" size={18} color="#006A66" />
              <View style={{ flex: 1 }}>
                <Text style={styles.scopePreviewTitle}>Estimated Export Scope</Text>
                <Text style={styles.scopePreviewSub}>
                  3,428 Transactions • KSh 1,842,590.00 Gross GMV • KSh 254,150.34 16% VAT (KRA Validated)
                </Text>
              </View>
              <View style={styles.readyPill}>
                <Text style={styles.readyPillText}>Ready to Export</Text>
              </View>
            </View>
          </ScrollView>

          {/* Modal Footer Controls */}
          <View style={[styles.modalFooter, { borderTopColor: '#E8ECEF' }]}>
            <TouchableOpacity
              style={styles.btnReset}
              onPress={() => {
                triggerFeedback.tap();
                setReportType('sales_summary');
                setPeriod('This Month');
                setFileFormat('pdf');
              }}
            >
              <Text style={styles.btnResetText}>Reset Defaults</Text>
            </TouchableOpacity>

            <View style={styles.footerActionGroup}>
              <TouchableOpacity style={styles.btnCancel} onPress={onClose} activeOpacity={0.7}>
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btnGenerate, { backgroundColor: '#006A66' }]}
                onPress={handleGenerateReport}
                disabled={isGenerating}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={fileFormat === 'thermal' ? 'print-outline' : 'download-outline'}
                  size={16}
                  color="#FFFFFF"
                />
                <Text style={styles.btnGenerateText}>
                  {isGenerating
                    ? 'Compiling Report...'
                    : fileFormat === 'thermal'
                    ? 'Print 80mm Audit Slip'
                    : `Generate & Download ${fileFormat.toUpperCase()}`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 29, 35, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 640,
    maxHeight: '92%',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#111D23',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 28,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerLeftCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  badgePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgePillText: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: '#006A66',
  },
  modalSubtitle: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#6D7A78',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formScroll: {
    flex: 1,
  },
  formContent: {
    padding: 18,
    gap: 18,
  },
  formSection: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#006A66',
    letterSpacing: 0.6,
  },
  reportTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reportTypeCard: {
    width: '48.8%',
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
  },
  reportTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reportTypeIconBox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportTypeTitle: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    marginBottom: 2,
  },
  reportTypeSub: {
    fontSize: 9.5,
    fontFamily: 'Inter_400Regular',
    color: '#6D7A78',
    lineHeight: 13,
  },
  periodPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  periodPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  periodPillText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  dateInputsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  dateCol: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: '#263238',
    marginBottom: 4,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
  },
  textInputBare: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: '#111D23',
    padding: 0,
  },
  selectText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: '#111D23',
  },
  checkboxGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  checkboxRow: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 3,
  },
  checkboxBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#BCC9C7',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxBoxChecked: {
    backgroundColor: '#006A66',
    borderColor: '#006A66',
  },
  checkboxLabel: {
    fontSize: 10.5,
    fontFamily: 'Inter_500Medium',
    color: '#263238',
  },
  formatCardsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  formatCard: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
    gap: 4,
  },
  formatCardTitle: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#111D23',
    marginTop: 2,
  },
  formatCardSub: {
    fontSize: 8.5,
    fontFamily: 'Inter_400Regular',
    color: '#6D7A78',
    textAlign: 'center',
  },
  scopePreviewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  scopePreviewTitle: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#006A66',
  },
  scopePreviewSub: {
    fontSize: 9.5,
    fontFamily: 'Inter_400Regular',
    color: '#263238',
    marginTop: 1,
  },
  readyPill: {
    backgroundColor: '#32B67A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  readyPillText: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  btnReset: {
    paddingVertical: 6,
  },
  btnResetText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: '#6D7A78',
  },
  footerActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  btnCancel: {
    paddingHorizontal: 12,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancelText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#6D7A78',
  },
  btnGenerate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    height: 38,
    borderRadius: 8,
  },
  btnGenerateText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
});

