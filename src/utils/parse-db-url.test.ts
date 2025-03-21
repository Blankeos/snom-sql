import { describe, expect, it } from 'vitest';
import { parsePostgresUrl } from './parse-db-url';

describe('parsePostgresUrl', () => {
  // Valid URL tests
  it('parses a standard PostgreSQL URL correctly', () => {
    const url = 'postgresql://postgres:password123@localhost:5432/reformula_db';
    const result = parsePostgresUrl(url);

    expect(result).toEqual({
      databaseType: 'postgresql',
      user: 'postgres',
      password: 'password123',
      host: 'localhost',
      port: '5432',
      databaseName: 'reformula_db',
    });
  });

  it('handles different usernames and passwords', () => {
    const url = 'postgresql://admin:secret123@server:5432/mydb';
    const result = parsePostgresUrl(url);

    expect(result).toEqual({
      databaseType: 'postgresql',
      user: 'admin',
      password: 'secret123',
      host: 'server',
      port: '5432',
      databaseName: 'mydb',
    });
  });

  it('works with different port numbers', () => {
    const url = 'postgresql://user:pwd@host:5433/database';
    const result = parsePostgresUrl(url);

    expect(result).toEqual({
      databaseType: 'postgresql',
      user: 'user',
      password: 'pwd',
      host: 'host',
      port: '5433',
      databaseName: 'database',
    });
  });

  // Invalid URL tests
  it('returns null for missing protocol', () => {
    const url = 'postgres:password@localhost:5432/db';
    const result = parsePostgresUrl(url);
    expect(result).toBeNull();
  });

  it('returns null for missing username', () => {
    const url = 'postgresql://:password@localhost:5432/db';
    const result = parsePostgresUrl(url);
    expect(result).toBeNull();
  });

  it('returns null for missing password', () => {
    const url = 'postgresql://user@localhost:5432/db';
    const result = parsePostgresUrl(url);
    expect(result).toBeNull();
  });

  it('returns null for missing host', () => {
    const url = 'postgresql://user:password@:5432/db';
    const result = parsePostgresUrl(url);
    expect(result).toBeNull();
  });

  it('returns null for missing port', () => {
    const url = 'postgresql://user:password@localhost/db';
    const result = parsePostgresUrl(url);
    expect(result).toBeNull();
  });

  it('returns null for missing database name', () => {
    const url = 'postgresql://user:password@localhost:5432/';
    const result = parsePostgresUrl(url);
    expect(result).toBeNull();
  });

  it('returns null for completely invalid format', () => {
    const url = 'not-a-url';
    const result = parsePostgresUrl(url);
    expect(result).toBeNull();
  });

  it('returns null for empty string', () => {
    const url = '';
    const result = parsePostgresUrl(url);
    expect(result).toBeNull();
  });

  // Edge cases
  it('handles numbers in username and password', () => {
    const url = 'postgresql://user123:pass456@localhost:5432/db';
    const result = parsePostgresUrl(url);

    expect(result).toEqual({
      databaseType: 'postgresql',
      user: 'user123',
      password: 'pass456',
      host: 'localhost',
      port: '5432',
      databaseName: 'db',
    });
  });

  it('handles minimal valid URL', () => {
    const url = 'postgresql://u:p@h:1/d';
    const result = parsePostgresUrl(url);

    expect(result).toEqual({
      databaseType: 'postgresql',
      user: 'u',
      password: 'p',
      host: 'h',
      port: '1',
      databaseName: 'd',
    });
  });
});
