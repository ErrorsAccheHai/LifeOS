import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';
import type { TimelineItem, ActivityStatus } from '@/types';

const STATUS_CONFIG: Record<ActivityStatus, { color: string; icon: string; label: string }> = {
  pending:     { color: '#A0A0C0', icon: 'ellipse-outline',       label: 'Pending' },
  in_progress: { color: '#F59E0B', icon: 'play-circle',           label: 'In Progress' },
  completed:   { color: '#10B981', icon: 'checkmark-circle',      label: 'Done' },
  skipped:     { color: '#8B5CF6', icon: 'arrow-forward-circle',  label: 'Skipped' },
  late:        { color: '#F97316', icon: 'warning',               label: 'Late' },
  missed:      { color: '#EF4444', icon: 'close-circle',          label: 'Missed' },
};

interface Props {
  item: TimelineItem;
  onPress?: (item: TimelineItem) => void;
  onComplete?: (item: TimelineItem) => void;
  showTime?: boolean;
}

const ActivityTimelineCard: React.FC<Props> = ({
  item, onPress, onComplete, showTime = true,
}) => {
  const { colors } = useTheme();
  const { activity, status } = item;
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const isPending = status === 'pending' || status === 'in_progress';

  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.98, duration: 70, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1,    duration: 70, useNativeDriver: true }),
    ]).start();
    onPress?.(item);
  };

  const handleComplete = (e: any) => {
    e.stopPropagation?.();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete?.(item);
  };

  const borderColor = status === 'completed'
    ? 'rgba(16,185,129,0.25)'
    : status === 'missed'
    ? 'rgba(239,68,68,0.2)'
    : status === 'late'
    ? 'rgba(249,115,22,0.2)'
    : colors.glassBorder;

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
      <Animated.View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 10,
          transform: [{ scale }],
        }}
      >
        {/* Time */}
        {showTime && (
          <View style={{ width: 48, alignItems: 'center', marginRight: 10 }}>
            <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '500' }}>
              {activity.scheduledTime || '--:--'}
            </Text>
          </View>
        )}

        {/* Dot */}
        <View style={{ alignItems: 'center', width: 20, marginRight: 10 }}>
          <View style={{
            width: 10, height: 10, borderRadius: 5,
            backgroundColor: cfg.color,
            borderWidth: status === 'pending' ? 2 : 0,
            borderColor: colors.textMuted,
          }} />
        </View>

        {/* Card */}
        <View style={{
          flex: 1, flexDirection: 'row', alignItems: 'center',
          backgroundColor: colors.surface,
          borderRadius: 16, padding: 12,
          borderWidth: 1, borderColor,
        }}>
          {/* Icon */}
          <View style={{
            width: 42, height: 42, borderRadius: 12,
            backgroundColor: `${activity.color}22`,
            alignItems: 'center', justifyContent: 'center', marginRight: 12,
          }}>
            <Text style={{ fontSize: 20 }}>{activity.icon}</Text>
          </View>

          {/* Info */}
          <View style={{ flex: 1 }}>
            <Text style={{
              color: status === 'missed' ? colors.textMuted : colors.textPrimary,
              fontSize: 14, fontWeight: '600',
              textDecorationLine: status === 'missed' ? 'line-through' : 'none',
            }}>
              {activity.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 }}>
              <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                {activity.estimatedDuration}min
              </Text>
              <Text style={{ color: '#F59E0B', fontSize: 11 }}>
                ⚡{activity.xpReward} XP
              </Text>
              {status === 'late' && (
                <Text style={{ color: '#F97316', fontSize: 11, fontWeight: '600' }}>
                  Late
                </Text>
              )}
            </View>
          </View>

          {/* Action / Status badge */}
          {isPending ? (
            <TouchableOpacity
              onPress={handleComplete}
              style={{
                backgroundColor: `${activity.color}20`,
                borderRadius: 10,
                paddingHorizontal: 12, paddingVertical: 6,
                borderWidth: 1, borderColor: `${activity.color}40`,
              }}
            >
              <Text style={{ color: activity.color, fontSize: 12, fontWeight: '600' }}>
                Mark Done
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={{
              backgroundColor: `${cfg.color}18`,
              borderRadius: 10, padding: 6,
            }}>
              <Ionicons name={cfg.icon as any} size={18} color={cfg.color} />
            </View>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default ActivityTimelineCard;
