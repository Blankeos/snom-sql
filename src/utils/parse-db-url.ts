interface PostgresUrlParts {
  user: string;
  password: string;
  host: string;
  port: string;
  databaseName: string;
}

export function parsePostgresUrl(url: string): PostgresUrlParts | null {
  // Regular expression to match PostgreSQL URL components
  const regex = /^([^:]+):\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/;

  const match = url.match(regex);

  if (!match) {
    return null;
  }

  // Destructure the matched groups
  const [, databaseType, user, password, host, port, databaseName] = match;

  return {
    user,
    password,
    host,
    port,
    databaseName,
  };
}

export function serializePostgresUrl(parts: PostgresUrlParts): string {
  return `postgresql://${parts.user}:${parts.password}@${parts.host}:${parts.port}/${parts.databaseName}`;
}
