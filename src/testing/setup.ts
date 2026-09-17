import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';
import { Image as mockImage } from 'react-native';

jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);
jest.mock('expo/fetch', () => ({ fetch: jest.fn() }));
jest.mock('expo-image', () => ({ Image: mockImage }));
