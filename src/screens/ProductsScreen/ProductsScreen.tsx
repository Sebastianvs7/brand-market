import { useCallback, useMemo, type ReactElement } from 'react';
import { ActivityIndicator, FlatList, Text, View, type ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandSwitcher } from '@/branding';
import { ProductCard, type Product } from '@/features/products';
import { getErrorMessage } from '@/shared/api/apiError';
import { useTheme } from '@/shared/theme';
import { AsyncFeedback } from '@/shared/ui/AsyncFeedback';
import { ProductListFooter } from './components/ProductListFooter';
import { ProductListHeader } from './components/ProductListHeader';
import { useProductsScreen } from './hooks/useProductsScreen';
import { createStyles } from './ProductsScreen.styles';

const keyExtractor = (product: Product): string => String(product.id);

export const ProductsScreen = (): ReactElement => {
  const {
    brand,
    products,
    error,
    isPending,
    isRefreshing,
    isFetchingNextPage,
    isFetchNextPageError,
    hasNextPage,
    handleRefresh,
    handleLoadMore,
    handleRetry,
    handleRetryMore,
  } = useProductsScreen();

  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const renderItem = useCallback<ListRenderItem<Product>>(
    ({ item }) => <ProductCard product={item} />,
    [],
  );
  const renderSeparator = useCallback(() => <View style={styles.separator} />, [styles]);
  const handlePullToRefresh = useCallback(() => {
    void handleRefresh();
  }, [handleRefresh]);

  const hasProducts = products.length > 0;
  const refreshError = error && !isFetchNextPageError ? error : null;

  let emptyState: ReactElement;
  if (isPending) {
    emptyState = (
      <AsyncFeedback
        loader={
          <ActivityIndicator accessibilityLabel="Finding good things" color={theme.primary} />
        }
        message="Your collection is on its way."
        title="Finding good things"
      />
    );
  } else if (error) {
    emptyState = (
      <AsyncFeedback
        message={getErrorMessage(error)}
        title="Could not load products"
        onRetry={handleRetry}
      />
    );
  } else {
    emptyState = (
      <AsyncFeedback message="Pull down to check for new products." title="Nothing here yet" />
    );
  }

  return (
    <SafeAreaView edges={['bottom', 'left', 'right', 'top']} style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.wordmark}>MARKET / {brand.name.toUpperCase()}</Text>
        <View style={styles.intro}>
          <Text accessibilityRole="header" style={styles.heading}>
            Everyday finds.
          </Text>
          <Text style={styles.tagline}>{brand.tagline}</Text>
        </View>
        <BrandSwitcher />
      </View>

      <FlatList<Product>
        ItemSeparatorComponent={renderSeparator}
        ListEmptyComponent={<View style={styles.empty}>{emptyState}</View>}
        ListFooterComponent={
          hasProducts ? (
            <ProductListFooter
              error={isFetchNextPageError ? error : null}
              hasMore={hasNextPage}
              isLoading={isFetchingNextPage}
              onRetry={handleRetryMore}
            />
          ) : null
        }
        ListHeaderComponent={
          hasProducts ? (
            <ProductListHeader count={products.length} error={refreshError} onRetry={handleRetry} />
          ) : null
        }
        alwaysBounceVertical
        contentContainerStyle={styles.content}
        data={products}
        initialNumToRender={8}
        keyExtractor={keyExtractor}
        maxToRenderPerBatch={8}
        progressViewOffset={0}
        refreshing={isRefreshing}
        renderItem={renderItem}
        style={styles.list}
        testID="product-list"
        updateCellsBatchingPeriod={50}
        windowSize={7}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        onRefresh={handlePullToRefresh}
      />
    </SafeAreaView>
  );
};
