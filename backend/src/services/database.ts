import { PrismaClient } from '@prisma/client';

/**
 * Database Service - Singleton Prisma Client
 *
 * Handles:
 * - Connection pooling with configurable limits
 * - Error handling
 * - Graceful shutdown
 * - Query logging (development only)
 * - Connection health checks
 * - Startup validation
 */
class DatabaseService {
  private static instance: DatabaseService;
  private prisma: PrismaClient;
  private connectionLimit: number;
  private poolTimeout: number;
  private isConnected: boolean = false;

  private constructor() {
    // Parse connection limit from environment (default: 10)
    this.connectionLimit = process.env.DATABASE_CONNECTION_LIMIT
      ? parseInt(process.env.DATABASE_CONNECTION_LIMIT, 10)
      : 10;

    // Parse pool timeout from environment (default: 10 seconds)
    this.poolTimeout = process.env.DATABASE_POOL_TIMEOUT
      ? parseInt(process.env.DATABASE_POOL_TIMEOUT, 10)
      : 10;

    // Validate connection limit
    if (this.connectionLimit < 1 || this.connectionLimit > 100) {
      console.warn(`⚠️  DATABASE_CONNECTION_LIMIT (${this.connectionLimit}) outside recommended range (1-100). Using 10.`);
      this.connectionLimit = 10;
    }

    // Validate pool timeout
    if (this.poolTimeout < 1 || this.poolTimeout > 60) {
      console.warn(`⚠️  DATABASE_POOL_TIMEOUT (${this.poolTimeout}) outside recommended range (1-60s). Using 10s.`);
      this.poolTimeout = 10;
    }

    // Initialize Prisma Client with connection pooling
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
      datasources: {
        db: {
          url: this.buildDatabaseUrl(),
        },
      },
    });

    console.log(`📊 Database connection pool configured: ${this.connectionLimit} connections`);

    // Note: Graceful shutdown is handled in index.ts via SIGINT/SIGTERM handlers
    // No need to hook beforeExit here as it fires when event loop empties,
    // which would cause premature shutdown after server initialization
  }

  /**
   * Build DATABASE_URL with connection pool parameters
   * Adds connection_limit and pool_timeout if not already present
   */
  private buildDatabaseUrl(): string {
    const baseUrl = process.env.DATABASE_URL || '';

    // Check if URL already has connection parameters
    if (baseUrl.includes('connection_limit=') && baseUrl.includes('pool_timeout=')) {
      return baseUrl;
    }

    // Add connection pool parameters
    const separator = baseUrl.includes('?') ? '&' : '?';
    const poolParams = `connection_limit=${this.connectionLimit}&pool_timeout=${this.poolTimeout}`;

    return `${baseUrl}${separator}${poolParams}`;
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public getClient(): PrismaClient {
    return this.prisma;
  }

  public async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      this.isConnected = true;
      console.log('✓ Database connected successfully');
      console.log(`  Connection pool: ${this.connectionLimit} max connections`);
      console.log(`  Pool timeout: ${this.poolTimeout} seconds`);
    } catch (error) {
      this.isConnected = false;
      console.error('✗ Database connection failed:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await this.prisma.$disconnect();
      this.isConnected = false;
      console.log('✓ Database disconnected successfully');
    } catch (error) {
      console.error('✗ Database disconnection failed:', error);
      throw error;
    }
  }

  /**
   * Perform a health check on the database connection
   * @returns Promise<boolean> - true if healthy, false otherwise
   */
  public async healthCheck(): Promise<boolean> {
    try {
      const startTime = Date.now();
      await this.prisma.$queryRaw`SELECT 1 as health_check`;
      const duration = Date.now() - startTime;

      if (duration > 1000) {
        console.warn(`⚠️  Database health check slow: ${duration}ms`);
      }

      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  /**
   * Get connection status
   * @returns boolean - true if connected
   */
  public isConnectionAlive(): boolean {
    return this.isConnected;
  }

  /**
   * Get connection pool configuration
   * @returns Object with pool configuration
   */
  public getPoolConfig() {
    return {
      connectionLimit: this.connectionLimit,
      poolTimeout: this.poolTimeout,
      isConnected: this.isConnected,
    };
  }
}

// Export singleton instance
export const db = DatabaseService.getInstance().getClient();
export const prisma = db; // Alias for backwards compatibility
export const dbService = DatabaseService.getInstance();
export default DatabaseService;
