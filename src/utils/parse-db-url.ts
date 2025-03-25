interface PostgresUrlParts {
  user: string;
  password: string;
  host: string;
  port?: string; // Made optional
  databaseName: string;
}

export function parsePostgresUrl(url: string): PostgresUrlParts | null {
  // Updated regex to make port optional
  const regex = /^([^:]+):\/\/([^:]+):([^@]+)@([^:]+)(?::(\d+))?\/(.+)$/;

  const match = url.match(regex);
  if (!match) {
    return null;
  }

  // Destructure with optional port (group 5 might be undefined)
  const [, databaseType, user, password, host, port, databaseName] = match;

  // Return object with optional port
  const result: PostgresUrlParts = {
    user,
    password,
    host,
    databaseName,
  };

  if (port) {
    result.port = port;
  }

  return result;
}

export function serializePostgresUrl(parts: PostgresUrlParts): string {
  const portPart = parts.port ? `:${parts.port}` : '';
  return `postgresql://${parts.user}:${parts.password}@${parts.host}${portPart}/${parts.databaseName}`;
}
