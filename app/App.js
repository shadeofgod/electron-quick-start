import React, { useEffect, useState } from 'react';
import List from './List';

import { db } from './db';
import { seed } from './seed';

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    seed(db);
    setLoading(false);
  }, []);

  if (loading) return "Loading...";

  return (
    <>
      <List db={db} table="users"/>
    </>
  )
}

export default App;