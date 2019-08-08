import faker from 'faker';

const createUserTableSql = `
CREATE TABLE IF NOT EXISTS users (
  id integer PRIMARY KEY,
  name TEXT,
  user_id TEXT )`;

const hasTable = (db, table) => {
  const sql = `SELECT name FROM sqlite_master WHERE type='table' AND name='${table}';`;
  const result = db.prepare(sql).get();
  if (result) return true;
  return false;
}

const setPragma = (db) => {
  const synchronous = db.pragma(`synchronous`, { simple: true });
  if (synchronous !== 1) {
    db.pragma(`synchronous = 'off'`);
  }

  const journal_mode = db.pragma(`journal_mode`, { simple: true });
  if (journal_mode !== 'wal') {
    db.pragma(`journal_mode = 'wal'`);
  }
}

export function insertBulk(db, dataset, table, columnNames = []) {
  const insert = db.prepare(`INSERT INTO users (${columnNames.join(', ')}) VALUES (${columnNames.map(c => '@'+ c).join(', ')})`);
  console.time('transaction insert 10k row');
  db.transaction(dataset => {
    for (const data of dataset) {
      insert.run(data);
    }
  })(dataset);
  console.timeEnd('transaction insert 10k row');
}

export function fakeUsers(length) {
  const users = [...new Array(length)].map(_ => ({
    name: `${faker.name.firstName()} ${faker.name.lastName()}`,
    user_id: faker.random.uuid(),
  }));

  return users;
}

export function seed(db) {
  setPragma(db);
  if (hasTable(db, 'users')) return;

  db.prepare(createUserTableSql).run();

  const users = fakeUsers(10000);
  insertBulk(users, 'users', ['name', 'user_id']);
}