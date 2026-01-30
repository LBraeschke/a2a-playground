import { db } from "./setup.ts";

// Prepared statements for cake operations
const queries = {
  get: db.prepare("SELECT description FROM store WHERE cake_name = ?"),
  set: db.prepare(
    "INSERT INTO store (cake_name, description) VALUES (@cake_name, @description) ON CONFLICT(cake_name) DO UPDATE SET description = @description",
  ),
  delete: db.prepare("DELETE FROM store WHERE cake_name = ?"),
  getAll: db.prepare("SELECT cake_name, description FROM store"),
  has: db.prepare("SELECT 1 FROM store WHERE cake_name = ?"),
};

// Type definitions
export interface Cake {
  cake_name: string;
  description: string;
}

// CRUD operations with proper typing
export function get(cakeName: string): string | undefined {
  const row = queries.get.get(cakeName) as { description: string } | undefined;
  return row?.description;
}

export function set(cakeName: string, description: string): void {
  queries.set.run({ cake_name: cakeName, description });
}

export function del(cakeName: string): boolean {
  const result = queries.delete.run(cakeName);
  return result.changes > 0;
}

export function has(cakeName: string): boolean {
  return queries.has.get(cakeName) !== undefined;
}

export function getAll(): Cake[] {
  return queries.getAll.all() as Cake[];
}
