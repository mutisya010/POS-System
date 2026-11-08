import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import { usePOS } from '../context/POSContext';
import { triggerFeedback } from '../utils/sound';
import { formatCurrency } from '../utils/formatters';
import { ExportReportModal, ExportFileFormat } from '../components/ExportReportModal';

export const ReportsScreen: React.FC = () => {
  const { theme } = usePOS();
  const { width } = useWindowDimensions();
  const isWide = width >= 1180;

  const [activeTab, setActiveTab] = useState<'sales' | 'inventory' | 'cashier' | 'tax'>('sales');
  const [dateFilter, setDateFilter] = useState<'Today' | 'Yesterday' | 'Last 7 Days' | 'This Month' | 'Custom'>('This Month');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFileFormat>('pdf');

  const handlePrintAudit = async () => {
    triggerFeedback.tap();
    const html = `
      <html>
        <head>
          <style>
            body { font-family: monospace; padding: 24px; max-width: 360px; margin: 0 auto; color: #111; font-size: 12px; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-bottom: 1px dashed #333; margin: 8px 0; }
            .row { display: flex; justify-content: space-between; margin: 3px 0; }
            .total { font-size: 15px; font-weight: bold; margin: 8px 0; }
          </style>
        </head>
        <body>
          <div class="center bold" style="font-size: 15px;">LANDMARK STORES KENYA</div>
          <div class="center">Nairobi Flagship • Store #001</div>
          <div class="center">KRA PIN: P051239840Z • E-TIMS Validated</div>
          <div class="line"></div>
          <div class="center bold">MONTHLY FINANCIAL AUDIT REPORT</div>
          <div class="center">Period: October 2024</div>
          <div class="line"></div>
          <div class="row"><span>Gross Turnover:</span><span class="bold">KSh 1,842,590.00</span></div>
          <div class="row"><span>Total Orders Billed:</span><span>3,428</span></div>
          <div class="row"><span>Net Profit Margin:</span><span>28.4% (KSh 523,300)</span></div>
          <div class="row"><span>VAT 16% Remittance:</span><span>KSh 254,150.34</span></div>
          <div class="line"></div>
          <div class="bold">PAYMENT CHANNELS BREAKDOWN:</div>
          <div class="row"><span>M-Pesa Mobile (64%):</span><span>KSh 1,179,257.00</span></div>
          <div class="row"><span>Card Visa/MC (22%):</span><span>KSh 405,370.00</span></div>
          <div class="row"><span>Register Cash (11%):</span><span>KSh 202,685.00</span></div>
          <div class="row"><span>EFT / Transfer (3%):</span><span>KSh 55,278.00</span></div>
          <div class="line"></div>
          <div class="bold">CASHIER DRAWER RECONCILIATION:</div>
          <div class="row"><span>John Doe (Lane #01):</span><span>Balanced (KSh 0.00)</span></div>
          <div class="row"><span>Mercy Chebet (Lane #02):</span><span>+KSh 50.00</span></div>
          <div class="row"><span>Kelvin Mwangi (Lane #03):</span><span>-KSh 20.00</span></div>
          <div class="row"><span>Faith Achieng (Lane #01 PM):</span><span>Balanced (KSh 0.00)</span></div>
          <div class="row bold"><span>Overall Discrepancy:</span><span>+KSh 30.00 Net</span></div>
          <div class="line"></div>
          <div class="center">*** END OF REPORT ***</div>
        </body>
      </html>
    `;
    try {
      await Print.printAsync({ html });
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: '#F4FAFF' }]} contentContainerStyle={styles.scrollContent}>
      {/* 1. Header Toolbar */}
      <View style={styles.topHeader}>
        <View style={styles.headingCol}>
          <Text style={[styles.tagline, { color: '#006A66' }]}>
            LEDGER &amp; FINANCIAL INTELLIGENCE • Store #001 • Nairobi Flagship
          </Text>
          <Text style={[styles.heading, { color: '#111D23' }]}>Sales &amp; Operational Reports</Text>
        </View>

        {/* Top-Right Action Buttons */}
        <View style={styles.topActionsRow}>
          <TouchableOpacity
            style={[styles.btnWhite, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}
            onPress={() => {
              triggerFeedback.tap();
              setExportFormat('pdf');
              setIsExportModalOpen(true);
            }}
          >
            <Ionicons name="document-text-outline" size={14} color="#111D23" />
            <Text style={[styles.btnWhiteText, { color: '#111D23' }]}>Export PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnWhite, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}
            onPress={() => {
              triggerFeedback.tap();
              setExportFormat('csv');
              setIsExportModalOpen(true);
            }}
          >
            <Ionicons name="grid-outline" size={14} color="#111D23" />
            <Text style={[styles.btnWhiteText, { color: '#111D23' }]}>Export CSV</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnPrintAudit, { backgroundColor: '#3FAFA9' }]}
            onPress={handlePrintAudit}
          >
            <Ionicons name="print-outline" size={15} color="#FFFFFF" />
            <Text style={styles.btnPrintAuditText}>Print Audit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Sub-Navigation Tabs & Date Range Filter */}
      <View style={styles.subnavRow}>
        {/* Left Sub-nav tabs */}
        <View style={styles.subnavLeft}>
          {(
            [
              { id: 'sales', label: 'Sales Performance' },
              { id: 'inventory', label: 'Inventory Valuation' },
              { id: 'cashier', label: 'Cashier Shift Audits' },
              { id: 'tax', label: 'Tax & VAT Returns' },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.subnavBtn,
                  isActive && { borderBottomColor: '#006A66', borderBottomWidth: 2 },
                ]}
                onPress={() => {
                  triggerFeedback.tap();
                  setActiveTab(tab.id);
                }}
              >
                <Text
                  style={[
                    styles.subnavBtnText,
                    {
                      color: isActive ? '#006A66' : '#6D7A78',
                      fontFamily: isActive ? 'Inter_700Bold' : 'Inter_500Medium',
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Right Date Filter Chips */}
        <View style={styles.dateFilterCluster}>
          {(['Today', 'Yesterday', 'Last 7 Days', 'This Month', 'Custom'] as const).map((d) => {
            const isActive = dateFilter === d;
            return (
              <TouchableOpacity
                key={d}
                style={[
                  styles.dateChip,
                  isActive
                    ? { backgroundColor: '#006A66' }
                    : { backgroundColor: 'transparent' },
                ]}
                onPress={() => {
                  triggerFeedback.tap();
                  setDateFilter(d);
                }}
              >
                <Text
                  style={[
                    styles.dateChipText,
                    {
                      color: isActive ? '#FFFFFF' : '#6D7A78',
                      fontFamily: isActive ? 'Inter_600SemiBold' : 'Inter_500Medium',
                    },
                  ]}
                >
                  {d === 'This Month' ? 'This Month (Oct 2024)' : d === 'Custom' ? '📅 Custom Range' : d}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 3. Four Operational KPI Cards */}
      <View style={styles.kpiRow}>
        {/* Gross Revenue */}
        <View style={[styles.kpiCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
          <View style={styles.kpiTop}>
            <Text style={[styles.kpiTitle, { color: '#6D7A78' }]}>Gross Revenue (October)</Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#E3F0F8' }]}>
              <Ionicons name="wallet-outline" size={16} color="#006A66" />
            </View>
          </View>
          <Text style={[styles.currencyLabel, { color: '#111D23' }]}>KSh</Text>
          <Text style={[styles.kpiValueLarge, { color: '#111D23' }]}>1,842,590.00</Text>
          <View style={styles.kpiSubRow}>
            <View style={[styles.trendBadge, { backgroundColor: '#90F0EA' }]}>
              <Ionicons name="trending-up" size={11} color="#006A66" />
              <Text style={[styles.trendText, { color: '#006A66' }]}>+14.2%</Text>
            </View>
            <Text style={[styles.kpiSubMuted, { color: '#8A969B' }]}>vs Sept (KSh 1.61M)</Text>
          </View>
        </View>

        {/* Total Orders Billed */}
        <View style={[styles.kpiCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
          <View style={styles.kpiTop}>
            <Text style={[styles.kpiTitle, { color: '#6D7A78' }]}>Total Orders Billed</Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#E3F0F8' }]}>
              <Ionicons name="receipt-outline" size={16} color="#006A66" />
            </View>
          </View>
          <Text style={[styles.kpiValueLarge, { color: '#111D23', marginTop: 18 }]}>3,428</Text>
          <View style={[styles.kpiSubRow, { justifyContent: 'space-between', marginTop: 10 }]}>
            <Text style={[styles.kpiSubMuted, { color: '#8A969B' }]}>Basket Velocity</Text>
            <Text style={[styles.kpiSubValDark, { color: '#111D23' }]}>Avg KSh 537.50 / txn</Text>
          </View>
        </View>

        {/* Net Profit Margin */}
        <View style={[styles.kpiCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
          <View style={styles.kpiTop}>
            <Text style={[styles.kpiTitle, { color: '#6D7A78' }]}>Net Profit Margin</Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#E3F0F8' }]}>
              <Ionicons name="pie-chart-outline" size={16} color="#006A66" />
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 18 }}>
            <Text style={[styles.kpiValueLarge, { color: '#111D23' }]}>28.4%</Text>
            <Text style={[styles.kpiSubMuted, { color: '#8A969B' }]}>after COGS</Text>
          </View>
          <View style={[styles.kpiSubRow, { justifyContent: 'space-between', marginTop: 10 }]}>
            <Text style={[styles.kpiSubMuted, { color: '#8A969B' }]}>Est. Gross Margin:</Text>
            <Text style={[styles.kpiSubValDark, { color: '#111D23' }]}>KSh 523,300.00</Text>
          </View>
        </View>

        {/* VAT Remittance (16%) */}
        <View style={[styles.kpiCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
          <View style={styles.kpiTop}>
            <Text style={[styles.kpiTitle, { color: '#6D7A78' }]}>VAT Remittance (16%)</Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#E3F0F8' }]}>
              <Ionicons name="business-outline" size={16} color="#006A66" />
            </View>
          </View>
          <Text style={[styles.currencyLabel, { color: '#111D23' }]}>KSh</Text>
          <Text style={[styles.kpiValueLarge, { color: '#111D23' }]}>254,150.34</Text>
          <View style={styles.kpiSubRow}>
            <View style={[styles.kraBadge, { backgroundColor: '#E8F6F5' }]}>
              <Ionicons name="checkmark-circle" size={12} color="#006A66" />
              <Text style={[styles.kraBadgeText, { color: '#006A66' }]}>KRA eTIMS Validated</Text>
            </View>
            <Text style={[styles.kpiSubMuted, { color: '#8A969B' }]}>Ready for Filing</Text>
          </View>
        </View>
      </View>

      {/* 4. Two Columns: Gross Revenue & Sales Trends (Left) & Payment Channels (Right) */}
      <View style={[styles.midRow, isWide && styles.midRowWide]}>
        {/* Left Card: Chart */}
        <View style={[styles.chartCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
          {/* Header */}
          <View style={styles.chartHeader}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={[styles.chartDot, { backgroundColor: '#006A66' }]} />
                <Text style={[styles.chartTitle, { color: '#111D23' }]}>Gross Revenue &amp; Sales Trends</Text>
              </View>
              <Text style={[styles.chartSub, { color: '#6D7A78' }]}>
                Continuous lane turnover tracking across October 2024
              </Text>
            </View>

            {/* Legend */}
            <View style={styles.legendRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={[styles.legendLine, { backgroundColor: '#006A66' }]} />
                <Text style={[styles.legendText, { color: '#111D23' }]}>Current Cycle</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={[styles.legendLineDashed, { borderColor: '#8A969B' }]} />
                <Text style={[styles.legendText, { color: '#8A969B' }]}>September Base</Text>
              </View>
            </View>
          </View>

          {/* 3 Metric Pills Row matching screenshot */}
          <View style={[styles.metricsStrip, { backgroundColor: '#F4FAFF' }]}>
            <View style={styles.metricStripItem}>
              <Text style={[styles.stripLabel, { color: '#6D7A78' }]}>PEAK DAY (FRIDAY OCT 18)</Text>
              <Text style={[styles.stripVal, { color: '#006A66' }]}>KSh 94,200.00</Text>
            </View>

            <View style={styles.metricStripItem}>
              <Text style={[styles.stripLabel, { color: '#6D7A78' }]}>LOWEST DAY (MONDAY OCT 07)</Text>
              <Text style={[styles.stripVal, { color: '#111D23' }]}>KSh 42,100.00</Text>
            </View>

            <View style={styles.metricStripItem}>
              <Text style={[styles.stripLabel, { color: '#6D7A78' }]}>WEEKEND DAILY AVG</Text>
              <Text style={[styles.stripVal, { color: '#111D23' }]}>KSh 81,400.00</Text>
            </View>
          </View>

          {/* SVG Spline Area Chart */}
          <View style={styles.svgWrap}>
            <Svg width="100%" height={160} viewBox="0 0 650 160">
              <Defs>
                <LinearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#3FAFA9" stopOpacity="0.35" />
                  <Stop offset="1" stopColor="#3FAFA9" stopOpacity="0.0" />
                </LinearGradient>
              </Defs>

              {/* September Base Dashed Line */}
              <Path
                d="M 10 120 C 80 110, 150 125, 230 115 C 310 105, 380 90, 460 100 C 530 110, 590 95, 640 100"
                fill="none"
                stroke="#BCC9C7"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              {/* Current Cycle Filled Spline Area */}
              <Path
                d="M 10 110 C 80 95, 140 120, 200 100 C 260 80, 310 105, 380 75 C 440 45, 490 20, 530 20 C 570 20, 610 65, 640 50 L 640 160 L 10 160 Z"
                fill="url(#chartGrad)"
              />

              {/* Current Cycle Solid Spline Stroke */}
              <Path
                d="M 10 110 C 80 95, 140 120, 200 100 C 260 80, 310 105, 380 75 C 440 45, 490 20, 530 20 C 570 20, 610 65, 640 50"
                fill="none"
                stroke="#006A66"
                strokeWidth="2.5"
              />

              {/* Markers */}
              <Circle cx="200" cy="100" r="3.5" fill="#FFFFFF" stroke="#006A66" strokeWidth="2" />
              <Circle cx="530" cy="20" r="4.5" fill="#FFFFFF" stroke="#006A66" strokeWidth="2.5" />
              <Circle cx="640" cy="50" r="3.5" fill="#FFFFFF" stroke="#006A66" strokeWidth="2" />
            </Svg>

            {/* X-Axis Labels */}
            <View style={styles.xAxisRow}>
              <Text style={styles.xAxisText}>Oct 01</Text>
              <Text style={styles.xAxisText}>Oct 07 (Low)</Text>
              <Text style={styles.xAxisText}>Oct 14</Text>
              <Text style={[styles.xAxisText, { color: '#006A66', fontWeight: '700' }]}>Oct 18 (Peak)</Text>
              <Text style={styles.xAxisText}>Oct 24</Text>
              <Text style={styles.xAxisText}>Oct 31</Text>
            </View>
          </View>
        </View>

        {/* Right Card: Payment Channels Donut & Breakdown */}
        <View style={[styles.channelsCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
          <View style={styles.channelsHeader}>
            <View>
              <Text style={[styles.channelsTitle, { color: '#111D23' }]}>Payment Channels</Text>
              <Text style={[styles.channelsSub, { color: '#6D7A78' }]}>
                Volume share across register payment gateways
              </Text>
            </View>
            <View style={[styles.tenderBadge, { backgroundColor: '#E8F6F5' }]}>
              <Text style={[styles.tenderBadgeText, { color: '#006A66' }]}>Tender Share</Text>
            </View>
          </View>

          {/* Donut Chart Visual */}
          <View style={styles.donutContainer}>
            <Svg width={140} height={140} viewBox="0 0 100 100">
              {/* Card (22%) - Cyan */}
              <Circle
                cx="50"
                cy="50"
                r="38"
                stroke="#90F0EA"
                strokeWidth="11"
                fill="none"
                strokeDasharray="238.7"
                strokeDashoffset="0"
              />
              {/* Register Cash (11%) - Gray */}
              <Circle
                cx="50"
                cy="50"
                r="38"
                stroke="#CFDCE4"
                strokeWidth="11"
                fill="none"
                strokeDasharray="26.2 212.5"
                strokeDashoffset="-52.5"
              />
              {/* EFT / Transfer (3%) - Charcoal */}
              <Circle
                cx="50"
                cy="50"
                r="38"
                stroke="#263238"
                strokeWidth="11"
                fill="none"
                strokeDasharray="7.1 231.6"
                strokeDashoffset="-78.7"
              />
              {/* M-Pesa Mobile (64%) - Dark Teal */}
              <Circle
                cx="50"
                cy="50"
                r="38"
                stroke="#006A66"
                strokeWidth="11"
                fill="none"
                strokeDasharray="152.7 86"
                strokeDashoffset="-85.8"
              />
            </Svg>

            <View style={styles.donutCenter}>
              <Text style={[styles.donutPct, { color: '#111D23' }]}>64%</Text>
              <Text style={[styles.donutLabel, { color: '#006A66' }]}>M-PESA DOMINANT</Text>
            </View>
          </View>

          {/* Breakdown List matching screenshot */}
          <View style={styles.channelsList}>
            <View style={styles.channelRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                <View style={[styles.dot, { backgroundColor: '#006A66' }]} />
                <Text style={[styles.channelName, { color: '#111D23' }]}>M-Pesa Mobile</Text>
              </View>
              <Text style={[styles.channelPct, { color: '#6D7A78' }]}>64%</Text>
              <Text style={[styles.channelVal, { color: '#111D23' }]}>KSh 1,179,257</Text>
            </View>

            <View style={styles.channelRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                <View style={[styles.dot, { backgroundColor: '#90F0EA' }]} />
                <Text style={[styles.channelName, { color: '#111D23' }]}>Card (Visa / MC)</Text>
              </View>
              <Text style={[styles.channelPct, { color: '#6D7A78' }]}>22%</Text>
              <Text style={[styles.channelVal, { color: '#111D23' }]}>KSh 405,370</Text>
            </View>

            <View style={styles.channelRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                <View style={[styles.dot, { backgroundColor: '#CFDCE4' }]} />
                <Text style={[styles.channelName, { color: '#111D23' }]}>Register Cash</Text>
              </View>
              <Text style={[styles.channelPct, { color: '#6D7A78' }]}>11%</Text>
              <Text style={[styles.channelVal, { color: '#111D23' }]}>KSh 202,685</Text>
            </View>

            <View style={styles.channelRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                <View style={[styles.dot, { backgroundColor: '#263238' }]} />
                <Text style={[styles.channelName, { color: '#111D23' }]}>EFT / Transfer</Text>
              </View>
              <Text style={[styles.channelPct, { color: '#6D7A78' }]}>3%</Text>
              <Text style={[styles.channelVal, { color: '#111D23' }]}>KSh 55,278</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 5. Two Columns: Category Turnover (Left) & Cashier Shift & Till Audit (Right) */}
      <View style={[styles.midRow, isWide && styles.midRowWide]}>
        {/* Left Card: Category Turnover & Velocity */}
        <View style={[styles.categoryCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.cardTitle, { color: '#111D23' }]}>Category Turnover &amp; Velocity</Text>
              <Text style={[styles.cardSub, { color: '#6D7A78' }]}>Top revenue contributing departments</Text>
            </View>
            <View style={[styles.badgePill, { backgroundColor: '#E3F0F8' }]}>
              <Text style={[styles.badgePillText, { color: '#006A66' }]}>5 Active Depts</Text>
            </View>
          </View>

          <View style={styles.deptList}>
            {/* Dept 1 */}
            <View style={styles.deptItem}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={[styles.deptName, { color: '#111D23' }]}>Beverages &amp; Soft Drinks</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Text style={[styles.deptVol, { color: '#6D7A78' }]}>34% vol</Text>
                  <Text style={[styles.deptRev, { color: '#111D23' }]}>KSh 626,480.00</Text>
                </View>
              </View>
              <View style={[styles.deptTrack, { backgroundColor: '#E8ECEF' }]}>
                <View style={[styles.deptFill, { width: '34%', backgroundColor: '#006A66' }]} />
              </View>
            </View>

            {/* Dept 2 */}
            <View style={styles.deptItem}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={[styles.deptName, { color: '#111D23' }]}>Groceries &amp; Dry Pantry</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Text style={[styles.deptVol, { color: '#6D7A78' }]}>28% vol</Text>
                  <Text style={[styles.deptRev, { color: '#111D23' }]}>KSh 515,925.00</Text>
                </View>
              </View>
              <View style={[styles.deptTrack, { backgroundColor: '#E8ECEF' }]}>
                <View style={[styles.deptFill, { width: '28%', backgroundColor: '#006A66' }]} />
              </View>
            </View>

            {/* Dept 3 */}
            <View style={styles.deptItem}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={[styles.deptName, { color: '#111D23' }]}>Bakery &amp; Fresh Food</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Text style={[styles.deptVol, { color: '#6D7A78' }]}>18% vol</Text>
                  <Text style={[styles.deptRev, { color: '#111D23' }]}>KSh 331,666.00</Text>
                </View>
              </View>
              <View style={[styles.deptTrack, { backgroundColor: '#E8ECEF' }]}>
                <View style={[styles.deptFill, { width: '18%', backgroundColor: '#006A66' }]} />
              </View>
            </View>

            {/* Dept 4 */}
            <View style={styles.deptItem}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={[styles.deptName, { color: '#111D23' }]}>Personal Care &amp; Hygiene</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Text style={[styles.deptVol, { color: '#6D7A78' }]}>12% vol</Text>
                  <Text style={[styles.deptRev, { color: '#111D23' }]}>KSh 221,110.00</Text>
                </View>
              </View>
              <View style={[styles.deptTrack, { backgroundColor: '#E8ECEF' }]}>
                <View style={[styles.deptFill, { width: '12%', backgroundColor: '#3FAFA9' }]} />
              </View>
            </View>

            {/* Dept 5 */}
            <View style={styles.deptItem}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={[styles.deptName, { color: '#111D23' }]}>Household &amp; Cleaning</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Text style={[styles.deptVol, { color: '#6D7A78' }]}>8% vol</Text>
                  <Text style={[styles.deptRev, { color: '#111D23' }]}>KSh 147,409.00</Text>
                </View>
              </View>
              <View style={[styles.deptTrack, { backgroundColor: '#E8ECEF' }]}>
                <View style={[styles.deptFill, { width: '8%', backgroundColor: '#CFDCE4' }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Right Card: Cashier Shift & Till Audit */}
        <View style={[styles.auditCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.cardTitle, { color: '#111D23' }]}>Cashier Shift &amp; Till Audit</Text>
              <Text style={[styles.cardSub, { color: '#6D7A78' }]}>
                Daily lane checkout volumes and cash variances
              </Text>
            </View>
            <Ionicons name="calculator-outline" size={16} color="#6D7A78" />
          </View>

          {/* Audit Table */}
          <View style={[styles.auditTable, { borderColor: '#E8ECEF' }]}>
            <View style={[styles.auditHeadRow, { backgroundColor: '#F4FAFF' }]}>
              <Text style={[styles.auditTh, { flex: 2 }]}>CASHIER / LANE</Text>
              <Text style={[styles.auditTh, { width: 55, textAlign: 'center' }]}>TXNS</Text>
              <Text style={[styles.auditTh, { width: 95, textAlign: 'right' }]}>SETTLED TOTAL</Text>
              <Text style={[styles.auditTh, { width: 110, textAlign: 'right' }]}>TILL VARIANCE</Text>
            </View>

            {/* Cashier 1 */}
            <View style={[styles.auditRow, { borderBottomColor: '#E8ECEF' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 2 }}>
                <View style={[styles.avatarInit, { backgroundColor: '#E3F0F8' }]}>
                  <Text style={[styles.avatarInitText, { color: '#006A66' }]}>JD</Text>
                </View>
                <View>
                  <Text style={[styles.auditName, { color: '#111D23' }]}>John Doe</Text>
                  <Text style={[styles.auditSub, { color: '#6D7A78' }]}>Register Lane #01</Text>
                </View>
              </View>
              <Text style={[styles.auditCell, { width: 55, textAlign: 'center' }]}>412</Text>
              <Text style={[styles.auditVal, { width: 95, textAlign: 'right' }]}>KSh 221,400</Text>
              <View style={{ width: 110, alignItems: 'flex-end' }}>
                <View style={[styles.varianceBadge, { backgroundColor: '#E8F6F5' }]}>
                  <Text style={[styles.varianceText, { color: '#006A66' }]}>Balanced (KSh 0.00)</Text>
                </View>
              </View>
            </View>

            {/* Cashier 2 */}
            <View style={[styles.auditRow, { borderBottomColor: '#E8ECEF' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 2 }}>
                <View style={[styles.avatarInit, { backgroundColor: '#90F0EA' }]}>
                  <Text style={[styles.avatarInitText, { color: '#006A66' }]}>MC</Text>
                </View>
                <View>
                  <Text style={[styles.auditName, { color: '#111D23' }]}>Mercy Chebet</Text>
                  <Text style={[styles.auditSub, { color: '#6D7A78' }]}>Register Lane #02</Text>
                </View>
              </View>
              <Text style={[styles.auditCell, { width: 55, textAlign: 'center' }]}>388</Text>
              <Text style={[styles.auditVal, { width: 95, textAlign: 'right' }]}>KSh 198,650</Text>
              <View style={{ width: 110, alignItems: 'flex-end' }}>
                <View style={[styles.varianceBadge, { backgroundColor: '#FEF6EC' }]}>
                  <Text style={[styles.varianceText, { color: '#F2A541' }]}>+KSh 50.00</Text>
                </View>
              </View>
            </View>

            {/* Cashier 3 */}
            <View style={[styles.auditRow, { borderBottomColor: '#E8ECEF' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 2 }}>
                <View style={[styles.avatarInit, { backgroundColor: '#FFDAD6' }]}>
                  <Text style={[styles.avatarInitText, { color: '#BA1A1A' }]}>KM</Text>
                </View>
                <View>
                  <Text style={[styles.auditName, { color: '#111D23' }]}>Kelvin Mwangi</Text>
                  <Text style={[styles.auditSub, { color: '#6D7A78' }]}>Register Lane #03</Text>
                </View>
              </View>
              <Text style={[styles.auditCell, { width: 55, textAlign: 'center' }]}>340</Text>
              <Text style={[styles.auditVal, { width: 95, textAlign: 'right' }]}>KSh 174,200</Text>
              <View style={{ width: 110, alignItems: 'flex-end' }}>
                <View style={[styles.varianceBadge, { backgroundColor: '#FFDAD6' }]}>
                  <Text style={[styles.varianceText, { color: '#BA1A1A' }]}>-KSh 20.00</Text>
                </View>
              </View>
            </View>

            {/* Cashier 4 */}
            <View style={styles.auditRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 2 }}>
                <View style={[styles.avatarInit, { backgroundColor: '#E3F0F8' }]}>
                  <Text style={[styles.avatarInitText, { color: '#006A66' }]}>FA</Text>
                </View>
                <View>
                  <Text style={[styles.auditName, { color: '#111D23' }]}>Faith Achieng</Text>
                  <Text style={[styles.auditSub, { color: '#6D7A78' }]}>Register Lane #01 (PM)</Text>
                </View>
              </View>
              <Text style={[styles.auditCell, { width: 55, textAlign: 'center' }]}>295</Text>
              <Text style={[styles.auditVal, { width: 95, textAlign: 'right' }]}>KSh 152,800</Text>
              <View style={{ width: 110, alignItems: 'flex-end' }}>
                <View style={[styles.varianceBadge, { backgroundColor: '#E8F6F5' }]}>
                  <Text style={[styles.varianceText, { color: '#006A66' }]}>Balanced (KSh 0.00)</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Footer discrepancy line */}
          <View style={styles.auditFooter}>
            <Text style={[styles.discrepancyText, { color: '#111D23' }]}>
              Overall Drawer Discrepancy: <Text style={{ color: '#006A66', fontWeight: '700' }}>+KSh 30.00 Net</Text>
            </Text>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={[styles.zReportLink, { color: '#006A66' }]}>View Shift Z-Reports</Text>
              <Ionicons name="arrow-forward" size={12} color="#006A66" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 6. Bottom Section: Inventory Valuation & Depletion Summary Card */}
      <View style={[styles.inventoryCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
        {/* Header */}
        <View style={styles.invHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
            <View style={[styles.invHeaderIcon, { backgroundColor: '#006A66' }]}>
              <Ionicons name="cube" size={16} color="#FFFFFF" />
            </View>
            <View>
              <Text style={[styles.invTitle, { color: '#111D23' }]}>
                Inventory Valuation &amp; Depletion Summary
              </Text>
              <Text style={[styles.invSub, { color: '#6D7A78' }]}>
                Active warehouse and store-floor stock valuation matrix
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[styles.syncText, { color: '#8A969B' }]}>Live sync: 2 mins ago</Text>
            <TouchableOpacity onPress={() => triggerFeedback.tap()}>
              <Ionicons name="refresh" size={14} color="#6D7A78" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 4 Valuation Sub-Boxes */}
        <View style={styles.valBoxesGrid}>
          {/* Box 1 */}
          <View style={[styles.valBox, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' }]}>
            <View style={styles.valBoxTop}>
              <Text style={[styles.valBoxLabel, { color: '#6D7A78' }]}>Catalog Valuation</Text>
              <Ionicons name="wallet-outline" size={14} color="#006A66" />
            </View>
            <Text style={[styles.valBoxNumber, { color: '#111D23' }]}>KSh 6,420,000.00</Text>
            <Text style={[styles.valBoxSub, { color: '#8A969B' }]}>Across 1,420 active SKU records</Text>
            <View style={[styles.boxProgressTrack, { backgroundColor: '#E8ECEF' }]}>
              <View style={[styles.boxProgressFill, { width: '85%', backgroundColor: '#006A66' }]} />
            </View>
          </View>

          {/* Box 2 */}
          <View style={[styles.valBox, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' }]}>
            <View style={styles.valBoxTop}>
              <Text style={[styles.valBoxLabel, { color: '#6D7A78' }]}>Fast Turnover SKUs</Text>
              <Ionicons name="flash-outline" size={14} color="#006A66" />
            </View>
            <Text style={[styles.valBoxNumber, { color: '#111D23' }]}>184 Products</Text>
            <Text style={[styles.valBoxSub, { color: '#8A969B' }]}>&gt; 15 units depleted per 24 hours</Text>
            <Text style={[styles.valBoxFoot, { color: '#006A66' }]}>Generates 68% of daily GMV</Text>
          </View>

          {/* Box 3 */}
          <View style={[styles.valBox, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' }]}>
            <View style={styles.valBoxTop}>
              <Text style={[styles.valBoxLabel, { color: '#6D7A78' }]}>Dead Stock / Idle SKUs</Text>
              <Ionicons name="warning-outline" size={14} color="#BA1A1A" />
            </View>
            <Text style={[styles.valBoxNumber, { color: '#BA1A1A' }]}>12 Items Flagged</Text>
            <Text style={[styles.valBoxSub, { color: '#8A969B' }]}>Zero movement in past 45 days</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[styles.valBoxSub, { color: '#111D23' }]}>Capital Tied: KSh 84,300</Text>
              <TouchableOpacity>
                <Text style={[styles.valBoxLink, { color: '#BA1A1A' }]}>Markdown</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Box 4 */}
          <View style={[styles.valBox, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' }]}>
            <View style={styles.valBoxTop}>
              <Text style={[styles.valBoxLabel, { color: '#6D7A78' }]}>Reorder Requirements</Text>
              <Ionicons name="cart-outline" size={14} color="#006A66" />
            </View>
            <Text style={[styles.valBoxNumber, { color: '#111D23' }]}>28 Purchase Orders</Text>
            <Text style={[styles.valBoxSub, { color: '#8A969B' }]}>Stock units below safety thresholds</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[styles.valBoxSub, { color: '#111D23' }]}>Est. PO Value: KSh 412K</Text>
              <TouchableOpacity>
                <Text style={[styles.valBoxLink, { color: '#006A66' }]}>Create POs</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Catalog Health Ratio Multi-Segment Bar matching screenshot */}
        <View style={styles.healthSection}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <Text style={[styles.healthLabel, { color: '#6D7A78' }]}>Catalog Health Ratio</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={[styles.legendDot, { backgroundColor: '#006A66' }]} />
                <Text style={[styles.healthLegendText, { color: '#6D7A78' }]}>Optimal (78%)</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={[styles.legendDot, { backgroundColor: '#3FAFA9' }]} />
                <Text style={[styles.healthLegendText, { color: '#6D7A78' }]}>Low Stock (14%)</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={[styles.legendDot, { backgroundColor: '#BA1A1A' }]} />
                <Text style={[styles.healthLegendText, { color: '#6D7A78' }]}>Understocked/Depleted (8%)</Text>
              </View>
            </View>
          </View>

          {/* Segmented Bar */}
          <View style={styles.segmentTrack}>
            <View style={[styles.segment, { width: '78%', backgroundColor: '#006A66' }]} />
            <View style={[styles.segment, { width: '14%', backgroundColor: '#3FAFA9' }]} />
            <View style={[styles.segment, { width: '8%', backgroundColor: '#BA1A1A' }]} />
          </View>
        </View>
      </View>

      {/* Export Report Form Modal */}
      <ExportReportModal
        visible={isExportModalOpen}
        defaultFormat={exportFormat}
        onClose={() => setIsExportModalOpen(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 22,
    gap: 16,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 16,
  },
  headingCol: {
    maxWidth: 620,
  },
  tagline: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  heading: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
  },
  topActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnWhite: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
  },
  btnWhiteText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  btnPrintAudit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 8,
  },
  btnPrintAuditText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  subnavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECEF',
    paddingBottom: 2,
  },
  subnavLeft: {
    flexDirection: 'row',
    gap: 18,
  },
  subnavBtn: {
    paddingBottom: 8,
  },
  subnavBtnText: {
    fontSize: 13,
  },
  dateFilterCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  dateChipText: {
    fontSize: 11,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 14,
    flexWrap: 'wrap',
  },
  kpiCard: {
    flex: 1,
    minWidth: 200,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  kpiTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  kpiTitle: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  kpiIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencyLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 4,
  },
  kpiValueLarge: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginVertical: 2,
  },
  kpiSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trendText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  kpiSubMuted: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  kpiSubValDark: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    fontVariant: ['tabular-nums'],
  },
  kraBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  kraBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
  midRow: {
    flexDirection: 'column',
    gap: 14,
  },
  midRowWide: {
    flexDirection: 'row',
  },
  chartCard: {
    flex: 1.8,
    borderRadius: 12,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 10,
  },
  chartDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chartTitle: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  chartSub: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  legendLine: {
    width: 14,
    height: 3,
    borderRadius: 1.5,
  },
  legendLineDashed: {
    width: 14,
    height: 0,
    borderTopWidth: 2,
    borderStyle: 'dashed',
  },
  legendText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  metricsStrip: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 10,
  },
  metricStripItem: {
    flex: 1,
    gap: 2,
  },
  stripLabel: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  stripVal: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    fontVariant: ['tabular-nums'],
  },
  svgWrap: {
    marginTop: 4,
  },
  xAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: 4,
  },
  xAxisText: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    color: '#8A969B',
  },
  channelsCard: {
    flex: 1.2,
    borderRadius: 12,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  channelsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  channelsTitle: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  channelsSub: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
    maxWidth: 200,
  },
  tenderBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  tenderBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
  donutContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 140,
    position: 'relative',
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutPct: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
  },
  donutLabel: {
    fontSize: 8,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  channelsList: {
    gap: 8,
    marginTop: 4,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  channelName: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  channelPct: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    width: 32,
    textAlign: 'right',
  },
  channelVal: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    fontVariant: ['tabular-nums'],
    width: 95,
    textAlign: 'right',
  },
  categoryCard: {
    flex: 1.4,
    borderRadius: 12,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  cardSub: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgePillText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
  deptList: {
    gap: 12,
  },
  deptItem: {
    gap: 2,
  },
  deptName: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  deptVol: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  deptRev: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    fontVariant: ['tabular-nums'],
  },
  deptTrack: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  deptFill: {
    height: '100%',
    borderRadius: 3,
  },
  auditCard: {
    flex: 1.6,
    borderRadius: 12,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  auditTable: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  auditHeadRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  auditTh: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
    color: '#6D7A78',
  },
  auditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  avatarInit: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
  auditName: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  auditSub: {
    fontSize: 9,
    fontFamily: 'Inter_400Regular',
  },
  auditCell: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#111D23',
  },
  auditVal: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    fontVariant: ['tabular-nums'],
    color: '#111D23',
  },
  varianceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  varianceText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
  auditFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  discrepancyText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  zReportLink: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  inventoryCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  invHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invHeaderIcon: {
    width: 30,
    height: 30,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  invTitle: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  invSub: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  syncText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  valBoxesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  valBox: {
    flex: 1,
    minWidth: 200,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  valBoxTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valBoxLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  valBoxNumber: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    fontVariant: ['tabular-nums'],
    marginVertical: 2,
  },
  valBoxSub: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
  },
  boxProgressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  boxProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  valBoxFoot: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 2,
  },
  valBoxLink: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
  healthSection: {
    borderTopWidth: 1,
    borderTopColor: '#E8ECEF',
    paddingTop: 10,
  },
  healthLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  healthLegendText: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  segmentTrack: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#E8ECEF',
  },
  segment: {
    height: '100%',
  },
});
