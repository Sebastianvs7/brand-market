import { type ReactElement } from 'react';
import { useUserProfile, UserProfileView, type User } from '@/features/user-profile';

export type UserProfileProps = Readonly<{ userId: number; onUserFetched?: (user: User) => void }>;

const UserProfile = ({ userId, onUserFetched }: UserProfileProps): ReactElement => {
  const { profileState, handleRefresh } = useUserProfile(userId, onUserFetched);

  return <UserProfileView profileState={profileState} onRefresh={handleRefresh} />;
};

export default UserProfile;
