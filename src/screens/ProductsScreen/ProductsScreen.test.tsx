import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { fetch } from 'expo/fetch';
import type { Product } from '@/features/products';
import { deferred } from '@/testing/deferred';
import { jsonResponse } from '@/testing/http';
import { renderWithProviders } from '@/testing/renderWithProviders';
import { ProductsScreen } from './ProductsScreen';

const makeProducts = (count: number): Product[] =>
  Array.from({ length: count }, (_, index) => ({
    category: 'essentials',
    id: index + 1,
    image: 'https://fakestoreapi.com/img/test.png',
    price: 10 + index,
    title: 'Product ' + (index + 1),
  }));

const mockFetch = jest.mocked(fetch);
beforeEach(() => mockFetch.mockReset());

it('shows initial loading then product title, image and formatted price', async () => {
  const pending = deferred<Awaited<ReturnType<typeof fetch>>>();
  mockFetch.mockReturnValue(pending.promise);
  await renderWithProviders(<ProductsScreen />);
  expect(screen.getByText('Finding good things')).toBeOnTheScreen();
  expect(screen.queryByText('THE COLLECTION')).not.toBeOnTheScreen();
  await act(async () => {
    pending.resolve(jsonResponse(makeProducts(2)));
  });
  expect(await screen.findByText('Product 1')).toBeOnTheScreen();
  expect(screen.getByText('$10.00')).toBeOnTheScreen();
  expect(screen.getByLabelText('Product 1')).toBeOnTheScreen();
  expect(screen.getByText('You have seen the whole collection')).toBeOnTheScreen();
});

it('offers retry after a failure and recovers', async () => {
  mockFetch
    .mockRejectedValueOnce(new TypeError('offline'))
    .mockResolvedValueOnce(jsonResponse(makeProducts(2)));
  await renderWithProviders(<ProductsScreen />);
  expect(await screen.findByText('Could not load products')).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: 'Retry' }));
  expect(await screen.findByText('Product 1')).toBeOnTheScreen();
});

it('keeps empty success refreshable', async () => {
  mockFetch
    .mockResolvedValueOnce(jsonResponse([]))
    .mockResolvedValueOnce(jsonResponse(makeProducts(1)));
  await renderWithProviders(<ProductsScreen />);
  expect(await screen.findByText('Nothing here yet')).toBeOnTheScreen();
  await fireEvent(screen.getByTestId('product-list'), 'refresh');
  expect(await screen.findByText('Product 1')).toBeOnTheScreen();
});

it('applies the selected brand query configuration and theme', async () => {
  mockFetch.mockResolvedValue(jsonResponse(makeProducts(10)));
  await renderWithProviders(<ProductsScreen />);
  await screen.findByText('6 loaded');
  expect(String(mockFetch.mock.calls[0]?.[0])).toContain('limit=7');
  expect(String(mockFetch.mock.calls[0]?.[0])).toContain('sort=asc');
  await fireEvent.press(screen.getByRole('radio', { name: 'Brand B' }));
  await screen.findByText('8 loaded');
  expect(String(mockFetch.mock.calls[1]?.[0])).toContain('limit=9');
  expect(String(mockFetch.mock.calls[1]?.[0])).toContain('sort=desc');
  expect(screen.getByText('A different point of view.')).toBeOnTheScreen();
  expect(screen.getByRole('radio', { name: 'Brand B' }).props.accessibilityState).toEqual({
    checked: true,
  });
  expect(screen.getByText('MARKET / BRAND B')).toHaveStyle({ color: '#713AB0' });
});

it('preserves products when pull-to-refresh fails', async () => {
  mockFetch
    .mockResolvedValueOnce(jsonResponse(makeProducts(2)))
    .mockRejectedValueOnce(new TypeError('offline'));
  await renderWithProviders(<ProductsScreen />);
  await screen.findByText('Product 1');
  await fireEvent(screen.getByTestId('product-list'), 'refresh');
  expect(await screen.findByText('Could not refresh')).toBeOnTheScreen();
  expect(screen.getByText('Product 1')).toBeOnTheScreen();
  await waitFor(() => expect(screen.getByTestId('product-list').props.refreshing).toBe(false));
});

it('shows an image fallback without losing title or price', async () => {
  mockFetch.mockResolvedValue(jsonResponse(makeProducts(1)));
  await renderWithProviders(<ProductsScreen />);
  await screen.findByText('Product 1');
  await fireEvent(screen.getByLabelText('Product 1'), 'error', { error: 'image unavailable' });
  expect(screen.getByText('Image unavailable')).toBeOnTheScreen();
  expect(screen.getByText('$10.00')).toBeOnTheScreen();
});
