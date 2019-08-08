import React, { useState, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';

import { insertBulk, fakeUsers } from './seed';

const InfiniteList = ({
  db,
  table,
  pageSize = 20,
}) => {
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  const isItemLoaded = index => !hasNextPage || index < items.length;

  const loadMoreItems = (...args) => {
    if (loading) return;
    setLoading(true);
    console.time('load more from db');
    const nextPageItems = db.prepare(`select * from ${table} where id > ${items.length} limit ${pageSize}`).all();
    console.timeEnd('load more from db');

    const nextItems = [...items, ...nextPageItems];
    setItems(nextItems);
    setLoading(false);
    setHasNextPage(nextPageItems.length >= pageSize);
  }

  const itemCount = hasNextPage ? items.length + 1 : items.length;

  const Item = ({ index, style }) => {
    const content = isItemLoaded(index) ? items[index].name : 'Loading...';
    return <div style={style}>{index+1}: {content}</div>;
  };

  const insertLargeData = useCallback(() => {
    const users = fakeUsers(10000);
    insertBulk(db, users, 'users', ['name', 'user_id']);
  }, []);

  return (
    <>
      <InfiniteLoader
        isItemLoaded={isItemLoaded}
        itemCount={itemCount}
        loadMoreItems={loadMoreItems}
      >
        {({ onItemsRendered, ref }) => (
          <List
            className="list"
            width={300}
            height={150}
            onItemsRendered={onItemsRendered}
            itemCount={itemCount}
            ref={ref}
            itemSize={30}
          >
            {Item}
          </List>
        )}
      </InfiniteLoader>
      <button onClick={insertLargeData}>insert 10k data</button>
    </>
  );
}

export default React.memo(InfiniteList);