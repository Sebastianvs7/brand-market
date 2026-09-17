import { fireEvent, render, screen } from '@testing-library/react-native';
import { fetch } from 'expo/fetch';
import { jsonResponse } from '@/testing/http';
import UserProfile from './refactored';

const mockFetch = jest.mocked(fetch);
beforeEach(() => mockFetch.mockReset());

it('works independently of app providers and preserves refresh callback behavior', async () => {
  const user = { id: 1, firstName: 'Alice', lastName: 'Example', email: 'alice@example.com' };
  mockFetch.mockResolvedValue(jsonResponse(user));
  const onUserFetched = jest.fn();
  await render(<UserProfile userId={1} onUserFetched={onUserFetched} />);
  expect(await screen.findByText('Alice Example')).toBeOnTheScreen();
  expect(screen.getByText('alice@example.com')).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: 'Refresh user' }));
  await screen.findByText('Alice Example');
  expect(onUserFetched).toHaveBeenCalledTimes(2);
});

it('renders invalid ID as a recoverable error without a network request', async () => {
  await render(<UserProfile userId={0} />);
  expect(await screen.findByText('Please provide a valid user ID.')).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Retry' })).toBeOnTheScreen();
  expect(mockFetch).not.toHaveBeenCalled();
});
