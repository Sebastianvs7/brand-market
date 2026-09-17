import { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react';
import { getUser } from '../api/getUser';
import type { User } from '../schemas/user.schema';

export type UserProfileState =
  | Readonly<{
      status: 'loading';
      userId: number;
    }>
  | Readonly<{
      requestId: number;
      status: 'success';
      user: User;
      userId: number;
    }>
  | Readonly<{
      error: unknown;
      status: 'error';
      userId: number;
    }>;

export type UseUserProfileResult = Readonly<{
  profileState: UserProfileState;
  handleRefresh: () => void;
}>;

// Tagged with its refresh, so a result from an older refresh is never shown as current.
type StoredProfileState = Exclude<UserProfileState, { status: 'loading' }> &
  Readonly<{ refreshVersion: number }>;

export const useUserProfile = (
  userId: number,
  onUserFetched?: (user: User) => void,
): UseUserProfileResult => {
  const [state, setState] = useState<StoredProfileState | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const requestSequence = useRef(0);
  const notifiedRequest = useRef(0);

  const notifyFetched = useEffectEvent((user: User) => onUserFetched?.(user));

  useEffect(() => {
    const controller = new AbortController();
    const requestId = ++requestSequence.current;
    const loadUser = async (): Promise<void> => {
      try {
        const user = await getUser(userId, controller.signal);
        if (!controller.signal.aborted) {
          setState({ refreshVersion, requestId, status: 'success', user, userId });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setState({ error, refreshVersion, status: 'error', userId });
        }
      }
    };
    void loadUser();

    return () => controller.abort();
  }, [userId, refreshVersion]);

  // Notify from an effect so a consumer callback failure is not mistaken for
  // an HTTP failure, and callback identity changes do not refetch the user.
  useEffect(() => {
    if (
      state?.status === 'success' &&
      state.userId === userId &&
      state.refreshVersion === refreshVersion &&
      state.requestId === requestSequence.current &&
      state.requestId !== notifiedRequest.current
    ) {
      notifiedRequest.current = state.requestId;
      notifyFetched(state.user);
    }
  }, [state, userId, refreshVersion]);

  const handleRefresh = useCallback((): void => {
    setRefreshVersion((version) => version + 1);
  }, []);

  const profileState: UserProfileState =
    state?.userId === userId && state.refreshVersion === refreshVersion
      ? state
      : { status: 'loading', userId };

  return { handleRefresh, profileState };
};
