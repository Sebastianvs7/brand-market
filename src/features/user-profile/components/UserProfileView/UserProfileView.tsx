import { useMemo, type ReactElement } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { getErrorMessage } from '@/shared/api/apiError';
import { useTheme } from '@/shared/theme';
import { ActionButton } from '@/shared/ui/ActionButton';
import { AsyncFeedback } from '@/shared/ui/AsyncFeedback';
import type { UserProfileState } from '../../hooks/useUserProfile';
import { createStyles } from './UserProfileView.styles';

export type UserProfileViewProps = Readonly<{
  profileState: UserProfileState;
  onRefresh: () => void;
}>;

export const UserProfileView = ({
  profileState,
  onRefresh,
}: UserProfileViewProps): ReactElement => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      {profileState.status === 'loading' && (
        <AsyncFeedback
          loader={<ActivityIndicator accessibilityLabel="Loading user" color={theme.primary} />}
          title="Loading user"
        />
      )}

      {profileState.status === 'error' && (
        <AsyncFeedback
          message={getErrorMessage(profileState.error)}
          title="Could not load user"
          onRetry={onRefresh}
        />
      )}

      {profileState.status === 'success' && (
        <>
          <Text accessibilityRole="header" style={styles.title}>
            User details
          </Text>
          <Text selectable style={styles.detail}>
            {profileState.user.firstName} {profileState.user.lastName}
          </Text>
          <Text selectable style={styles.detail}>
            {profileState.user.email}
          </Text>
        </>
      )}

      {profileState.status !== 'error' && (
        <ActionButton
          isDisabled={profileState.status === 'loading'}
          label="Refresh user"
          onPress={onRefresh}
        />
      )}
    </View>
  );
};
