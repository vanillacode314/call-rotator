import { SQLocal } from 'sqlocal'

const db = new SQLocal('database.sqlite3')
const { sql, transaction } = db

export { db, sql, transaction }
