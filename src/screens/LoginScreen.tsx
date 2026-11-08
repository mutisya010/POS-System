import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePOS } from '../context/POSContext';
import { triggerFeedback } from '../utils/sound';

interface ScheduledStaff {
  id: string;
  name: string;
  role: string;
  staffNum: string;
  empId: string;
  lane: string;
  initials: string;
  avatarBg: string;
  pin: string;
}

const SCHEDULED_STAFF_MEMBERS: ScheduledStaff[] = [
  {
    id: 'emp-101',
    name: 'John Doe',
    role: 'Store Manager',
    staffNum: '#402',
    empId: 'EMP-101',
    lane: 'Register #01 (Primary)',
    initials: 'JD',
    avatarBg: '#111D23',
    pin: '4020',
  },
  {
    id: 'emp-104',
    name: 'Mercy Chebet',
    role: 'Cashier Lead',
    staffNum: '#104',
    empId: 'EMP-104',
    lane: 'Lane #02',
    initials: 'MC',
    avatarBg: '#006A66',
    pin: '1040',
  },
  {
    id: 'emp-108',
    name: 'Kelvin Mwangi',
    role: 'Lane Cashier',
    staffNum: '#108',
    empId: 'EMP-108',
    lane: 'Lane #03',
    initials: 'KM',
    avatarBg: '#B45309',
    pin: '1080',
  },
  {
    id: 'emp-112',
    name: 'Faith Achieng',
    role: 'Inventory Mgr',
    staffNum: '#112',
    empId: 'EMP-112',
    lane: 'Warehouse',
    initials: 'FA',
    avatarBg: '#4338CA',
    pin: '1120',
  },
];

interface LoginScreenProps {
  onUnlock: (operator: ScheduledStaff) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onUnlock }) => {
  const { theme } = usePOS();
  const { width } = useWindowDimensions();
  const isWide = width >= 1050;

  // Selected operator
  const [selectedStaff, setSelectedStaff] = useState<ScheduledStaff>(
    SCHEDULED_STAFF_MEMBERS[0]
  );

  // Authentication mode
  const [authMode, setAuthMode] = useState<'pin' | 'password'>('pin');

  // Entered 4-digit PIN
  const [enteredPin, setEnteredPin] = useState<string>('40'); // Pre-fill 2 digits matching reference photo or blank
  const [hasError, setHasError] = useState(false);

  // Live EAT Clock
  const [currentTime, setCurrentTime] = useState('07:57:37 EAT');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds} EAT`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleKeyPress = (num: string) => {
    if (enteredPin.length < 4) {
      triggerFeedback.tap();
      const nextPin = enteredPin + num;
      setEnteredPin(nextPin);
      setHasError(false);

      if (nextPin.length === 4) {
        validateAndLogin(nextPin);
      }
    }
  };

  const handleClear = () => {
    triggerFeedback.tap();
    setEnteredPin('');
    setHasError(false);
  };

  const handleBackspace = () => {
    if (enteredPin.length > 0) {
      triggerFeedback.tap();
      setEnteredPin(enteredPin.slice(0, -1));
      setHasError(false);
    }
  };

  const validateAndLogin = (pinToTest: string) => {
    // Validates against selected operator PIN or master '4020' or any 4 digits
    if (pinToTest === selectedStaff.pin || pinToTest === '4020' || pinToTest.length === 4) {
      triggerFeedback.success();
      onUnlock(selectedStaff);
    } else {
      triggerFeedback.error();
      setHasError(true);
      Alert.alert('Invalid PIN', `Please enter valid 4-digit PIN for ${selectedStaff.name} (Default: ${selectedStaff.pin})`);
    }
  };

  const handleQuickUnlock = () => {
    triggerFeedback.success();
    onUnlock(selectedStaff);
  };

  const handleScanNfc = () => {
    triggerFeedback.tap();
    Alert.alert(
      'RFID / NFC Scanner Armed',
      'Please tap your employee badge on the terminal contact plate.'
    );
    setTimeout(() => {
      triggerFeedback.success();
      onUnlock(selectedStaff);
    }, 1200);
  };

  const handleScanQr = () => {
    triggerFeedback.tap();
    Alert.alert(
      'Badge QR Scanner Active',
      'Hold employee QR badge 10cm from camera or barcode wedge.'
    );
    setTimeout(() => {
      triggerFeedback.success();
      onUnlock(selectedStaff);
    }, 1200);
  };

  return (
    <View style={[styles.root, { backgroundColor: '#F4FAFF' }]}>
      {/* 1. Global Header Bar */}
      <View style={[styles.topBar, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
        <View style={styles.topBarLeft}>
          <View style={[styles.brandLogoCircle, { backgroundColor: '#006A66' }]}>
            <Text style={styles.brandLogoText}>LM</Text>
          </View>
          <View>
            <View style={styles.brandTitleRow}>
              <Text style={styles.brandTitleBold}>LANDMARK STORES</Text>
              <View style={[styles.badgePosSuite, { backgroundColor: '#E8F6F5' }]}>
                <Text style={styles.badgePosSuiteText}>POS SUITE</Text>
              </View>
            </View>
            <Text style={styles.brandSub}>Retail & Inventory Management • v2.4-PROD</Text>
          </View>
        </View>

        <View style={styles.topBarRight}>
          <View style={[styles.statusPill, { backgroundColor: '#E8F6F5' }]}>
            <View style={styles.greenLiveDot} />
            <Text style={[styles.statusPillText, { color: '#006A66' }]}>
              KRA eTIMS Node Connected
            </Text>
          </View>

          <View style={[styles.statusPill, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' }]}>
            <Ionicons name="storefront-outline" size={13} color="#263238" />
            <Text style={styles.statusPillTextDark}>Nairobi Flagship | NBO-FLG-001</Text>
          </View>

          <View style={[styles.statusPill, { backgroundColor: '#F4FAFF', borderColor: '#E8ECEF' }]}>
            <Ionicons name="time-outline" size={13} color="#263238" />
            <Text style={styles.statusPillTextDark}>{currentTime}</Text>
          </View>
        </View>
      </View>

      {/* 2. Main Center Body */}
      <ScrollView
        style={styles.mainScrollView}
        contentContainerStyle={styles.mainScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.centerLayout, isWide ? styles.centerLayoutWide : styles.centerLayoutStack]}>
          {/* Left Column: Operator Profiles & Target Assignment */}
          <View style={isWide ? styles.leftColWide : styles.leftColStack}>
            {/* Access Badge & Title */}
            <View style={[styles.secureAccessPill, { backgroundColor: '#E8F6F5' }]}>
              <Ionicons name="shield-checkmark-outline" size={13} color="#006A66" />
              <Text style={styles.secureAccessText}>SECURE OPERATOR ACCESS</Text>
            </View>

            <Text style={styles.mainHeadline}>POS Terminal Sign In</Text>
            <Text style={styles.headlineDescription}>
              Select your on-duty profile or enter your 4-digit POS PIN to open register lanes,
              process sales, and access daily till logs.
            </Text>

            {/* Scheduled Staff Container */}
            <View style={[styles.staffCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
              <View style={styles.staffCardHeader}>
                <View style={styles.dotLabelRow}>
                  <View style={styles.greenLiveDot} />
                  <Text style={styles.staffCardHeading}>SCHEDULED ON-DUTY STAFF</Text>
                </View>
                <Text style={styles.shiftLabel}>Shift A (Morning)</Text>
              </View>

              {/* 2x2 Operator Grid */}
              <View style={styles.operatorsGrid}>
                {SCHEDULED_STAFF_MEMBERS.map((staff) => {
                  const isSelected = selectedStaff.id === staff.id;
                  return (
                    <TouchableOpacity
                      key={staff.id}
                      style={[
                        styles.operatorTile,
                        isSelected
                          ? {
                              borderColor: '#3FAFA9',
                              borderWidth: 2,
                              backgroundColor: '#E8F6F5',
                            }
                          : {
                              borderColor: '#E8ECEF',
                              borderWidth: 1,
                              backgroundColor: '#FFFFFF',
                            },
                      ]}
                      onPress={() => {
                        triggerFeedback.tap();
                        setSelectedStaff(staff);
                        setEnteredPin('');
                        setHasError(false);
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.operatorTileLeft}>
                        <View
                          style={[
                            styles.operatorAvatar,
                            { backgroundColor: staff.avatarBg },
                          ]}
                        >
                          <Text style={styles.operatorAvatarText}>{staff.initials}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.operatorName}>{staff.name}</Text>
                          <Text style={styles.operatorRole}>
                            {staff.role} • {staff.staffNum}
                          </Text>
                        </View>
                      </View>

                      {isSelected ? (
                        <View style={styles.checkedCircle}>
                          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        </View>
                      ) : (
                        <Text style={styles.laneTag}>{staff.lane.replace(' (Primary)', '')}</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Browse All Staff Footer */}
              <View style={styles.staffCardFooter}>
                <Text style={styles.notListedText}>Not listed on morning shift?</Text>
                <TouchableOpacity
                  onPress={() => {
                    triggerFeedback.tap();
                    Alert.alert('Store Personnel Directory', '28 active staff records found across Nairobi Flagship.');
                  }}
                >
                  <Text style={styles.browseAllLink}>Browse All 28 Staff &gt;</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Target Terminal Assignment Dark Card */}
            <View style={styles.terminalDarkCard}>
              <View style={styles.terminalDarkHeader}>
                <View style={styles.terminalDarkTitleCluster}>
                  <Ionicons name="desktop-outline" size={15} color="#8A969B" />
                  <Text style={styles.terminalDarkHeading}>TARGET TERMINAL ASSIGNMENT</Text>
                </View>
                <View style={styles.laneBadge}>
                  <Text style={styles.laneBadgeText}>LANE #01 PRIMARY</Text>
                </View>
              </View>

              <View style={styles.terminalTriRow}>
                {/* 1. Cash Drawer */}
                <View style={styles.terminalSubBox}>
                  <Text style={styles.terminalSubLabel}>Cash Drawer</Text>
                  <Text style={styles.terminalSubValueGreen}>Ready (KSh 15,000)</Text>
                </View>

                {/* 2. Thermal Printer */}
                <View style={styles.terminalSubBox}>
                  <Text style={styles.terminalSubLabel}>Thermal Printer</Text>
                  <Text style={styles.terminalSubValueWhite}>Epson TM-T88VI</Text>
                </View>

                {/* 3. Barcode Gun */}
                <View style={styles.terminalSubBox}>
                  <Text style={styles.terminalSubLabel}>Barcode Gun</Text>
                  <Text style={styles.terminalSubValueGreen}>Opticon USB</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Right Column: Authorize Session & Numeric Keypad */}
          <View style={isWide ? styles.rightColWide : styles.rightColStack}>
            <View style={[styles.authCard, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
              {/* Card Header & Toggle */}
              <View style={styles.authCardHeader}>
                <View>
                  <Text style={styles.authHeading}>Authorize Session</Text>
                  <Text style={styles.authSubText}>
                    Signing in as <Text style={{ fontFamily: 'Inter_700Bold', color: '#111D23' }}>{selectedStaff.name}</Text> ({selectedStaff.empId})
                  </Text>
                </View>

                <View style={styles.modeSegment}>
                  <TouchableOpacity
                    style={[
                      styles.modeSegmentBtn,
                      authMode === 'pin' && styles.modeSegmentBtnActive,
                    ]}
                    onPress={() => {
                      triggerFeedback.tap();
                      setAuthMode('pin');
                    }}
                  >
                    <Text
                      style={[
                        styles.modeSegmentText,
                        authMode === 'pin' && styles.modeSegmentTextActive,
                      ]}
                    >
                      Fast PIN
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modeSegmentBtn,
                      authMode === 'password' && styles.modeSegmentBtnActive,
                    ]}
                    onPress={() => {
                      triggerFeedback.tap();
                      setAuthMode('password');
                    }}
                  >
                    <Text
                      style={[
                        styles.modeSegmentText,
                        authMode === 'password' && styles.modeSegmentTextActive,
                      ]}
                    >
                      Password
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* PIN Indicator Section */}
              <View style={styles.pinIndicatorSection}>
                <Text style={styles.enterPinLabel}>ENTER 4-DIGIT TERMINAL PIN</Text>
                <View style={styles.dotsRow}>
                  {[0, 1, 2, 3].map((idx) => {
                    const isFilled = idx < enteredPin.length;
                    return (
                      <View
                        key={idx}
                        style={[
                          styles.pinDot,
                          isFilled
                            ? { backgroundColor: hasError ? '#BA1A1A' : '#3FAFA9' }
                            : { backgroundColor: '#CFDCE4' },
                        ]}
                      />
                    );
                  })}
                </View>
                <Text style={styles.pinHintText}>
                  Default test supervisor PIN: • • {selectedStaff.pin.slice(2)}
                </Text>
              </View>

              {/* Numeric Keypad Grid */}
              <View style={styles.keypadGrid}>
                {/* Row 1 */}
                <View style={styles.keypadRow}>
                  <TouchableOpacity
                    style={styles.keypadBtn}
                    onPress={() => handleKeyPress('1')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.keypadDigit}>1</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.keypadBtn}
                    onPress={() => handleKeyPress('2')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.keypadDigit}>2</Text>
                    <Text style={styles.keypadAlpha}>ABC</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.keypadBtn}
                    onPress={() => handleKeyPress('3')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.keypadDigit}>3</Text>
                    <Text style={styles.keypadAlpha}>DEF</Text>
                  </TouchableOpacity>
                </View>

                {/* Row 2 */}
                <View style={styles.keypadRow}>
                  <TouchableOpacity
                    style={styles.keypadBtn}
                    onPress={() => handleKeyPress('4')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.keypadDigit}>4</Text>
                    <Text style={styles.keypadAlpha}>GHI</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.keypadBtn}
                    onPress={() => handleKeyPress('5')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.keypadDigit}>5</Text>
                    <Text style={styles.keypadAlpha}>JKL</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.keypadBtn}
                    onPress={() => handleKeyPress('6')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.keypadDigit}>6</Text>
                    <Text style={styles.keypadAlpha}>MNO</Text>
                  </TouchableOpacity>
                </View>

                {/* Row 3 */}
                <View style={styles.keypadRow}>
                  <TouchableOpacity
                    style={styles.keypadBtn}
                    onPress={() => handleKeyPress('7')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.keypadDigit}>7</Text>
                    <Text style={styles.keypadAlpha}>PQRS</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.keypadBtn}
                    onPress={() => handleKeyPress('8')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.keypadDigit}>8</Text>
                    <Text style={styles.keypadAlpha}>TUV</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.keypadBtn}
                    onPress={() => handleKeyPress('9')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.keypadDigit}>9</Text>
                    <Text style={styles.keypadAlpha}>WXYZ</Text>
                  </TouchableOpacity>
                </View>

                {/* Row 4 */}
                <View style={styles.keypadRow}>
                  <TouchableOpacity
                    style={[styles.keypadBtn, styles.keypadBtnClear]}
                    onPress={handleClear}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.keypadClearText}>CLEAR</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.keypadBtn}
                    onPress={() => handleKeyPress('0')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.keypadDigit}>0</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.keypadBtn}
                    onPress={handleBackspace}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="backspace-outline" size={20} color="#263238" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* NFC & QR Badge Quick Scanners */}
              <View style={styles.badgeScanRow}>
                <TouchableOpacity
                  style={[styles.btnScanBadge, { borderColor: '#E8ECEF' }]}
                  onPress={handleScanNfc}
                  activeOpacity={0.8}
                >
                  <Ionicons name="radio-outline" size={14} color="#263238" />
                  <Text style={styles.btnScanBadgeText}>Scan NFC / Staff RFID</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btnScanBadge, { borderColor: '#E8ECEF' }]}
                  onPress={handleScanQr}
                  activeOpacity={0.8}
                >
                  <Ionicons name="qr-code-outline" size={14} color="#263238" />
                  <Text style={styles.btnScanBadgeText}>Scan Badge QR</Text>
                </TouchableOpacity>
              </View>

              {/* Primary Unlock Register Button */}
              <TouchableOpacity
                style={[styles.btnUnlockRegister, { backgroundColor: '#006A66' }]}
                onPress={handleQuickUnlock}
                activeOpacity={0.85}
              >
                <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
                <Text style={styles.btnUnlockRegisterText}>
                  Unlock Lane #01 & Open Register
                </Text>
              </TouchableOpacity>

              {/* Vault & Assistance Links */}
              <View style={styles.vaultRow}>
                <TouchableOpacity
                  onPress={() => {
                    triggerFeedback.tap();
                    Alert.alert(
                      'Forgot PIN Assistance',
                      `An authorization code has been dispatched to ${selectedStaff.name}'s verified mobile phone.`
                    );
                  }}
                >
                  <Text style={styles.forgotPinText}>Forgot Staff PIN?</Text>
                </TouchableOpacity>

                <View style={styles.encryptedVaultBadge}>
                  <Ionicons name="shield-checkmark-outline" size={13} color="#006A66" />
                  <Text style={styles.encryptedVaultText}>Encrypted Local Vault</Text>
                </View>
              </View>

              {/* Shift status bottom divider */}
              <View style={styles.shiftBottomLine}>
                <View style={styles.shiftStartingCluster}>
                  <Ionicons name="calendar-outline" size={13} color="#6D7A78" />
                  <Text style={styles.shiftStartingText}>Shift Starting: 08:00 AM</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    triggerFeedback.tap();
                    handleClear();
                  }}
                >
                  <Text style={styles.lockTerminalText}>Lock Terminal</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 3. Global Fixed Footer */}
      <View style={[styles.bottomFooterBar, { backgroundColor: '#FFFFFF', borderColor: '#E8ECEF' }]}>
        <Text style={styles.footerLegalText}>
          Landmark Retail Solutions East Africa Ltd • PIN: P051284920K • Argwings Kodhek Rd, Kilimani, Nairobi
        </Text>

        <View style={styles.footerRightCluster}>
          <View style={styles.footerBufferRow}>
            <Ionicons name="checkmark-circle" size={14} color="#32B67A" />
            <Text style={styles.footerBufferText}>Offline Buffer (24h Sync Ready)</Text>
          </View>
          <Text style={styles.footerSupportText}>Support Desk: +254 722 123 456</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexWrap: 'wrap',
    gap: 12,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandLogoCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLogoText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitleBold: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#111D23',
    letterSpacing: 0.5,
  },
  badgePosSuite: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgePosSuiteText: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: '#006A66',
  },
  brandSub: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: '#6D7A78',
    marginTop: 1,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  greenLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#32B67A',
  },
  statusPillText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  statusPillTextDark: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: '#263238',
  },
  mainScrollView: {
    flex: 1,
  },
  mainScrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  centerLayout: {
    width: '100%',
    maxWidth: 1120,
    gap: 32,
  },
  centerLayoutWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  centerLayoutStack: {
    flexDirection: 'column',
  },
  leftColWide: {
    flex: 1.3,
    paddingRight: 10,
  },
  leftColStack: {
    width: '100%',
  },
  rightColWide: {
    flex: 1,
    maxWidth: 440,
    minWidth: 360,
  },
  rightColStack: {
    width: '100%',
  },
  secureAccessPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  secureAccessText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#006A66',
    letterSpacing: 0.5,
  },
  mainHeadline: {
    fontSize: 30,
    fontFamily: 'Inter_700Bold',
    color: '#111D23',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  headlineDescription: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#6D7A78',
    lineHeight: 20,
    marginBottom: 20,
    maxWidth: 540,
  },
  staffCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  staffCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  dotLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  staffCardHeading: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#111D23',
    letterSpacing: 0.5,
  },
  shiftLabel: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: '#6D7A78',
  },
  operatorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  operatorTile: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
  },
  operatorTileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  operatorAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  operatorAvatarText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  operatorName: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#111D23',
  },
  operatorRole: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: '#6D7A78',
    marginTop: 1,
  },
  checkedCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#3FAFA9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  laneTag: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    color: '#8A969B',
  },
  staffCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8ECEF',
  },
  notListedText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#6D7A78',
  },
  browseAllLink: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#006A66',
  },
  terminalDarkCard: {
    backgroundColor: '#111D23',
    borderRadius: 12,
    padding: 16,
  },
  terminalDarkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  terminalDarkTitleCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  terminalDarkHeading: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#8A969B',
    letterSpacing: 0.5,
  },
  laneBadge: {
    backgroundColor: '#003D3B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  laneBadgeText: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: '#6DD7D1',
  },
  terminalTriRow: {
    flexDirection: 'row',
    gap: 8,
  },
  terminalSubBox: {
    flex: 1,
    backgroundColor: '#18262D',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#26363E',
  },
  terminalSubLabel: {
    fontSize: 9,
    fontFamily: 'Inter_500Medium',
    color: '#8A969B',
    marginBottom: 3,
  },
  terminalSubValueGreen: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#32B67A',
  },
  terminalSubValueWhite: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  authCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#111D23',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  authCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  authHeading: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    color: '#111D23',
  },
  authSubText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#6D7A78',
    marginTop: 2,
  },
  modeSegment: {
    flexDirection: 'row',
    backgroundColor: '#F4FAFF',
    borderRadius: 6,
    padding: 2,
    borderWidth: 1,
    borderColor: '#E8ECEF',
  },
  modeSegmentBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  modeSegmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  modeSegmentText: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    color: '#8A969B',
  },
  modeSegmentTextActive: {
    color: '#111D23',
    fontFamily: 'Inter_700Bold',
  },
  pinIndicatorSection: {
    alignItems: 'center',
    marginVertical: 10,
  },
  enterPinLabel: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#6D7A78',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  pinHintText: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: '#8A969B',
  },
  keypadGrid: {
    gap: 8,
    marginVertical: 12,
  },
  keypadRow: {
    flexDirection: 'row',
    gap: 8,
  },
  keypadBtn: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8ECEF',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadDigit: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    color: '#111D23',
  },
  keypadAlpha: {
    fontSize: 8,
    fontFamily: 'Inter_700Bold',
    color: '#8A969B',
    marginTop: -2,
    letterSpacing: 0.5,
  },
  keypadBtnClear: {
    backgroundColor: '#FFDAD6',
    borderColor: '#FFDAD6',
  },
  keypadClearText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#BA1A1A',
  },
  badgeScanRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  btnScanBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 34,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: '#F5F7F8',
  },
  btnScanBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: '#263238',
  },
  btnUnlockRegister: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderRadius: 8,
    marginBottom: 12,
  },
  btnUnlockRegisterText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  vaultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  forgotPinText: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    color: '#6D7A78',
  },
  encryptedVaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  encryptedVaultText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: '#006A66',
  },
  shiftBottomLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E8ECEF',
    paddingTop: 10,
  },
  shiftStartingCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shiftStartingText: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    color: '#6D7A78',
  },
  lockTerminalText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#BA1A1A',
  },
  bottomFooterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    flexWrap: 'wrap',
    gap: 10,
  },
  footerLegalText: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: '#6D7A78',
  },
  footerRightCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  footerBufferRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  footerBufferText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: '#006A66',
  },
  footerSupportText: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    color: '#6D7A78',
  },
});

