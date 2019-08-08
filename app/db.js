export const createConnection = (path, options) => require('better-sqlite3')(path, options);

export const db = createConnection('foods.db', { verbose: console.log });

process.once('exit', () => db.close());
