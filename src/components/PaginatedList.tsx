import React, { useState, useEffect } from 'react';
import { IonItem, IonList, IonInfiniteScroll, IonInfiniteScrollContent, IonLabel } from '@ionic/react';

interface PaginatedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => JSX.Element;
  itemsPerPage?: number;
  showInfiniteScroll?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export const PaginatedList = <T extends {}>({
  items,
  renderItem,
  itemsPerPage = 10,
  showInfiniteScroll = false,
  onLoadMore = () => {},
  hasMore = true
}: PaginatedListProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedItems, setPaginatedItems] = useState<T[]>([]);
  
  // Calcular los elementos para la página actual
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = items.slice(startIndex, endIndex);
    setPaginatedItems(currentItems);
  }, [items, currentPage, itemsPerPage]);

  const loadMoreItems = () => {
    if (hasMore) {
      setCurrentPage(prev => prev + 1);
      onLoadMore();
    }
  };

  const resetPagination = () => {
    setCurrentPage(1);
  };

  // Resetear la paginación cuando cambian los items
  useEffect(() => {
    resetPagination();
  }, [items]);

  return (
    <div>
      <IonList>
        {paginatedItems.map((item, index) => (
          renderItem(item, ((currentPage - 1) * itemsPerPage) + index)
        ))}
      </IonList>
      
      {showInfiniteScroll && hasMore && (
        <IonInfiniteScroll
          onIonInfinite={loadMoreItems}
          threshold="100px"
          disabled={!hasMore}
        >
          <IonInfiniteScrollContent
            loadingSpinner="bubbles"
            loadingText="Cargando más..."
          ></IonInfiniteScrollContent>
        </IonInfiniteScroll>
      )}
      
      {!showInfiniteScroll && items.length > itemsPerPage && (
        <div style={{ textAlign: 'center', padding: '16px' }}>
          <IonItem button onClick={loadMoreItems} disabled={!hasMore}>
            <IonLabel>
              {hasMore ? `Mostrar más (${items.length - paginatedItems.length} restantes)` : 'No hay más elementos'}
            </IonLabel>
          </IonItem>
        </div>
      )}
    </div>
  );
};