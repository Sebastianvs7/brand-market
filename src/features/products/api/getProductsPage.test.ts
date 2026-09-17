import { fetch } from 'expo/fetch';
import { jsonResponse } from '@/testing/http';
import { makeProducts, source } from '../testing/fixtures';
import { getProductsPage } from './getProductsPage';

const mockFetch = jest.mocked(fetch);
beforeEach(() => mockFetch.mockReset());

it('requests a bounded ascending prefix and keeps only its page', async () => {
  mockFetch.mockResolvedValue(jsonResponse(makeProducts(5)));
  const page = await getProductsPage(source, 2, new AbortController().signal);
  expect(new URL(String(mockFetch.mock.calls[0]?.[0])).searchParams.toString()).toBe(
    'limit=5&sort=asc',
  );
  expect(page.items.map((item) => item.id)).toEqual([3, 4]);
  expect(page.nextOffset).toBe(4);
});

it.each([
  [0, 0, [], null],
  [1, 0, [1], null],
  [2, 0, [1, 2], null],
  [3, 0, [1, 2], 2],
  [3, 2, [3], null],
  [4, 2, [3, 4], null],
])('handles catalog size %i at offset %i', async (count, offset, ids, nextOffset) => {
  mockFetch.mockResolvedValue(jsonResponse(makeProducts(count)));
  const page = await getProductsPage(source, offset, new AbortController().signal);
  expect(page.items.map((item) => item.id)).toEqual(ids);
  expect(page.nextOffset).toBe(nextOffset);
});

it('rejects malformed data before UI receives it', async () => {
  mockFetch.mockResolvedValue(jsonResponse([{ id: 1, price: 'wrong' }]));
  await expect(getProductsPage(source, 0, new AbortController().signal)).rejects.toMatchObject({
    kind: 'invalid-response',
  });
});
