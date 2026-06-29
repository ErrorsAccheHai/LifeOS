import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, BORDER_RADIUS, FONT_SIZE } from '@/constants/theme';
import type { TimelineItem, ActivityStatus } from '@/types';

const STATUS_CONFIG: Record<ActivityStatus, { color: string; bg: string; icon: string; label: string }> = {
  pending: { color: COLORS.textMuted, bg: 'rgba(255,255,255,0.05)', icon: 'ellipse-outline', label: 'Pending' },
  in_progress: { color: COLORS.accentAmber, bg: 'rgba(245,158,11,0.15)', icon: 'play-circle', label: 'In Progress' },
  completed: { color: COLORS.accentEmerald, bg: 'rgba(16,185,129,0.15)', icon: 'checkmark-circle', label: 'Done' },
  skipped: { color: COLORS.textMuted, bg: 'rgba(255,255,255,0.05)', icon: 'arrow-forward-circle', label: 'Skipped' },
  late: { color: COLORS.accentOrange, bg: 'rgba(249,115,22,0.15)', icon: 'warning', label: 'Late' },
  missed: { color: COLORS.error, bg: 'rgba(239,68,68,0.15)', icon: 'close-circle', label: 'Missed' },
};

interface ActivityTimelineCardProps {
  item: TimelineItem;
  onPress?: (item: TimelineItem) => void;
  onComplete?: (item: TimelineItem) => void;
  showTime?: boolean;
}

const ActivityTimelineCard: React.FC<ActivityTimelineCardProps> = ({
  item,
  onPress,
  onComplete,
  showTime = true,
}) => {
  const { activity, log, status } = item;
  const statusConfig = STATUS_CONFIG[status];
  const isPending = status === 'pending';

  return (
    <TouchableOpacity
      onPress={() => onPress?.(item)}
      activeOpacity={0.8}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4,
      }}
    >
      {/* Time column */}
      {showTime && (
        <View style={{ width: 52, alignItems: 'center', marginRight: 12 }}>
          <Text style={{ color: COLORS.textMuted, fontSize: 11, fontWeight: '500' }}>
            {activity.scheduledTime || '--:--'}
          </Text>
        </View>
      )}

      {/* Timeline dot + line */}
      <View style={{ alignItems: 'center', width: 24, marginRight: 12 }}>
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: statusConfig.color,
            borderWidth: status === 'pending' ? 2 : 0,
            borderColor: COLORS.textMuted,
          }}
        />
      </View>

      {/* Activity card */}
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: COLORS.surface,
          borderRadius: BORDER_RADIUS.lg,
          padding: 12,
          borderWidth: 1,
          borderColor: status === 'completed'
            ? 'rgba(16,185,129,0.2)'
            : status === 'missed'
            ? 'rgba(239,68,68,0.15)'
            : 'rgba(255,255,255,0.05)',
        }}
      >
        {/* Activity icon */}
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: `${activity.color}25`,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Text style={{ fontSize: 20 }}>{activity.icon}</Text>
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: status === 'missed' ? COLORS.textMuted : COLORS.textPrimary,
              fontSize: FONT_SIZE.base,
              fontWeight: '600',
              textDecorationLine: status === 'missed' ? 'line-through' : 'none',
            }}
          >
            {activity.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 }}>
            <Text style={{ color: COLORS.textMuted, fontSize: FONT_SIZE.xs }}>
              {activity.estimatedDuration}min
            </Text>
            <Text style={{ color: COLORS.accentAmber, fontSize: FONT_SIZE.xs }}>
              +{activity.xpReward} XP
            </Text>
          </View>
        </View>

        {/* Status / Action */}
        {isPending ? (
          <TouchableOpacity
            onPress={() => onComplete?.(item)}
            style={{
              backgroundColor: `${activity.color}20`,
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderWidth: 1,
              borderColor: `${activity.color}40`,
            }}
          >
            <Text style={{ color: activity.color, fontSize: FONT_SIZE.xs, fontWeight: '600' }}>
              Mark Done
            </Text>
          </TouchableOpacity>
        ) : (
          <View
            style={{
              backgroundColor: statusConfig.bg,
              borderRadius: 10,
              paddingHorizontal: 10,
              paddingVertical: 6,
            }}
          >
            <Ionicons name={statusConfig.icon as any} size={18} color={statusConfig.color} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ActivityTimelineCard;
