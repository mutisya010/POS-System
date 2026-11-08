import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  useWindowDimensions,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect } from 'react-native-svg';
import * as Print from 'expo-print';
import { usePOS } from '../context/POSContext';
import { triggerFeedback } from '../utils/sound';
import { formatCurrency } from '../utils/formatters';

export type SettingsTab = 'store' | 'tax' | 'receipt' | 'payments' | 'hardware';

export const SettingsScreen: React.FC = () => {
  const { theme, storeSettings, updateStoreSettings } = usePOS();
  const { width } = useWindowDimensions();
  const isWide = width >= 1180;

  // Active tab defaults to 'tax' so user directly sees the comprehensive Tax & eTIMS Section
  const [activeTab, setActiveTab] = useState<SettingsTab>('tax');

  // ----------------------------------------------------
  // STORE PROFILE & BRANCH STATES
  // ----------------------------------------------------
  const [storeDisplayName, setStoreDisplayName] = useState(
    storeSettings.storeName || 'Landmark Stores - Nairobi Flagship'
  );
  const [legalEntity, setLegalEntity] = useState(
    storeSettings.legalEntity || 'Landmark Retail Solutions East Africa'
  );
  const [kraPin, setKraPin] = useState(storeSettings.taxId || 'P051284920K');
  const [branchCode, setBranchCode] = useState(storeSettings.branchCode || 'NBO-FLG-001');
  const [phone, setPhone] = useState(storeSettings.phone || '+254 722 123 456');
  const [email, setEmail] = useState(storeSettings.officialEmail || 'flagship@landmarkstores.co.ke');
  const [address, setAddress] = useState(
    storeSettings.address ||
      'Ground Floor, Landmark Plaza, Argwings Kodhek Rd, Kilimani, Nairobi, Kenya'
  );
  const [portalUrl, setPortalUrl] = useState(
    storeSettings.portalUrl || 'https://www.landmarkstores.co.ke'
  );
  const [currency, setCurrency] = useState('KES - Kenyan Shilling (KSh)');

  // ----------------------------------------------------
  // TAX & KRA eTIMS COMPLIANCE STATES
  // ----------------------------------------------------
  const [standardVat, setStandardVat] = useState('16.0');
  const [zeroVat, setZeroVat] = useState('0.0');
  const [exemptVat, setExemptVat] = useState('0.0');
  const [fuelLevy, setFuelLevy] = useState('8.0');
  const [taxMode, setTaxMode] = useState<'inclusive' | 'exclusive'>(
    storeSettings.taxInclusivePricing === false ? 'exclusive' : 'inclusive'
  );
  const [vscuId, setVscuId] = useState(storeSettings.vscuId || 'KRA-VSCU-2024-004120');
  const [embedFiscalQr, setEmbedFiscalQr] = useState(storeSettings.embedFiscalQr ?? true);
  const [realtimeTransmittal, setRealtimeTransmittal] = useState(
    storeSettings.realtimeKRaTransmittal ?? true
  );
  const [b2bPinPrompt, setB2bPinPrompt] = useState(true);
  const [offlineBufferHours, setOfflineBufferHours] = useState('24');
  const [signingKeyHash, setSigningKeyHash] = useState('QRTR-CK31-4491-9204-A312');
  const [invoicePrefix, setInvoicePrefix] = useState('001-INV-2024-');

  // Telemetry & interactive ping state
  const [isPinging, setIsPinging] = useState(false);
  const [pingLatency, setPingLatency] = useState<number | null>(28);
  const [lastPingTimestamp, setLastPingTimestamp] = useState('Just now');
  const [isResyncingBuffer, setIsResyncingBuffer] = useState(false);
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<string | null>(null);

  // ----------------------------------------------------
  // RECEIPT CUSTOMIZATION & DESIGNER STATES
  // ----------------------------------------------------
  const [paperWidth, setPaperWidth] = useState<'80mm' | '58mm'>(
    storeSettings.paperWidth || '80mm'
  );
  const [receiptStoreHeader, setReceiptStoreHeader] = useState('LANDMARK STORES');
  const [receiptBranchHeader, setReceiptBranchHeader] = useState('NAIROBI FLAGSHIP STORE');
  const [showLogo, setShowLogo] = useState(storeSettings.showLogoAtTop ?? true);
  const [logoSize, setLogoSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [printAddress, setPrintAddress] = useState(storeSettings.printAddress ?? true);
  const [printTel, setPrintTel] = useState(true);
  const [printTaxPin, setPrintTaxPin] = useState(true);

  // Line items formatting
  const [printCashier, setPrintCashier] = useState(storeSettings.printCashierAndLane ?? true);
  const [displayTier, setDisplayTier] = useState(storeSettings.displayLoyaltyTier ?? true);
  const [printSkuLines, setPrintSkuLines] = useState(true);
  const [printItemUnitPrice, setPrintItemUnitPrice] = useState(true);
  const [itemizedVat, setItemizedVat] = useState(storeSettings.itemizedVatBreakdown ?? true);
  const [etimsQr, setEtimsQr] = useState(storeSettings.etimsQrAndSignature ?? true);
  const [printMpesaRef, setPrintMpesaRef] = useState(true);

  // Greetings, Vouchers & Footers
  const [receiptGreeting, setReceiptGreeting] = useState(
    storeSettings.receiptHeaderGreeting ||
      'Thank you for shopping at Landmark Stores! Fresh goods, unbeatable everyday value.'
  );
  const [printPromoVoucher, setPrintPromoVoucher] = useState(true);
  const [promoVoucherText, setPromoVoucherText] = useState(
    'NEXT VISIT 10% OFF GROCERIES: CODE NEXT10'
  );
  const [receiptFooter, setReceiptFooter] = useState(
    storeSettings.receiptFooter ||
      'Goods once sold can only be returned within 30 days with a valid receipt. Terms & conditions apply. Keep your receipt for warranty.'
  );
  const [feedbackUrl, setFeedbackUrl] = useState('feedback.landmarkstores.co.ke');

  // Hardware emulation & cutter
  const [thermalDensity, setThermalDensity] = useState<'standard' | 'dark' | 'eco'>('standard');
  const [autoCutMode, setAutoCutMode] = useState<'partial' | 'full' | 'none'>('partial');
  const [cashDrawerKick, setCashDrawerKick] = useState(true);
  const [feedLines, setFeedLines] = useState(3);

  // ----------------------------------------------------
  // PAYMENT GATEWAY & HARDWARE STATES
  // ----------------------------------------------------
  const [mpesaShortcode, setMpesaShortcode] = useState('174379');
  const [mpesaTillNumber, setMpesaTillNumber] = useState('5489201');
  const [mpesaApiKey, setMpesaApiKey] = useState('live_sec_ke_90412894109412');
  const [cardTerminalId, setCardTerminalId] = useState('PDQ-EMV-9901');

  const [printerModel, setPrinterModel] = useState('Epson TM-T88VI High-Speed Thermal');
  const [printerPort, setPrinterPort] = useState('USB Port 002 (VID: 04B8 / PID: 0202)');
  const [baudRate, setBaudRate] = useState('115200');
  const [barcodeScanner, setBarcodeScanner] = useState('Opticon OPR-3201 Laser Barcode Wedge');

  const [isSavedRecently, setIsSavedRecently] = useState(false);

  // ----------------------------------------------------
  // HANDLERS
  // ----------------------------------------------------
  const handleSaveSettings = () => {
    triggerFeedback.success();
    updateStoreSettings({
      storeName: storeDisplayName,
      legalEntity,
      taxId: kraPin,
      branchCode,
      phone,
      officialEmail: email,
      address,
      portalUrl,
      currencyCode: currency,
      taxRateDefault: parseFloat(standardVat) / 100 || 0.16,
      zeroRatedVatRate: parseFloat(zeroVat) / 100 || 0.0,
      taxInclusivePricing: taxMode === 'inclusive',
      vscuId,
      embedFiscalQr,
      realtimeKRaTransmittal: realtimeTransmittal,
      paperWidth,
      showLogoAtTop: showLogo,
      printAddress,
      printCashierAndLane: printCashier,
      displayLoyaltyTier: displayTier,
      itemizedVatBreakdown: itemizedVat,
      etimsQrAndSignature: etimsQr,
      receiptHeaderGreeting: receiptGreeting,
      receiptFooter,
    });
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 3000);
  };

  const handleDiscard = () => {
    triggerFeedback.warning();
    setStandardVat('16.0');
    setZeroVat('0.0');
    setTaxMode('inclusive');
    setEmbedFiscalQr(true);
    setRealtimeTransmittal(true);
    setB2bPinPrompt(true);
    setPaperWidth(storeSettings.paperWidth || '80mm');
    setShowLogo(storeSettings.showLogoAtTop ?? true);
    setReceiptGreeting(
      storeSettings.receiptHeaderGreeting ||
        'Thank you for shopping at Landmark Stores! Fresh goods, unbeatable everyday value.'
    );
    setReceiptFooter(
      storeSettings.receiptFooter ||
        'Goods once sold can only be returned within 30 days with a valid receipt. Terms & conditions apply. Keep your receipt for warranty.'
    );
  };

  const handlePingKraGateway = () => {
    triggerFeedback.tap();
    setIsPinging(true);
    setTimeout(() => {
      const generatedLatency = Math.floor(Math.random() * 8) + 24; // 24-31ms
      setPingLatency(generatedLatency);
      setLastPingTimestamp(new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setIsPinging(false);
      triggerFeedback.success();
      Alert.alert(
        'KRA eTIMS Gateway Ping Successful',
        `Endpoint: https://etims.kra.go.ke/api/v2/vscu\nLatency: ${generatedLatency}ms • TLS 1.3\nVSCU Device: ${vscuId}\nTaxpayer PIN: ${kraPin}\nSession Token: ACK-${Math.floor(100000 + Math.random() * 900000)}`
      );
    }, 600);
  };

  const handleResyncQueue = () => {
    triggerFeedback.tap();
    setIsResyncingBuffer(true);
    setTimeout(() => {
      setIsResyncingBuffer(false);
      triggerFeedback.success();
      Alert.alert(
        'Buffer Ledger Synchronized',
        '0 pending offline invoices in local SQLite vault. All fiscal payloads acknowledged by KRA eTIMS virtual control server.'
      );
    }, 750);
  };

  const handleRunVscuDiagnostic = () => {
    triggerFeedback.tap();
    setIsDiagnosticRunning(true);
    setTimeout(() => {
      setIsDiagnosticRunning(false);
      triggerFeedback.success();
      setDiagnosticResult('All 4 Fiscal Subsystems Operational: RTC Clock Drift (+0.08s) OK, Cryptographic RSA Signer (2048-bit) OK, Fiscal Counter Integrity (Seq #00420) OK, KRA Transport Tunnel (TLS 1.3) OK.');
      Alert.alert(
        'VSCU Diagnostic Self-Test (Pass)',
        '✓ RTC Clock Drift (+0.08s) Synchronized\n✓ Cryptographic RSA Signer (2048-bit) Verified\n✓ Fiscal Counter Integrity (Seq #00420) Aligned\n✓ KRA Transport Tunnel (TLS 1.3) Connected\n\nOverall Status: 100% KRA Fiscal Compliance.'
      );
    }, 850);
  };

  const handleExportVatSchedule = () => {
    triggerFeedback.tap();
    const csvContent =
      'Tax Schedule,Rate (%),Gross Sales (KSh),Net Taxable (KSh),VAT Output (KSh),Status\n' +
      'Standard Rate (Merchandise/Groceries),16.0%,1842590.00,1588439.66,254150.34,eTIMS Validated\n' +
      'Zero-Rated (Produce/Flour/Milk),0.0%,345200.00,345200.00,0.00,eTIMS Validated\n' +
      'Exempt Categories (Medical/Pharma),0.0%,84500.00,84500.00,0.00,eTIMS Validated\n' +
      'TOTAL REMITTANCE PAYABLE,,2272290.00,2018139.66,254150.34,Ready For iTax Upload\n';

    if (Platform.OS === 'web') {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `KRA_VAT3_Remittance_${new Date().toISOString().slice(0, 7)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      Alert.alert('VAT Remittance Exported', 'KRA iTax VAT-3 breakdown exported to device storage.');
    }
  };

  const handleExportConfig = async () => {
    triggerFeedback.tap();
    const configData = JSON.stringify(
      {
        exportDate: new Date().toISOString(),
        node: 'POS Node v2.4-PROD',
        kraCompliance: {
          vscuId,
          taxpayerPin: kraPin,
          standardVatRate: `${standardVat}%`,
          zeroRatedVatRate: `${zeroVat}%`,
          exemptVatRate: `${exemptVat}%`,
          taxMode,
          embedFiscalQr,
          realtimeTransmittal,
          b2bPinPrompt,
          signingKeyHash,
          offlineBufferHours,
        },
        thermalReceiptDesigner: {
          paperWidth,
          receiptStoreHeader,
          receiptBranchHeader,
          showLogo,
          logoSize,
          printAddress,
          printTel,
          printTaxPin,
          printCashier,
          displayTier,
          printSkuLines,
          printItemUnitPrice,
          itemizedVat,
          etimsQr,
          printMpesaRef,
          receiptGreeting,
          printPromoVoucher,
          promoVoucherText,
          receiptFooter,
          feedbackUrl,
          thermalDensity,
          autoCutMode,
          cashDrawerKick,
          feedLines,
        },
      },
      null,
      2
    );

    if (Platform.OS === 'web') {
      const blob = new Blob([configData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Landmark_System_Config_${paperWidth}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      Alert.alert('Template Exported', 'Thermal receipt and eTIMS system config JSON exported.');
    }
  };

  const handlePrintSampleSlip = async () => {
    triggerFeedback.tap();
    const isInclusive = taxMode === 'inclusive';
    const subtotal = 1370.0;
    const discount = 68.5;
    const netPayable = isInclusive ? 1301.5 : 1301.5 * 1.16;
    const taxableValue = isInclusive ? 1301.5 / 1.16 : 1301.5;
    const vatAmount = isInclusive ? 1301.5 - taxableValue : 1301.5 * 0.16;

    const slipHtml = `
      <html>
        <head>
          <style>
            body { font-family: monospace; padding: 15px; max-width: ${paperWidth === '80mm' ? '320px' : '240px'}; margin: 0 auto; font-size: ${paperWidth === '80mm' ? '11px' : '9.5px'}; color: #111; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-bottom: 1px dashed #333; margin: 6px 0; }
            .row { display: flex; justify-content: space-between; margin: 2px 0; }
            .voucher-box { border: 2px dashed #006A66; padding: 6px; text-align: center; margin: 8px 0; background: #E8F6F5; }
          </style>
        </head>
        <body>
          ${showLogo ? '<div class="center bold" style="font-size: 15px; border: 2px solid #222; border-radius: 50%; width: 30px; height: 30px; line-height: 28px; margin: 0 auto 6px auto;">LM</div>' : ''}
          <div class="center bold" style="font-size: 14px;">${receiptStoreHeader}</div>
          <div class="center bold">${receiptBranchHeader}</div>
          ${printAddress ? `<div class="center">${address}</div>` : ''}
          ${printTel ? `<div class="center">Tel: ${phone} / 020 445010</div>` : ''}
          ${printTaxPin ? `<div class="center bold">PIN: ${kraPin} | TAX REGISTER</div>` : ''}
          <div class="line"></div>
          <div class="row"><span>Receipt #:</span><span class="bold">RCP-2024-00420</span></div>
          <div class="row"><span>Date:</span><span>25-Oct-2024 14:42:15</span></div>
          ${printCashier ? '<div class="row"><span>Lane / Pos:</span><span>#01 (Cashier: John Doe #402)</span></div>' : ''}
          <div class="row"><span>Customer:</span><span>Wanjiku Mwangi ${displayTier ? '(Gold VIP)' : ''}</span></div>
          <div class="line"></div>
          <div class="row bold"><span>ITEM</span><span>QTY</span><span>TOTAL</span></div>
          <div class="line"></div>
          <div class="row"><span>Cappuccino Delight ${printItemUnitPrice ? '@ 350.00' : ''}</span><span>2</span><span>700.00</span></div>
          ${printSkuLines ? '<div style="font-size: 8px; color: #555;">SKU-BVG-9021 • 61611000882</div>' : ''}
          <div class="row"><span>Artisan Seed Loaf ${printItemUnitPrice ? '@ 80.00' : ''}</span><span>1</span><span>80.00</span></div>
          <div class="row"><span>Highland Water 1L ${printItemUnitPrice ? '@ 80.00' : ''}</span><span>3</span><span>240.00</span></div>
          <div class="row"><span>Golden Fry Corn 1L ${printItemUnitPrice ? '@ 350.00' : ''}</span><span>1</span><span>350.00</span></div>
          <div class="line"></div>
          <div class="row"><span>SUBTOTAL:</span><span>KSh ${subtotal.toFixed(2)}</span></div>
          <div class="row"><span>PROMO DISCOUNT (5%):</span><span>-KSh ${discount.toFixed(2)}</span></div>
          <div class="row bold" style="font-size: 13px;"><span>TOTAL PAYABLE:</span><span>KSh ${netPayable.toFixed(2)}</span></div>
          <div class="line"></div>
          ${
            itemizedVat
              ? `
            <div class="bold">TAX ANALYSIS (${isInclusive ? '16% INCL' : '16% EXCL'}):</div>
            <div class="row"><span>${isInclusive ? '16% TAXABLE VALUE:' : 'NET TAXABLE VALUE:'}</span><span>KSh ${taxableValue.toFixed(2)}</span></div>
            <div class="row"><span>VAT 16% AMOUNT:</span><span>KSh ${vatAmount.toFixed(2)}</span></div>
            <div class="row"><span>ZERO-RATED / EXEMPT:</span><span>KSh 0.00</span></div>
            <div class="line"></div>
          `
              : ''
          }
          ${
            printMpesaRef
              ? `
            <div class="row bold"><span>PAYMENT: M-PESA</span><span>KSh ${netPayable.toFixed(2)}</span></div>
            <div class="row" style="font-size: 9px;"><span>Ref: QK7492PL89</span><span>STATUS: CONFIRMED</span></div>
            <div class="line"></div>
          `
              : ''
          }
          ${
            embedFiscalQr && etimsQr
              ? `
            <div class="center bold">KRA eTIMS FISCAL VALIDATION</div>
            <div class="center" style="font-size: 9px; margin-top: 4px;">VSCU: ${vscuId}</div>
            <div class="center" style="font-size: 9px; margin-top: 2px;">${signingKeyHash}</div>
            <div class="line"></div>
          `
              : ''
          }
          ${
            printPromoVoucher
              ? `
            <div class="voucher-box">
              <div class="bold" style="font-size: 10px;">★ SPECIAL NEXT-VISIT VOUCHER ★</div>
              <div style="font-size: 9px; margin-top: 2px;">${promoVoucherText}</div>
            </div>
            <div class="line"></div>
          `
              : ''
          }
          <div class="center" style="font-size: 9.5px;">"${receiptGreeting}"</div>
          <div class="center" style="font-size: 9px; margin-top: 4px;">"${receiptFooter}"</div>
          <div class="center" style="font-size: 8.5px; margin-top: 4px; color: #555;">Rate your store visit: ${feedbackUrl}</div>
          <div class="line"></div>
          <div class="center" style="font-size: 8.5px;">POWERED BY LANDMARK STORES POS v2.4</div>
        </body>
      </html>
    `;
    try {
      await Print.printAsync({ html: slipHtml });
    } catch (e) {
      console.warn(e);
    }
  };

  const handleCutAndFeed = () => {
    triggerFeedback.tap();
    Alert.alert(
      'Epson TM-T88VI Actuated',
      `Advanced ${feedLines} blank thermal lines & executed ${autoCutMode} auto-cut pulse.`
    );
  };

  // Tax calculations for the live thermal slip preview
  const previewIsInclusive = taxMode === 'inclusive';
  const previewGross = 1301.5;
  const previewTaxable = previewIsInclusive ? previewGross / 1.16 : previewGross;
  const previewVat = previewIsInclusive ? previewGross - previewTaxable : previewGross * 0.16;
  const previewTotal = previewIsInclusive ? previewGross : previewGross + previewVat;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Top Header Banner */}
      <View style={styles.headerRow}>
        <View style={styles.titleColumn}>
          <View style={styles.headingPillRow}>
            <Text style={[styles.mainHeading, { color: theme.textPrimary }]}>
              Settings &amp; System Preferences
            </Text>
            <View style={[styles.nodeBadge, { backgroundColor: '#E3F0F8' }]}>
              <View style={styles.nodeGreenDot} />
              <Text style={[styles.nodeBadgeText, { color: '#006A66' }]}>POS Node v2.4-PROD</Text>
            </View>
          </View>
          <Text style={[styles.subText, { color: theme.textSecondary }]}>
            Manage store identity, KRA eTIMS tax compliance rules, thermal receipt formatting, payment
            gateways, and POS hardware peripherals.
          </Text>
        </View>

        {/* Action Button Cluster */}
        <View style={styles.actionBtnCluster}>
          <TouchableOpacity
            style={[styles.btnOutline, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}
            onPress={handleExportConfig}
            activeOpacity={0.8}
          >
            <Ionicons name="download-outline" size={15} color="#263238" />
            <Text style={[styles.btnOutlineText, { color: '#263238' }]}>Export System Config</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnGhost} onPress={handleDiscard} activeOpacity={0.7}>
            <Text style={[styles.btnGhostText, { color: '#6D7A78' }]}>Discard Changes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.btnPrimary,
              { backgroundColor: isSavedRecently ? '#32B67A' : '#006A66' },
            ]}
            onPress={handleSaveSettings}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isSavedRecently ? 'checkmark-circle' : 'checkmark-outline'}
              size={16}
              color="#FFFFFF"
            />
            <Text style={styles.btnPrimaryText}>
              {isSavedRecently ? 'Settings Saved!' : 'Save Settings'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Sub-Navigation Tabs Bar */}
      <View style={[styles.tabBarCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          {/* Store Information */}
          <TouchableOpacity
            style={[
              styles.tabPill,
              activeTab === 'store' && { backgroundColor: '#E8F6F5', borderColor: '#3FAFA9' },
            ]}
            onPress={() => {
              triggerFeedback.tap();
              setActiveTab('store');
            }}
          >
            <Ionicons
              name="storefront-outline"
              size={16}
              color={activeTab === 'store' ? '#006A66' : '#6D7A78'}
            />
            <Text
              style={[
                styles.tabPillText,
                { color: activeTab === 'store' ? '#006A66' : '#263238' },
                activeTab === 'store' && { fontFamily: 'Inter_700Bold' },
              ]}
            >
              Store Information
            </Text>
          </TouchableOpacity>

          {/* Tax & eTIMS Tab (Active Focus) */}
          <TouchableOpacity
            style={[
              styles.tabPill,
              activeTab === 'tax' && { backgroundColor: '#E8F6F5', borderColor: '#3FAFA9' },
            ]}
            onPress={() => {
              triggerFeedback.tap();
              setActiveTab('tax');
            }}
          >
            <Ionicons
              name="receipt-outline"
              size={16}
              color={activeTab === 'tax' ? '#006A66' : '#6D7A78'}
            />
            <Text
              style={[
                styles.tabPillText,
                { color: activeTab === 'tax' ? '#006A66' : '#263238' },
                activeTab === 'tax' && { fontFamily: 'Inter_700Bold' },
              ]}
            >
              Tax &amp; eTIMS
            </Text>
            <View style={[styles.activeMiniChip, { backgroundColor: '#006A66' }]}>
              <Text style={styles.activeMiniChipText}>ACTIVE</Text>
            </View>
          </TouchableOpacity>

          {/* Receipt Customization */}
          <TouchableOpacity
            style={[
              styles.tabPill,
              activeTab === 'receipt' && { backgroundColor: '#E8F6F5', borderColor: '#3FAFA9' },
            ]}
            onPress={() => {
              triggerFeedback.tap();
              setActiveTab('receipt');
            }}
          >
            <Ionicons
              name="print-outline"
              size={16}
              color={activeTab === 'receipt' ? '#006A66' : '#6D7A78'}
            />
            <Text
              style={[
                styles.tabPillText,
                { color: activeTab === 'receipt' ? '#006A66' : '#263238' },
                activeTab === 'receipt' && { fontFamily: 'Inter_700Bold' },
              ]}
            >
              Receipt Customization
            </Text>
          </TouchableOpacity>

          {/* Payment Gateways */}
          <TouchableOpacity
            style={[
              styles.tabPill,
              activeTab === 'payments' && { backgroundColor: '#E8F6F5', borderColor: '#3FAFA9' },
            ]}
            onPress={() => {
              triggerFeedback.tap();
              setActiveTab('payments');
            }}
          >
            <Ionicons
              name="card-outline"
              size={16}
              color={activeTab === 'payments' ? '#006A66' : '#6D7A78'}
            />
            <Text
              style={[
                styles.tabPillText,
                { color: activeTab === 'payments' ? '#006A66' : '#263238' },
                activeTab === 'payments' && { fontFamily: 'Inter_700Bold' },
              ]}
            >
              Payment Gateways
            </Text>
          </TouchableOpacity>

          {/* Hardware & Peripherals */}
          <TouchableOpacity
            style={[
              styles.tabPill,
              activeTab === 'hardware' && { backgroundColor: '#E8F6F5', borderColor: '#3FAFA9' },
            ]}
            onPress={() => {
              triggerFeedback.tap();
              setActiveTab('hardware');
            }}
          >
            <Ionicons
              name="hardware-chip-outline"
              size={16}
              color={activeTab === 'hardware' ? '#006A66' : '#6D7A78'}
            />
            <Text
              style={[
                styles.tabPillText,
                { color: activeTab === 'hardware' ? '#006A66' : '#263238' },
                activeTab === 'hardware' && { fontFamily: 'Inter_700Bold' },
              ]}
            >
              Hardware &amp; Peripherals
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 3. Main Two-Column Layout */}
      <View style={[styles.mainLayout, isWide ? styles.mainLayoutWide : styles.mainLayoutStack]}>
        {/* Left Column: Configuration Panels */}
        <View style={isWide ? styles.leftColWide : styles.leftColStack}>
          {/* ========================================================= */}
          {/* TAB: TAX & eTIMS SECTION (REQUESTED WORK FOCUS)           */}
          {/* ========================================================= */}
          {activeTab === 'tax' && (
            <>
              {/* Card 1: Store Profile & Branch Details (As in Design) */}
              <View style={[styles.panelCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
                <View style={styles.panelHeaderRow}>
                  <View style={styles.panelTitleCluster}>
                    <View style={[styles.iconBox, { backgroundColor: '#E8F6F5' }]}>
                      <Ionicons name="business" size={18} color="#006A66" />
                    </View>
                    <View>
                      <Text style={[styles.panelTitle, { color: theme.textPrimary }]}>
                        Store Profile &amp; Branch Details
                      </Text>
                      <Text style={[styles.panelSub, { color: theme.textSecondary }]}>
                        Brand presence and operational contact information used across invoices, reports,
                        and receipts.
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.branchPill, { backgroundColor: '#E3F0F8' }]}>
                    <Text style={styles.branchPillText}>Branch #001</Text>
                  </View>
                </View>

                {/* Brand Mark Banner */}
                <View style={[styles.brandMarkContainer, { backgroundColor: '#F4FAFF', borderColor: '#CFDCE4' }]}>
                  <View style={styles.brandMarkLeft}>
                    <View style={styles.brandMarkBadge}>
                      <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color: '#006A66' }}>LM</Text>
                    </View>
                    <View>
                      <Text style={styles.brandMarkTitle}>Store Brand Mark &amp; Seal</Text>
                      <Text style={styles.brandMarkSub}>
                        Display on 80mm thermal headers and custom/or tax receipts. Max 2MB (SVG, PNG).
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.btnOutline, { backgroundColor: '#FFFFFF', borderColor: '#CFDCE4' }]}
                    onPress={() => {
                      triggerFeedback.tap();
                      Alert.alert('Store Logo', 'Store brand seal updated.');
                    }}
                  >
                    <Text style={[styles.btnOutlineText, { color: '#006A66' }]}>Change Logo</Text>
                  </TouchableOpacity>
                </View>

                {/* Form Fields Grid */}
                <View style={styles.formGrid}>
                  <View style={styles.fieldRow}>
                    <View style={styles.fieldCol}>
                      <Text style={styles.inputLabel}>Store Display Name *</Text>
                      <TextInput
                        style={[styles.inputField, { borderColor: '#E8ECEF', color: theme.textPrimary }]}
                        value={storeDisplayName}
                        onChangeText={setStoreDisplayName}
                      />
                    </View>
                    <View style={styles.fieldCol}>
                      <Text style={styles.inputLabel}>Legal Registered Entity *</Text>
                      <TextInput
                        style={[styles.inputField, { borderColor: '#E8ECEF', color: theme.textPrimary }]}
                        value={legalEntity}
                        onChangeText={setLegalEntity}
                      />
                    </View>
                  </View>

                  <View style={styles.fieldRow}>
                    <View style={styles.fieldCol}>
                      <Text style={styles.inputLabel}>KRA Tax PIN *</Text>
                      <View style={{ position: 'relative', justifyContent: 'center' }}>
                        <TextInput
                          style={[styles.inputField, { borderColor: '#E8ECEF', color: theme.textPrimary, paddingRight: 32 }]}
                          value={kraPin}
                          onChangeText={setKraPin}
                        />
                        <View style={{ position: 'absolute', right: 10 }}>
                          <Ionicons name="checkmark-circle" size={18} color="#32B67A" />
                        </View>
                      </View>
                    </View>
                    <View style={styles.fieldCol}>
                      <Text style={styles.inputLabel}>Branch Identification Code</Text>
                      <TextInput
                        style={[styles.inputField, { borderColor: '#E8ECEF', color: theme.textPrimary }]}
                        value={branchCode}
                        onChangeText={setBranchCode}
                      />
                    </View>
                  </View>

                  <View style={styles.fieldRow}>
                    <View style={styles.fieldCol}>
                      <Text style={styles.inputLabel}>Store Support Phone *</Text>
                      <TextInput
                        style={[styles.inputField, { borderColor: '#E8ECEF', color: theme.textPrimary }]}
                        value={phone}
                        onChangeText={setPhone}
                      />
                    </View>
                    <View style={styles.fieldCol}>
                      <Text style={styles.inputLabel}>Official Store Email *</Text>
                      <TextInput
                        style={[styles.inputField, { borderColor: '#E8ECEF', color: theme.textPrimary }]}
                        value={email}
                        onChangeText={setEmail}
                      />
                    </View>
                  </View>

                  <View style={styles.fieldRowFull}>
                    <Text style={styles.inputLabel}>Physical Location &amp; Mall Premise *</Text>
                    <TextInput
                      style={[styles.inputField, { borderColor: '#E8ECEF', color: theme.textPrimary }]}
                      value={address}
                      onChangeText={setAddress}
                    />
                  </View>

                  <View style={styles.fieldRow}>
                    <View style={styles.fieldCol}>
                      <Text style={styles.inputLabel}>Store Portal URL</Text>
                      <TextInput
                        style={[styles.inputField, { borderColor: '#E8ECEF', color: theme.textPrimary }]}
                        value={portalUrl}
                        onChangeText={setPortalUrl}
                      />
                    </View>
                    <View style={styles.fieldCol}>
                      <Text style={styles.inputLabel}>Operating Ledger Currency</Text>
                      <TextInput
                        style={[styles.inputField, { borderColor: '#E8ECEF', color: theme.textPrimary, backgroundColor: '#F9FAFB' }]}
                        value={currency}
                        editable={false}
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* Card 2: Central Tax Rules & Fiscal eTIMS Integration Console */}
              <View style={[styles.panelCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
                <View style={styles.panelHeaderRow}>
                  <View style={styles.panelTitleCluster}>
                    <View style={[styles.iconBox, { backgroundColor: '#E3F0F8' }]}>
                      <Ionicons name="newspaper-outline" size={18} color="#006A66" />
                    </View>
                    <View>
                      <Text style={[styles.panelTitle, { color: theme.textPrimary }]}>
                        Tax Rules &amp; Fiscal eTIMS Integration
                      </Text>
                      <Text style={[styles.panelSub, { color: theme.textSecondary }]}>
                        Kenya Revenue Authority statutory compliance and virtual fiscal transmission.
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.badgeActiveEtims, { backgroundColor: '#E8F6F5' }]}>
                    <View style={styles.etimsGreenDot} />
                    <Text style={styles.badgeActiveEtimsText}>KRA eTIMS Active</Text>
                  </View>
                </View>

                {/* Statutory Value Added Tax Mandate Callout Box */}
                <View style={[styles.statutoryBanner, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}>
                  <Ionicons name="information-circle" size={20} color="#0284C7" style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.statutoryTitle, { color: '#0369A1' }]}>
                      Statutory Value Added Tax Mandate
                    </Text>
                    <Text style={[styles.statutoryBody, { color: '#0C4A6E' }]}>
                      Standard Value Added Tax (VAT) in Kenya is currently 16%. Any rate modification
                      must comply with Kenya Revenue Authority (KRA) eTIMS guidelines. Store
                      administrators must verify applicable schedules before committing changes.
                    </Text>
                  </View>
                </View>

                {/* Tax Rate Schedules Grid */}
                <View style={[styles.fieldRow, { marginTop: 14 }]}>
                  <View style={styles.fieldCol}>
                    <Text style={styles.inputLabel}>Standard VAT Rate</Text>
                    <View style={{ position: 'relative', justifyContent: 'center' }}>
                      <TextInput
                        style={[
                          styles.inputField,
                          { borderColor: '#E8ECEF', color: theme.textPrimary, paddingRight: 28 },
                        ]}
                        value={standardVat}
                        onChangeText={setStandardVat}
                        keyboardType="decimal-pad"
                      />
                      <Text style={styles.percentSymbol}>%</Text>
                    </View>
                    <Text style={styles.fieldHint}>
                      Applies to general merchandise, grocery, apparel
                    </Text>
                  </View>

                  <View style={styles.fieldCol}>
                    <Text style={styles.inputLabel}>Zero-Rated VAT Schedule</Text>
                    <View style={{ position: 'relative', justifyContent: 'center' }}>
                      <TextInput
                        style={[
                          styles.inputField,
                          { borderColor: '#E8ECEF', color: theme.textPrimary, paddingRight: 28 },
                        ]}
                        value={zeroVat}
                        onChangeText={setZeroVat}
                        keyboardType="decimal-pad"
                      />
                      <Text style={styles.percentSymbol}>%</Text>
                    </View>
                    <Text style={styles.fieldHint}>
                      Basic unrefined foodstuffs (fresh milk, raw maize, flour)
                    </Text>
                  </View>
                </View>

                {/* POS Tax Computation Mode Radio Cards */}
                <View style={{ marginTop: 16 }}>
                  <Text style={styles.inputLabel}>POS Tax Computation Mode</Text>
                  <View style={[styles.fieldRow, { marginTop: 4 }]}>
                    {/* Tax Inclusive Pricing */}
                    <TouchableOpacity
                      style={[
                        styles.modeSelectCard,
                        taxMode === 'inclusive'
                          ? { borderColor: '#3FAFA9', backgroundColor: '#E8F6F5' }
                          : { borderColor: '#E8ECEF', backgroundColor: '#FFFFFF' },
                      ]}
                      onPress={() => {
                        triggerFeedback.tap();
                        setTaxMode('inclusive');
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View
                          style={[
                            styles.radioCircle,
                            taxMode === 'inclusive' && styles.radioCircleActive,
                          ]}
                        >
                          {taxMode === 'inclusive' && <View style={styles.radioDot} />}
                        </View>
                        <Text
                          style={[
                            styles.modeSelectTitle,
                            { color: taxMode === 'inclusive' ? '#006A66' : '#111D23' },
                          ]}
                        >
                          Tax Inclusive Pricing (Recommended)
                        </Text>
                      </View>
                      <Text style={styles.modeSelectSub}>
                        Shelf and catalog prices already include 16% VAT. Tax breakdown is deducted
                        automatically in ledger (Tax = Price × 16/116).
                      </Text>
                    </TouchableOpacity>

                    {/* Tax Exclusive Pricing */}
                    <TouchableOpacity
                      style={[
                        styles.modeSelectCard,
                        taxMode === 'exclusive'
                          ? { borderColor: '#3FAFA9', backgroundColor: '#E8F6F5' }
                          : { borderColor: '#E8ECEF', backgroundColor: '#FFFFFF' },
                      ]}
                      onPress={() => {
                        triggerFeedback.tap();
                        setTaxMode('exclusive');
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View
                          style={[
                            styles.radioCircle,
                            taxMode === 'exclusive' && styles.radioCircleActive,
                          ]}
                        >
                          {taxMode === 'exclusive' && <View style={styles.radioDot} />}
                        </View>
                        <Text
                          style={[
                            styles.modeSelectTitle,
                            { color: taxMode === 'exclusive' ? '#006A66' : '#111D23' },
                          ]}
                        >
                          Tax Exclusive Pricing
                        </Text>
                      </View>
                      <Text style={styles.modeSelectSub}>
                        16% VAT is calculated and appended on top of the subtotal at checkout tender
                        (Total = Subtotal + 16%).
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* KRA Virtual Control Unit (VSCU) Specs Box */}
                <View
                  style={[
                    styles.vscuBox,
                    { backgroundColor: '#F4FAFF', borderColor: '#CFDCE4', marginTop: 16 },
                  ]}
                >
                  <View style={styles.vscuHeaderRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons name="shield-checkmark" size={17} color="#006A66" />
                      <Text style={styles.vscuHeading}>KRA Virtual Control Unit (VSCU) Specs</Text>
                    </View>
                    <View style={[styles.idBadge, { backgroundColor: '#FFFFFF', borderColor: '#CFDCE4' }]}>
                      <Text style={styles.idBadgeText}>ID: {vscuId}</Text>
                    </View>
                  </View>

                  {/* Switch Rows */}
                  <View style={[styles.fieldRow, { marginTop: 8 }]}>
                    <View style={styles.toggleCard}>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={styles.toggleCardTitle}>Embed Fiscal QR Slip</Text>
                        <Text style={styles.toggleCardSub}>
                          Render dynamic KRA verification code on slip
                        </Text>
                      </View>
                      <Switch
                        value={embedFiscalQr}
                        onValueChange={(val) => {
                          triggerFeedback.tap();
                          setEmbedFiscalQr(val);
                        }}
                        trackColor={{ false: '#CFDCE4', true: '#3FAFA9' }}
                        thumbColor={embedFiscalQr ? '#006A66' : '#FFFFFF'}
                      />
                    </View>

                    <View style={styles.toggleCard}>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={styles.toggleCardTitle}>Realtime Auto-Transmittal</Text>
                        <Text style={styles.toggleCardSub}>
                          Send tax ledger to KRA on payment completion
                        </Text>
                      </View>
                      <Switch
                        value={realtimeTransmittal}
                        onValueChange={(val) => {
                          triggerFeedback.tap();
                          setRealtimeTransmittal(val);
                        }}
                        trackColor={{ false: '#CFDCE4', true: '#3FAFA9' }}
                        thumbColor={realtimeTransmittal ? '#006A66' : '#FFFFFF'}
                      />
                    </View>
                  </View>

                  {/* Offline Ledger Buffer Window */}
                  <View style={[styles.bufferRow, { marginTop: 12 }]}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.bufferTitle}>Offline Ledger Buffer Window</Text>
                        <View style={styles.bufferPill}>
                          <Text style={styles.bufferPillText}>24 Hours Authorized</Text>
                        </View>
                      </View>
                      <Text style={styles.bufferSub}>
                        Transactions are encrypted and queued locally if broadband connectivity is lost
                        during rush hours.
                      </Text>
                    </View>
                  </View>

                  {/* Corporate B2B Buyer PIN Requirement Toggle */}
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 12,
                      paddingTop: 10,
                      borderTopWidth: 1,
                      borderTopColor: '#E2E8F0',
                    }}
                  >
                    <View style={{ flex: 1, paddingRight: 10 }}>
                      <Text style={styles.toggleCardTitle}>
                        Mandate Buyer PIN on B2B Checkouts (&gt; KSh 10,000)
                      </Text>
                      <Text style={styles.toggleCardSub}>
                        Prompts register cashier for customer KRA PIN for business input tax deductions.
                      </Text>
                    </View>
                    <Switch
                      value={b2bPinPrompt}
                      onValueChange={(val) => {
                        triggerFeedback.tap();
                        setB2bPinPrompt(val);
                      }}
                      trackColor={{ false: '#CFDCE4', true: '#3FAFA9' }}
                      thumbColor={b2bPinPrompt ? '#006A66' : '#FFFFFF'}
                    />
                  </View>
                </View>

                {/* Gateway Live Telemetry & Interactive Actions Box */}
                <View style={[styles.telemetryCard, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', marginTop: 16 }]}>
                  <View style={styles.telemetryTopRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={[styles.statusDot, { backgroundColor: '#32B67A' }]} />
                      <Text style={styles.telemetryHeading}>
                        KRA eTIMS Gateway Connected (TLS 1.3)
                      </Text>
                    </View>
                    <View style={styles.latencyPill}>
                      <Ionicons name="speedometer-outline" size={13} color="#006A66" />
                      <Text style={styles.latencyPillText}>
                        {pingLatency !== null ? `${pingLatency} ms Latency` : 'Measuring...'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.telemetryDetailsGrid}>
                    <View style={styles.telemetryStatCol}>
                      <Text style={styles.telemetryStatLabel}>Total Invoices Transmitted</Text>
                      <Text style={[styles.telemetryStatValue, { fontVariant: ['tabular-nums'] }]}>
                        3,428
                      </Text>
                    </View>
                    <View style={styles.telemetryStatCol}>
                      <Text style={styles.telemetryStatLabel}>Today's Submissions</Text>
                      <Text style={[styles.telemetryStatValue, { fontVariant: ['tabular-nums'] }]}>
                        142
                      </Text>
                    </View>
                    <View style={styles.telemetryStatCol}>
                      <Text style={styles.telemetryStatLabel}>Pending Buffer Queue</Text>
                      <Text
                        style={[
                          styles.telemetryStatValue,
                          { color: '#32B67A', fontVariant: ['tabular-nums'] },
                        ]}
                      >
                        0 (Clear)
                      </Text>
                    </View>
                    <View style={styles.telemetryStatCol}>
                      <Text style={styles.telemetryStatLabel}>Digital Signing Key</Text>
                      <Text style={[styles.telemetryStatValueMonospace]} numberOfLines={1}>
                        {signingKeyHash}
                      </Text>
                    </View>
                  </View>

                  {/* Interactive Trigger Cluster */}
                  <View style={styles.telemetryButtonsRow}>
                    <TouchableOpacity
                      style={[
                        styles.telemetryBtn,
                        { backgroundColor: '#006A66', borderColor: '#006A66' },
                      ]}
                      onPress={handlePingKraGateway}
                      disabled={isPinging}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={isPinging ? 'reload' : 'pulse-outline'}
                        size={15}
                        color="#FFFFFF"
                      />
                      <Text style={[styles.telemetryBtnText, { color: '#FFFFFF' }]}>
                        {isPinging ? 'Pinging Gateway...' : 'Ping KRA eTIMS Server'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.telemetryBtn,
                        { backgroundColor: '#FFFFFF', borderColor: '#CFDCE4' },
                      ]}
                      onPress={handleResyncQueue}
                      disabled={isResyncingBuffer}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={isResyncingBuffer ? 'reload' : 'refresh-outline'}
                        size={15}
                        color="#263238"
                      />
                      <Text style={[styles.telemetryBtnText, { color: '#263238' }]}>
                        {isResyncingBuffer ? 'Resyncing...' : 'Force Resync Buffer'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.telemetryBtn,
                        { backgroundColor: '#FFFFFF', borderColor: '#CFDCE4' },
                      ]}
                      onPress={handleRunVscuDiagnostic}
                      disabled={isDiagnosticRunning}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={isDiagnosticRunning ? 'sync' : 'shield-checkmark-outline'}
                        size={15}
                        color="#263238"
                      />
                      <Text style={[styles.telemetryBtnText, { color: '#263238' }]}>
                        {isDiagnosticRunning ? 'Testing...' : 'VSCU Diagnostic Test'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.telemetryBtn,
                        { backgroundColor: '#FFFFFF', borderColor: '#CFDCE4' },
                      ]}
                      onPress={handleExportVatSchedule}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="document-text-outline" size={15} color="#263238" />
                      <Text style={[styles.telemetryBtnText, { color: '#263238' }]}>
                        Export VAT-3 Return
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Card 3: POS Thermal Receipt Configuration (Matching media_1794084790629_a66377e6.jpg) */}
              <View style={[styles.panelCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
                <View style={styles.panelHeaderRow}>
                  <View style={styles.panelTitleCluster}>
                    <View style={[styles.iconBox, { backgroundColor: '#E8F6F5' }]}>
                      <Ionicons name="receipt-outline" size={18} color="#006A66" />
                    </View>
                    <View>
                      <Text style={[styles.panelTitle, { color: theme.textPrimary }]}>
                        POS Thermal Receipt Configuration
                      </Text>
                      <Text style={[styles.panelSub, { color: theme.textSecondary }]}>
                        Customize receipt roll dimensions, metadata switches, header greetings, and return
                        policies.
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Printer Paper Width Selector */}
                <View style={{ marginTop: 4 }}>
                  <Text style={styles.inputLabel}>Printer Paper Width</Text>
                  <View style={styles.fieldRow}>
                    <TouchableOpacity
                      style={[
                        styles.modeSelectCard,
                        paperWidth === '80mm'
                          ? { borderColor: '#3FAFA9', backgroundColor: '#E8F6F5' }
                          : { borderColor: '#E8ECEF', backgroundColor: '#FFFFFF' },
                      ]}
                      onPress={() => {
                        triggerFeedback.tap();
                        setPaperWidth('80mm');
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.modeSelectTitle,
                          { color: paperWidth === '80mm' ? '#006A66' : '#111D23', textAlign: 'center' },
                        ]}
                      >
                        80mm Standard Thermal (Recommended)
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.modeSelectCard,
                        paperWidth === '58mm'
                          ? { borderColor: '#3FAFA9', backgroundColor: '#E8F6F5' }
                          : { borderColor: '#E8ECEF', backgroundColor: '#FFFFFF' },
                      ]}
                      onPress={() => {
                        triggerFeedback.tap();
                        setPaperWidth('58mm');
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.modeSelectTitle,
                          { color: paperWidth === '58mm' ? '#006A66' : '#111D23', textAlign: 'center' },
                        ]}
                      >
                        58mm Compact Roll
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Header & Transaction Details Toggles (Exact Checkbox Layout) */}
                <View style={{ marginTop: 14 }}>
                  <Text style={styles.inputLabel}>Header &amp; Transaction Details Toggles</Text>
                  <View style={styles.checkboxGrid}>
                    <TouchableOpacity
                      style={styles.checkboxRow}
                      onPress={() => {
                        triggerFeedback.tap();
                        setShowLogo(!showLogo);
                      }}
                    >
                      <View style={[styles.checkboxBox, showLogo && styles.checkboxBoxChecked]}>
                        {showLogo && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                      </View>
                      <Text style={styles.checkboxLabel}>Show Store Logo at Top</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.checkboxRow}
                      onPress={() => {
                        triggerFeedback.tap();
                        setPrintAddress(!printAddress);
                      }}
                    >
                      <View style={[styles.checkboxBox, printAddress && styles.checkboxBoxChecked]}>
                        {printAddress && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                      </View>
                      <Text style={styles.checkboxLabel}>Print Store Physical Address</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.checkboxRow}
                      onPress={() => {
                        triggerFeedback.tap();
                        setPrintCashier(!printCashier);
                      }}
                    >
                      <View style={[styles.checkboxBox, printCashier && styles.checkboxBoxChecked]}>
                        {printCashier && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                      </View>
                      <Text style={styles.checkboxLabel}>Print Cashier Name &amp; Lane ID</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.checkboxRow}
                      onPress={() => {
                        triggerFeedback.tap();
                        setDisplayTier(!displayTier);
                      }}
                    >
                      <View style={[styles.checkboxBox, displayTier && styles.checkboxBoxChecked]}>
                        {displayTier && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                      </View>
                      <Text style={styles.checkboxLabel}>Display Customer Loyalty Tier</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.checkboxRow}
                      onPress={() => {
                        triggerFeedback.tap();
                        setItemizedVat(!itemizedVat);
                      }}
                    >
                      <View style={[styles.checkboxBox, itemizedVat && styles.checkboxBoxChecked]}>
                        {itemizedVat && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                      </View>
                      <Text style={styles.checkboxLabel}>Itemized VAT Breakdown (16%)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.checkboxRow}
                      onPress={() => {
                        triggerFeedback.tap();
                        setEtimsQr(!etimsQr);
                      }}
                    >
                      <View style={[styles.checkboxBox, etimsQr && styles.checkboxBoxChecked]}>
                        {etimsQr && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                      </View>
                      <Text style={styles.checkboxLabel}>eTIMS QR Code &amp; Signature</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Custom Receipt Header Greeting */}
                <View style={{ marginTop: 14 }}>
                  <Text style={styles.inputLabel}>Custom Receipt Header Greeting</Text>
                  <TextInput
                    style={[styles.inputField, { borderColor: '#E8ECEF', color: theme.textPrimary }]}
                    value={receiptGreeting}
                    onChangeText={setReceiptGreeting}
                  />
                </View>

                {/* Return Policy & Warranty Terms (Footer) */}
                <View style={{ marginTop: 14 }}>
                  <Text style={styles.inputLabel}>Return Policy &amp; Warranty Terms (Footer)</Text>
                  <TextInput
                    style={[styles.inputFieldMulti, { borderColor: '#E8ECEF', color: theme.textPrimary }]}
                    value={receiptFooter}
                    onChangeText={setReceiptFooter}
                    multiline
                    numberOfLines={2}
                  />
                </View>
              </View>
            </>
          )}

          {/* ========================================================= */}
          {/* TAB: STORE INFORMATION                                    */}
          {/* ========================================================= */}
          {activeTab === 'store' && (
            <View style={[styles.panelCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
              <View style={styles.panelHeaderRow}>
                <View style={styles.panelTitleCluster}>
                  <View style={[styles.iconBox, { backgroundColor: '#E8F6F5' }]}>
                    <Ionicons name="business" size={18} color="#006A66" />
                  </View>
                  <View>
                    <Text style={[styles.panelTitle, { color: theme.textPrimary }]}>
                      Store Profile &amp; Branch Details
                    </Text>
                    <Text style={[styles.panelSub, { color: theme.textSecondary }]}>
                      Brand presence and operational contact information used across invoices, reports,
                      and receipts.
                    </Text>
                  </View>
                </View>
                <View style={[styles.branchPill, { backgroundColor: '#E3F0F8' }]}>
                  <Text style={styles.branchPillText}>Branch #001</Text>
                </View>
              </View>

              <View style={styles.formGrid}>
                <View style={styles.fieldRow}>
                  <View style={styles.fieldCol}>
                    <Text style={styles.inputLabel}>Store Display Name *</Text>
                    <TextInput
                      style={[styles.inputField, { borderColor: '#E8ECEF', color: theme.textPrimary }]}
                      value={storeDisplayName}
                      onChangeText={setStoreDisplayName}
                    />
                  </View>
                  <View style={styles.fieldCol}>
                    <Text style={styles.inputLabel}>Legal Registered Entity *</Text>
                    <TextInput
                      style={[styles.inputField, { borderColor: '#E8ECEF', color: theme.textPrimary }]}
                      value={legalEntity}
                      onChangeText={setLegalEntity}
                    />
                  </View>
                </View>

                <View style={styles.fieldRow}>
                  <View style={styles.fieldCol}>
                    <Text style={styles.inputLabel}>KRA Tax PIN *</Text>
                    <TextInput
                      style={[styles.inputField, { borderColor: '#E8ECEF', color: theme.textPrimary }]}
                      value={kraPin}
                      onChangeText={setKraPin}
                    />
                  </View>
                  <View style={styles.fieldCol}>
                    <Text style={styles.inputLabel}>Branch Identification Code</Text>
                    <TextInput
                      style={[styles.inputField, { borderColor: '#E8ECEF', color: theme.textPrimary }]}
                      value={branchCode}
                      onChangeText={setBranchCode}
                    />
                  </View>
                </View>

                <View style={styles.fieldRowFull}>
                  <Text style={styles.inputLabel}>Physical Location &amp; Mall Premise *</Text>
                  <TextInput
                    style={[styles.inputField, { borderColor: '#E8ECEF', color: theme.textPrimary }]}
                    value={address}
                    onChangeText={setAddress}
                  />
                </View>
              </View>
            </View>
          )}

          {/* ========================================================= */}
          {/* TAB: RECEIPT CUSTOMIZATION DESIGNER                       */}
          {/* ========================================================= */}
          {activeTab === 'receipt' && (
            <>
              {/* Module 1: Paper Dimensions & Pitch */}
              <View style={[styles.panelCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
                <View style={styles.panelHeaderRow}>
                  <View style={styles.panelTitleCluster}>
                    <View style={[styles.iconBox, { backgroundColor: '#E8F6F5' }]}>
                      <Ionicons name="options-outline" size={18} color="#006A66" />
                    </View>
                    <View>
                      <Text style={[styles.panelTitle, { color: theme.textPrimary }]}>
                        1. Paper Dimension &amp; Thermal Pitch
                      </Text>
                      <Text style={[styles.panelSub, { color: theme.textSecondary }]}>
                        Configure physical roll diameter, thermal head density, and character pitch.
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.branchPill, { backgroundColor: '#E8F6F5' }]}>
                    <Text style={styles.branchPillText}>203 DPI Pitch</Text>
                  </View>
                </View>

                <View style={styles.fieldRow}>
                  <TouchableOpacity
                    style={[
                      styles.modeSelectCard,
                      paperWidth === '80mm'
                        ? { borderColor: '#3FAFA9', backgroundColor: '#E8F6F5' }
                        : { borderColor: '#E8ECEF', backgroundColor: '#FFFFFF' },
                    ]}
                    onPress={() => {
                      triggerFeedback.tap();
                      setPaperWidth('80mm');
                    }}
                  >
                    <Ionicons
                      name="receipt"
                      size={20}
                      color={paperWidth === '80mm' ? '#006A66' : '#6D7A78'}
                    />
                    <Text
                      style={[
                        styles.modeSelectTitle,
                        { color: paperWidth === '80mm' ? '#006A66' : '#111D23' },
                      ]}
                    >
                      80mm Standard Thermal
                    </Text>
                    <Text style={styles.modeSelectSub}>
                      42-48 Columns • High-throughput multi-lane checkout
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modeSelectCard,
                      paperWidth === '58mm'
                        ? { borderColor: '#3FAFA9', backgroundColor: '#E8F6F5' }
                        : { borderColor: '#E8ECEF', backgroundColor: '#FFFFFF' },
                    ]}
                    onPress={() => {
                      triggerFeedback.tap();
                      setPaperWidth('58mm');
                    }}
                  >
                    <Ionicons
                      name="phone-portrait-outline"
                      size={20}
                      color={paperWidth === '58mm' ? '#006A66' : '#6D7A78'}
                    />
                    <Text
                      style={[
                        styles.modeSelectTitle,
                        { color: paperWidth === '58mm' ? '#006A66' : '#111D23' },
                      ]}
                    >
                      58mm Compact Mobile
                    </Text>
                    <Text style={styles.modeSelectSub}>
                      32 Columns • Handheld Bluetooth &amp; compact counter units
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Module 2: Header Branding & Store Text */}
              <View style={[styles.panelCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
                <View style={styles.panelHeaderRow}>
                  <View style={styles.panelTitleCluster}>
                    <View style={[styles.iconBox, { backgroundColor: '#E8F6F5' }]}>
                      <Ionicons name="text-outline" size={18} color="#006A66" />
                    </View>
                    <View>
                      <Text style={[styles.panelTitle, { color: theme.textPrimary }]}>
                        2. Header Branding &amp; Store Information
                      </Text>
                      <Text style={[styles.panelSub, { color: theme.textSecondary }]}>
                        Customize the text, logos, and tax registration identifiers printed at the top.
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.fieldRow}>
                  <View style={styles.fieldCol}>
                    <Text style={styles.inputLabel}>Receipt Store Header Title</Text>
                    <TextInput
                      style={[styles.inputField, { borderColor: '#E8ECEF', color: theme.textPrimary }]}
                      value={receiptStoreHeader}
                      onChangeText={setReceiptStoreHeader}
                    />
                  </View>
                  <View style={styles.fieldCol}>
                    <Text style={styles.inputLabel}>Receipt Branch Subtitle</Text>
                    <TextInput
                      style={[styles.inputField, { borderColor: '#E8ECEF', color: theme.textPrimary }]}
                      value={receiptBranchHeader}
                      onChangeText={setReceiptBranchHeader}
                    />
                  </View>
                </View>
              </View>
            </>
          )}

          {/* ========================================================= */}
          {/* TAB: PAYMENT GATEWAYS                                     */}
          {/* ========================================================= */}
          {activeTab === 'payments' && (
            <View style={[styles.panelCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
              <View style={styles.panelHeaderRow}>
                <View style={styles.panelTitleCluster}>
                  <View style={[styles.iconBox, { backgroundColor: '#E8F6F5' }]}>
                    <Ionicons name="card" size={18} color="#006A66" />
                  </View>
                  <View>
                    <Text style={[styles.panelTitle, { color: theme.textPrimary }]}>
                      Payment Gateways &amp; Safaricom M-Pesa API
                    </Text>
                    <Text style={[styles.panelSub, { color: theme.textSecondary }]}>
                      Daraja B2C reversal credentials, Till Lipa Na M-Pesa, and EMV PDQ terminals.
                    </Text>
                  </View>
                </View>
                <View style={[styles.branchPill, { backgroundColor: '#E8F6F5' }]}>
                  <Text style={styles.branchPillText}>M-Pesa Production</Text>
                </View>
              </View>

              <View style={styles.formGrid}>
                <View style={styles.fieldRow}>
                  <View style={styles.fieldCol}>
                    <Text style={styles.inputLabel}>Lipa Na M-Pesa Paybill / Shortcode</Text>
                    <TextInput
                      style={[styles.inputField, { borderColor: '#E8ECEF', color: theme.textPrimary }]}
                      value={mpesaShortcode}
                      onChangeText={setMpesaShortcode}
                    />
                  </View>
                  <View style={styles.fieldCol}>
                    <Text style={styles.inputLabel}>Buy Goods Till Number</Text>
                    <TextInput
                      style={[styles.inputField, { borderColor: '#E8ECEF', color: theme.textPrimary }]}
                      value={mpesaTillNumber}
                      onChangeText={setMpesaTillNumber}
                    />
                  </View>
                </View>

                <View style={styles.fieldRow}>
                  <View style={styles.fieldCol}>
                    <Text style={styles.inputLabel}>Safaricom Daraja API Consumer Key</Text>
                    <TextInput
                      style={[styles.inputField, { borderColor: '#E8ECEF', color: theme.textPrimary }]}
                      value={mpesaApiKey}
                      onChangeText={setMpesaApiKey}
                      secureTextEntry
                    />
                  </View>
                  <View style={styles.fieldCol}>
                    <Text style={styles.inputLabel}>EMV Card Terminal ID (PDQ)</Text>
                    <TextInput
                      style={[styles.inputField, { borderColor: '#E8ECEF', color: theme.textPrimary }]}
                      value={cardTerminalId}
                      onChangeText={setCardTerminalId}
                    />
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* ========================================================= */}
          {/* TAB: HARDWARE & PERIPHERALS                               */}
          {/* ========================================================= */}
          {activeTab === 'hardware' && (
            <View style={[styles.panelCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
              <View style={styles.panelHeaderRow}>
                <View style={styles.panelTitleCluster}>
                  <View style={[styles.iconBox, { backgroundColor: '#E8F6F5' }]}>
                    <Ionicons name="hardware-chip" size={18} color="#006A66" />
                  </View>
                  <View>
                    <Text style={[styles.panelTitle, { color: theme.textPrimary }]}>
                      Hardware &amp; Connected Peripherals
                    </Text>
                    <Text style={[styles.panelSub, { color: theme.textSecondary }]}>
                      Thermal printer USB port, Opticon barcode wedge, and APG cash drawer pulse.
                    </Text>
                  </View>
                </View>
                <View style={[styles.branchPill, { backgroundColor: '#E8F6F5' }]}>
                  <Text style={styles.branchPillText}>Peripherals Ready</Text>
                </View>
              </View>

              <View style={styles.formGrid}>
                <View style={styles.fieldRow}>
                  <View style={styles.fieldCol}>
                    <Text style={styles.inputLabel}>Primary Thermal Printer Model</Text>
                    <TextInput
                      style={[styles.inputField, { borderColor: '#E8ECEF', color: theme.textPrimary }]}
                      value={printerModel}
                      onChangeText={setPrinterModel}
                    />
                  </View>
                  <View style={styles.fieldCol}>
                    <Text style={styles.inputLabel}>Communication Port</Text>
                    <TextInput
                      style={[styles.inputField, { borderColor: '#E8ECEF', color: theme.textPrimary }]}
                      value={printerPort}
                      onChangeText={setPrinterPort}
                    />
                  </View>
                </View>

                <View style={styles.fieldRow}>
                  <View style={styles.fieldCol}>
                    <Text style={styles.inputLabel}>Serial Baud Rate</Text>
                    <TextInput
                      style={[styles.inputField, { borderColor: '#E8ECEF', color: theme.textPrimary }]}
                      value={baudRate}
                      onChangeText={setBaudRate}
                    />
                  </View>
                  <View style={styles.fieldCol}>
                    <Text style={styles.inputLabel}>Barcode Scanner Wedge</Text>
                    <TextInput
                      style={[styles.inputField, { borderColor: '#E8ECEF', color: theme.textPrimary }]}
                      value={barcodeScanner}
                      onChangeText={setBarcodeScanner}
                    />
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Right Column: Live Synchronized Thermal Slip Preview (Exact Design Match) */}
        <View style={isWide ? styles.rightColWide : styles.rightColStack}>
          {/* Preview Container Header */}
          <View style={[styles.slipPreviewCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
            <View style={styles.slipCardHeader}>
              <View style={styles.slipCardTitleCluster}>
                <Ionicons name="receipt-outline" size={17} color="#006A66" />
                <Text style={styles.slipCardHeading}>Live Thermal Slip Preview</Text>
              </View>
              <View style={styles.slipCardTools}>
                <View style={styles.paperBadgePill}>
                  <Text style={styles.paperBadgePillText}>{paperWidth} Paper</Text>
                </View>
                <TouchableOpacity
                  style={styles.toolIconBtn}
                  onPress={handlePrintSampleSlip}
                  activeOpacity={0.7}
                >
                  <Ionicons name="print-outline" size={16} color="#263238" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Realistic Thermal Receipt Paper Container */}
            <View
              style={[
                styles.thermalPaperSurface,
                paperWidth === '58mm' && { width: '85%', paddingHorizontal: 10 },
              ]}
            >
              {/* Monogram Seal */}
              {showLogo && (
                <View
                  style={[
                    styles.receiptLogoCircle,
                    logoSize === 'sm' && { width: 26, height: 26, borderRadius: 13 },
                    logoSize === 'lg' && { width: 40, height: 40, borderRadius: 20 },
                  ]}
                >
                  <Text style={styles.receiptLogoText}>LM</Text>
                </View>
              )}

              {/* Store Identity */}
              <Text style={styles.receiptStoreName}>{receiptStoreHeader}</Text>
              <Text style={styles.receiptBranchName}>{receiptBranchHeader}</Text>
              {printAddress && (
                <Text style={styles.receiptAddressText} numberOfLines={1}>
                  {address.split(',')[0]}
                </Text>
              )}
              {printTel && <Text style={styles.receiptTelText}>Tel: {phone} / 020 445010</Text>}
              {printTaxPin && (
                <Text style={styles.receiptPinText}>PIN: {kraPin} | TAX REGISTER</Text>
              )}

              {/* Dashed Separator */}
              <Text style={styles.dashedLine}>- - - - - - - - - - - - - - - - - - - - - - - - - - - -</Text>

              {/* Metadata Cluster */}
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Receipt #:</Text>
                <Text style={styles.metaValueBold}>RCP-2024-00420</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Date:</Text>
                <Text style={styles.metaValue}>25-Oct-2024 14:42:15</Text>
              </View>
              {printCashier && (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Lane / Pos:</Text>
                  <Text style={styles.metaValue}>#01 (Cashier: John Doe #402)</Text>
                </View>
              )}
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Customer:</Text>
                <Text style={styles.metaValue}>
                  Wanjiku Mwangi {displayTier ? '(Gold VIP)' : ''}
                </Text>
              </View>

              {/* Dashed Separator */}
              <Text style={styles.dashedLine}>- - - - - - - - - - - - - - - - - - - - - - - - - - - -</Text>

              {/* Items Table */}
              <View style={styles.itemHeaderRow}>
                <Text style={[styles.itemTh, { flex: 3 }]}>ITEM</Text>
                <Text style={[styles.itemTh, { flex: 1, textAlign: 'center' }]}>QTY</Text>
                <Text style={[styles.itemTh, { flex: 1.5, textAlign: 'right' }]}>TOTAL</Text>
              </View>

              <View style={styles.itemRow}>
                <View style={{ flex: 3 }}>
                  <Text style={styles.itemName}>Cappuccino Delight</Text>
                  {printItemUnitPrice && <Text style={styles.itemPriceSub}>@ 350.00</Text>}
                  {printSkuLines && <Text style={styles.itemSkuSub}>BEV-882 • 61611000882</Text>}
                </View>
                <Text style={[styles.itemQty, { flex: 1 }]}>2</Text>
                <Text style={[styles.itemTotal, { flex: 1.5 }]}>700.00</Text>
              </View>

              <View style={styles.itemRow}>
                <View style={{ flex: 3 }}>
                  <Text style={styles.itemName}>Artisan Seed Loaf</Text>
                  {printItemUnitPrice && <Text style={styles.itemPriceSub}>@ 80.00</Text>}
                </View>
                <Text style={[styles.itemQty, { flex: 1 }]}>1</Text>
                <Text style={[styles.itemTotal, { flex: 1.5 }]}>80.00</Text>
              </View>

              <View style={styles.itemRow}>
                <View style={{ flex: 3 }}>
                  <Text style={styles.itemName}>Highland Water 1L</Text>
                  {printItemUnitPrice && <Text style={styles.itemPriceSub}>@ 80.00</Text>}
                </View>
                <Text style={[styles.itemQty, { flex: 1 }]}>3</Text>
                <Text style={[styles.itemTotal, { flex: 1.5 }]}>240.00</Text>
              </View>

              <View style={styles.itemRow}>
                <View style={{ flex: 3 }}>
                  <Text style={styles.itemName}>Golden Fry Corn 1L</Text>
                  {printItemUnitPrice && <Text style={styles.itemPriceSub}>@ 350.00</Text>}
                </View>
                <Text style={[styles.itemQty, { flex: 1 }]}>1</Text>
                <Text style={[styles.itemTotal, { flex: 1.5 }]}>350.00</Text>
              </View>

              {/* Dashed Separator */}
              <Text style={styles.dashedLine}>- - - - - - - - - - - - - - - - - - - - - - - - - - - -</Text>

              {/* Subtotal & Discount */}
              <View style={styles.ledgerRow}>
                <Text style={styles.ledgerLabel}>SUBTOTAL:</Text>
                <Text style={styles.ledgerValue}>KSh 1,370.00</Text>
              </View>
              <View style={styles.ledgerRow}>
                <Text style={styles.ledgerLabel}>PROMO DISCOUNT (5%):</Text>
                <Text style={styles.ledgerValue}>-KSh 68.50</Text>
              </View>

              <View style={styles.totalPayableRow}>
                <Text style={styles.totalPayableLabel}>TOTAL PAYABLE:</Text>
                <Text style={styles.totalPayableValue}>
                  KSh {previewTotal.toFixed(2)}
                </Text>
              </View>

              {/* Dashed Separator */}
              <Text style={styles.dashedLine}>- - - - - - - - - - - - - - - - - - - - - - - - - - - -</Text>

              {/* Reactive Tax Analysis (Inclusive vs Exclusive) */}
              {itemizedVat && (
                <>
                  <Text style={styles.taxAnalysisHeading}>
                    TAX ANALYSIS ({previewIsInclusive ? '16% INCL' : '16% EXCL'}):
                  </Text>
                  <View style={styles.ledgerRow}>
                    <Text style={styles.ledgerLabel}>
                      {previewIsInclusive ? '16% TAXABLE VALUE:' : 'NET TAXABLE VALUE:'}
                    </Text>
                    <Text style={styles.ledgerValue}>
                      KSh {previewTaxable.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.ledgerRow}>
                    <Text style={styles.ledgerLabel}>VAT 16% AMOUNT:</Text>
                    <Text style={styles.ledgerValue}>
                      KSh {previewVat.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.ledgerRow}>
                    <Text style={styles.ledgerLabel}>ZERO-RATED / EXEMPT:</Text>
                    <Text style={styles.ledgerValue}>KSh 0.00</Text>
                  </View>
                  <Text style={styles.dashedLine}>- - - - - - - - - - - - - - - - - - - - - - - - - - - -</Text>
                </>
              )}

              {/* Tender info */}
              {printMpesaRef && (
                <>
                  <View style={styles.ledgerRow}>
                    <Text style={styles.ledgerLabelBold}>PAYMENT: M-PESA</Text>
                    <Text style={styles.ledgerValueBold}>KSh {previewTotal.toFixed(2)}</Text>
                  </View>
                  <View style={styles.ledgerRow}>
                    <Text style={styles.metaSub}>Ref: QK7492PL89</Text>
                    <Text style={styles.statusConfirmed}>STATUS: CONFIRMED</Text>
                  </View>
                  <Text style={styles.dashedLine}>- - - - - - - - - - - - - - - - - - - - - - - - - - - -</Text>
                </>
              )}

              {/* KRA eTIMS Fiscal Validation & QR Code */}
              {embedFiscalQr && etimsQr && (
                <View style={styles.etimsBlock}>
                  <Text style={styles.etimsTitle}>KRA eTIMS FISCAL VALIDATION</Text>

                  {/* SVG Crisp Realistic QR Code */}
                  <View style={styles.qrContainer}>
                    <Svg width={64} height={64} viewBox="0 0 29 29">
                      <Rect x="1" y="1" width="7" height="7" fill="#111" />
                      <Rect x="2" y="2" width="5" height="5" fill="#FFF" />
                      <Rect x="3" y="3" width="3" height="3" fill="#111" />
                      <Rect x="21" y="1" width="7" height="7" fill="#111" />
                      <Rect x="22" y="2" width="5" height="5" fill="#FFF" />
                      <Rect x="23" y="3" width="3" height="3" fill="#111" />
                      <Rect x="1" y="21" width="7" height="7" fill="#111" />
                      <Rect x="2" y="22" width="5" height="5" fill="#FFF" />
                      <Rect x="3" y="23" width="3" height="3" fill="#111" />
                      <Rect x="10" y="2" width="2" height="1" fill="#111" />
                      <Rect x="14" y="2" width="1" height="2" fill="#111" />
                      <Rect x="10" y="10" width="2" height="2" fill="#111" />
                      <Rect x="16" y="15" width="3" height="1" fill="#111" />
                      <Rect x="10" y="23" width="2" height="2" fill="#111" />
                      <Rect x="18" y="18" width="2" height="2" fill="#111" />
                      <Rect x="12" y="17" width="2" height="1" fill="#111" />
                      <Rect x="24" y="11" width="2" height="2" fill="#111" />
                    </Svg>
                  </View>
                  <Text style={styles.etimsCode}>{signingKeyHash}</Text>
                </View>
              )}

              {/* Custom Greetings & Policy */}
              <Text style={styles.receiptQuote}>"{receiptGreeting}"</Text>
              <Text style={styles.receiptQuoteSub}>"{receiptFooter}"</Text>
              <Text style={styles.surveyText}>Rate your visit: {feedbackUrl}</Text>

              {/* Engine Footer */}
              <Text style={styles.engineFooter}>POWERED BY LANDMARK STORES POS v2.4</Text>
              <Text style={styles.pitchText}>Rendered at 203 DPI Thermal Pitch</Text>
            </View>
          </View>

          {/* Connected Peripheral Status Card (Exact Match) */}
          <View style={[styles.hardwareStatusCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
            <View style={styles.hwLeft}>
              <View style={[styles.hwIconBox, { backgroundColor: '#E3F0F8' }]}>
                <Ionicons name="print" size={20} color="#006A66" />
              </View>
              <View>
                <Text style={styles.hwTitle}>Epson TM-T88VI Default</Text>
                <Text style={styles.hwSub}>USB Port 002 • Status: Ready to Feed</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.btnCutFeed, { backgroundColor: '#F4FAFF', borderColor: '#CFDCE4' }]}
              onPress={handleCutAndFeed}
              activeOpacity={0.8}
            >
              <Text style={styles.btnCutFeedText}>Cut &amp; Feed</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
  headingPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  mainHeading: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.3,
  },
  nodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  nodeGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#32B67A',
  },
  nodeBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
  subText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
    maxWidth: 680,
  },
  actionBtnCluster: {
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
  btnGhost: {
    paddingHorizontal: 10,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnGhostText: {
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
  tabBarCard: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 6,
    marginBottom: 16,
  },
  tabScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabPillText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  activeMiniChip: {
    backgroundColor: '#32B67A',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 2,
  },
  activeMiniChipText: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
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
    gap: 16,
  },
  leftColStack: {
    width: '100%',
    gap: 16,
  },
  rightColWide: {
    flex: 1.1,
    maxWidth: 420,
    minWidth: 340,
    gap: 12,
  },
  rightColStack: {
    width: '100%',
    gap: 12,
  },
  panelCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  panelHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  panelTitleCluster: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelTitle: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  panelSub: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
    maxWidth: 500,
  },
  branchPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  branchPillText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#006A66',
  },
  badgeActiveEtims: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  etimsGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#32B67A',
  },
  badgeActiveEtimsText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#006A66',
  },
  brandMarkContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  brandMarkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  brandMarkBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#006A66',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  brandMarkTitle: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#111D23',
  },
  brandMarkSub: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: '#6D7A78',
    marginTop: 1,
  },
  formGrid: {
    gap: 12,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldRowFull: {
    width: '100%',
  },
  fieldCol: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: '#263238',
    marginBottom: 5,
  },
  inputField: {
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    backgroundColor: '#FFFFFF',
  },
  inputFieldMulti: {
    minHeight: 52,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
  },
  percentSymbol: {
    position: 'absolute',
    right: 10,
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#6D7A78',
  },
  fieldHint: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: '#6D7A78',
    marginTop: 4,
  },
  statutoryBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  statutoryTitle: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    marginBottom: 3,
  },
  statutoryBody: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    lineHeight: 16,
  },
  modeSelectCard: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#BCC9C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#006A66',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#006A66',
  },
  modeSelectTitle: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  modeSelectSub: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: '#6D7A78',
    lineHeight: 14,
    marginTop: 4,
  },
  vscuBox: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  vscuHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  vscuHeading: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#111D23',
  },
  idBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  idBadgeText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontWeight: 'bold',
    color: '#006A66',
  },
  toggleCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
  },
  toggleCardTitle: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#111D23',
  },
  toggleCardSub: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: '#6D7A78',
    marginTop: 2,
  },
  bufferRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
  },
  bufferTitle: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#111D23',
  },
  bufferPill: {
    backgroundColor: '#E8F6F5',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  bufferPillText: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: '#006A66',
  },
  bufferSub: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: '#6D7A78',
    marginTop: 2,
  },
  telemetryCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  telemetryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  telemetryHeading: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#111D23',
  },
  latencyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F6F5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  latencyPillText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#006A66',
  },
  telemetryDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  telemetryStatCol: {
    flex: 1,
    minWidth: 110,
  },
  telemetryStatLabel: {
    fontSize: 9.5,
    fontFamily: 'Inter_500Medium',
    color: '#6D7A78',
  },
  telemetryStatValue: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#111D23',
    marginTop: 2,
  },
  telemetryStatValueMonospace: {
    fontSize: 9.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontWeight: 'bold',
    color: '#006A66',
    marginTop: 4,
  },
  telemetryButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  telemetryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
  },
  telemetryBtnText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  checkboxGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },
  checkboxRow: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  checkboxBox: {
    width: 18,
    height: 18,
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
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: '#263238',
  },
  slipPreviewCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  slipCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECEF',
  },
  slipCardTitleCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  slipCardHeading: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#111D23',
  },
  slipCardTools: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paperBadgePill: {
    backgroundColor: '#E3F0F8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  paperBadgePillText: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: '#006A66',
  },
  toolIconBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#F5F7F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thermalPaperSurface: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    alignItems: 'center',
    alignSelf: 'center',
  },
  receiptLogoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#263238',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  receiptLogoText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#263238',
  },
  receiptStoreName: {
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontWeight: 'bold',
    color: '#111D23',
    letterSpacing: 0.5,
  },
  receiptBranchName: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontWeight: 'bold',
    color: '#263238',
    marginTop: 2,
  },
  receiptAddressText: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    color: '#444',
    marginTop: 2,
  },
  receiptTelText: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    color: '#444',
  },
  receiptPinText: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontWeight: 'bold',
    color: '#111D23',
    marginTop: 2,
  },
  dashedLine: {
    fontSize: 9,
    color: '#888',
    marginVertical: 4,
    letterSpacing: -0.5,
  },
  metaRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 1,
  },
  metaLabel: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    color: '#555',
  },
  metaValue: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    color: '#111',
  },
  metaValueBold: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontWeight: 'bold',
    color: '#111',
  },
  metaSub: {
    fontSize: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    color: '#666',
  },
  statusConfirmed: {
    fontSize: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontWeight: 'bold',
    color: '#32B67A',
  },
  itemHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  itemTh: {
    fontSize: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontWeight: 'bold',
    color: '#333',
  },
  itemRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginVertical: 2,
  },
  itemName: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    color: '#111',
  },
  itemPriceSub: {
    fontSize: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    color: '#666',
  },
  itemSkuSub: {
    fontSize: 7.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    color: '#006A66',
  },
  itemQty: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    textAlign: 'center',
    color: '#111',
  },
  itemTotal: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    textAlign: 'right',
    color: '#111',
  },
  ledgerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 1,
  },
  ledgerLabel: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    color: '#555',
  },
  ledgerValue: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    color: '#111',
  },
  ledgerLabelBold: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontWeight: 'bold',
    color: '#111',
  },
  ledgerValueBold: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontWeight: 'bold',
    color: '#111',
  },
  totalPayableRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  totalPayableLabel: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontWeight: 'bold',
    color: '#006A66',
  },
  totalPayableValue: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontWeight: 'bold',
    color: '#006A66',
  },
  taxAnalysisHeading: {
    fontSize: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontWeight: 'bold',
    color: '#444',
    marginTop: 2,
    marginBottom: 2,
    alignSelf: 'flex-start',
  },
  etimsBlock: {
    alignItems: 'center',
    marginVertical: 4,
    width: '100%',
  },
  etimsTitle: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontWeight: 'bold',
    color: '#111',
    letterSpacing: 0.5,
  },
  qrContainer: {
    marginVertical: 6,
    padding: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#263238',
  },
  etimsCode: {
    fontSize: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontWeight: 'bold',
    color: '#444',
  },
  receiptQuote: {
    fontSize: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    textAlign: 'center',
    color: '#555',
    marginVertical: 3,
    paddingHorizontal: 8,
  },
  receiptQuoteSub: {
    fontSize: 7.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    textAlign: 'center',
    color: '#666',
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  surveyText: {
    fontSize: 7,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    color: '#6D7A78',
    marginBottom: 4,
  },
  engineFooter: {
    fontSize: 7.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 0.5,
  },
  pitchText: {
    fontSize: 8,
    fontFamily: 'Inter_400Regular',
    color: '#8A969B',
    marginTop: 8,
  },
  hardwareStatusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  hwLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  hwIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hwTitle: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#111D23',
  },
  hwSub: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: '#6D7A78',
    marginTop: 1,
  },
  btnCutFeed: {
    paddingHorizontal: 10,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCutFeedText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#006A66',
  },
});
