import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line } from 'react-native-svg';

export const SalesChart: React.FC = () => {
  // Chart dimensions & coordinate mapping
  const width = 640;
  const height = 180;
  const paddingX = 40;
  const paddingY = 25;

  // Data points: Sat(19), Sun(20), Mon(21), Tue(22), Wed(23), Thu(24), Fri(Today)
  // Values: ~18K, ~24K, ~16K, ~28K, ~26K, ~46K, ~49K
  const points = [
    { label: 'Sat (19)', x: 40, y: 130 },
    { label: 'Sun (20)', x: 130, y: 110 },
    { label: 'Mon (21)', x: 220, y: 140 },
    { label: 'Tue (22)', x: 310, y: 95 },
    { label: 'Wed (23)', x: 400, y: 105 },
    { label: 'Thu (24)', x: 490, y: 48 },
    { label: 'Fri (Today)', x: 580, y: 32 }, // Peak point
  ];

  // Generate cubic bezier smooth curve through points
  const dPath = `M ${points[0].x} ${points[0].y}
    C 80 125, 90 110, ${points[1].x} ${points[1].y}
    C 160 110, 180 140, ${points[2].x} ${points[2].y}
    C 250 140, 270 95, ${points[3].x} ${points[3].y}
    C 340 95, 360 108, ${points[4].x} ${points[4].y}
    C 430 102, 460 52, ${points[5].x} ${points[5].y}
    C 520 45, 550 34, ${points[6].x} ${points[6].y}`;

  const dArea = `${dPath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <View style={styles.container}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#3FAFA9" stopOpacity="0.4" />
            <Stop offset="80%" stopColor="#3FAFA9" stopOpacity="0.05" />
            <Stop offset="100%" stopColor="#3FAFA9" stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

        {/* Horizontal grid lines */}
        {[30, 65, 105, 145].map((y, idx) => (
          <Line
            key={idx}
            x1="30"
            y1={y}
            x2="590"
            y2={y}
            stroke="#E8ECEF"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
        ))}

        {/* Gradient Area Fill */}
        <Path d={dArea} fill="url(#tealGrad)" />

        {/* Main Spline Curve Line */}
        <Path d={dPath} fill="none" stroke="#238F8A" strokeWidth="3" />

        {/* Peak Dot on Friday (Today) */}
        <Circle cx={points[6].x} cy={points[6].y} r="5" fill="#238F8A" />
        <Circle cx={points[6].x} cy={points[6].y} r="8" fill="none" stroke="#238F8A" strokeWidth="2" />
      </Svg>

      {/* Peak Tooltip over Friday */}
      <View style={styles.peakTooltip}>
        <Text style={styles.peakTooltipText}>KSh 48,920 (Today)</Text>
      </View>

      {/* Y-Axis Value Labels (Right side) */}
      <View style={styles.yAxisContainer}>
        <Text style={styles.axisLabel}>50K</Text>
        <Text style={styles.axisLabel}>37.5K</Text>
        <Text style={styles.axisLabel}>25K</Text>
        <Text style={styles.axisLabel}>12.5K</Text>
        <Text style={styles.axisLabel}>0</Text>
      </View>

      {/* X-Axis Days Row */}
      <View style={styles.xAxisRow}>
        {points.map((p, idx) => (
          <Text
            key={idx}
            style={[
              styles.xAxisText,
              idx === points.length - 1 && styles.xAxisTodayText,
            ]}
          >
            {p.label}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginTop: 10,
    marginBottom: 8,
  },
  peakTooltip: {
    position: 'absolute',
    top: 2,
    right: 40,
    backgroundColor: '#111D23',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  peakTooltipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    fontVariant: ['tabular-nums'],
  },
  yAxisContainer: {
    position: 'absolute',
    top: 10,
    right: 4,
    height: 150,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  axisLabel: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: '#8A969B',
  },
  xAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    marginTop: 4,
  },
  xAxisText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: '#8A969B',
  },
  xAxisTodayText: {
    color: '#263238',
    fontFamily: 'Inter_700Bold',
  },
});

