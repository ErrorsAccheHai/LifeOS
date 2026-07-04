import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { api } from '@/services/api';
import { ENDPOINTS } from '@/constants/api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: false, shouldSetBadge: false }),
});

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  try {
    if (!Device.isDevice) return null;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return null;

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;

    // Send token to backend so server can push messages in future
    try { await api.post(ENDPOINTS.USERS.FCM_TOKEN, { token }); } catch (e) { /* ignore */ }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  } catch (e) {
    return null;
  }
}

export async function scheduleLocalNotificationForActivity(activity: any, dateStr: string) {
  try {
    if (!activity?.scheduledTime) return null;
    const [h, m] = activity.scheduledTime.split(':').map(Number);
    const target = new Date(dateStr + 'T00:00:00');
    target.setHours(h, m, 0, 0);

    if (target <= new Date()) return null; // skip past

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Upcoming: ${activity.name}`,
        body: activity.description || 'Time for your activity',
        data: { activityId: activity._id },
      },
      trigger: target,
    });

    return identifier;
  } catch (e) {
    return null;
  }
}

export async function cancelAllLocalNotifications() {
  try { await Notifications.cancelAllScheduledNotificationsAsync(); } catch {}
}

export default Notifications;
