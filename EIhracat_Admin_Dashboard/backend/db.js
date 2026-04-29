import sql from "mssql/msnodesqlv8.js";
import dotenv from "dotenv";

dotenv.config();

const driver = process.env.DB_DRIVER || "ODBC Driver 18 for SQL Server";
const server = process.env.DB_SERVER || "(localdb)\\mssqllocaldb";
const database = process.env.DB_DATABASE || "EIhracat_3NF";
const attachFile = process.env.DB_ATTACH_FILE || "";
const useTrustedConnection = (process.env.DB_TRUSTED_CONNECTION || "true").toLowerCase() !== "false";
const trustServerCertificate = (process.env.DB_TRUST_SERVER_CERTIFICATE || "true").toLowerCase() !== "false";

function stringifySqlError(error) {
  const parts = [];

  if (typeof error?.message === "string" && error.message.trim()) {
    parts.push(error.message.trim());
  }

  if (error?.originalError?.info?.message) {
    parts.push(error.originalError.info.message);
  }

  if (Array.isArray(error?.precedingErrors)) {
    for (const item of error.precedingErrors) {
      if (item?.message) parts.push(item.message);
      if (item?.originalError?.info?.message) parts.push(item.originalError.info.message);
    }
  }

  if (!parts.length) {
    try {
      const raw = JSON.stringify(error, Object.getOwnPropertyNames(error), 2);
      if (raw && raw !== "{}") parts.push(raw);
    } catch {
      parts.push(String(error));
    }
  }

  return [...new Set(parts)].join(" | ");
}

const connectionString = [
  `Driver={${driver}}`,
  `Server=${server}`,
  `Database=${database}`,
  attachFile ? `AttachDbFilename=${attachFile}` : null,
  useTrustedConnection ? "Trusted_Connection=Yes" : null,
  !useTrustedConnection && process.env.DB_USER ? `Uid=${process.env.DB_USER}` : null,
  !useTrustedConnection && process.env.DB_PASSWORD ? `Pwd=${process.env.DB_PASSWORD}` : null,
  `TrustServerCertificate=${trustServerCertificate ? "Yes" : "No"}`
].filter(Boolean).join(";");

let pool;

export async function getPool() {
  if (!pool) {
    try {
      pool = await sql.connect({
        connectionString,
        options: {
          trustedConnection: useTrustedConnection,
          trustServerCertificate
        }
      });
    } catch (error) {
      pool = undefined;
      const rawError = stringifySqlError(error);
      error.message =
        `SQL bağlantısı kurulamadı. Server='${server}', Database='${database}'` +
        `${attachFile ? `, AttachDbFilename='${attachFile}'` : ""}. ` +
        `backend/.env içindeki DB_SERVER / DB_DATABASE / DB_DRIVER${attachFile ? " / DB_ATTACH_FILE" : ""} değerlerini kontrol et. ` +
        `Asıl hata: ${rawError}`;
      throw error;
    }
  }
  return pool;
}

export async function testConnection() {
  const activePool = await getPool();
  const result = await activePool.request().query(`
    SELECT
      @@SERVERNAME AS ServerName,
      DB_NAME() AS DatabaseName,
      SYSTEM_USER AS ConnectedUser
  `);
  return result.recordset[0];
}

export { sql, stringifySqlError };
