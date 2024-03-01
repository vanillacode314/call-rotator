import { SQLocal } from 'sqlocal'

export const db = new SQLocal('database.sqlite3')
export const { sql, transaction } = db
