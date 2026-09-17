import { ApiError } from '@/shared/api/apiError';
import { requestJson } from '@/shared/api/requestJson';
import { userSchema, type User } from '../schemas/user.schema';

export const getUser = async (userId: number, signal: AbortSignal): Promise<User> => {
  if (!Number.isSafeInteger(userId) || userId <= 0) throw new ApiError('invalid-input');
  const payload = await requestJson('https://dummyjson.com/users/' + userId, { signal });
  const result = userSchema.safeParse(payload);
  if (!result.success || result.data.id !== userId) throw new ApiError('invalid-response');

  return result.data;
};
