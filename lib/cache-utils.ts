// Client-side cache utility for preventing unnecessary data reloads
class ClientCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private static instance: ClientCache;

  private constructor() {}

  static getInstance(): ClientCache {
    if (!ClientCache.instance) {
      ClientCache.instance = new ClientCache();
    }
    return ClientCache.instance;
  }

  // Set cache with expiration time (in milliseconds)
  set(key: string, data: any, ttl: number = 5 * 60 * 1000) { // Default 5 minutes
    const expirationTime = Date.now() + ttl;
    this.cache.set(key, { data, timestamp: expirationTime });
  }

  // Get cache data if not expired
  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if cache is expired
    if (Date.now() > cached.timestamp) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  // Clear specific cache entry
  clear(key: string) {
    this.cache.delete(key);
  }

  // Clear all cache
  clearAll() {
    this.cache.clear();
  }

  // Check if cache exists and is not expired
  has(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;

    if (Date.now() > cached.timestamp) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
  
  // Get cache age in milliseconds
  getAge(key: string): number | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    return Date.now() - cached.timestamp;
  }
  
  // Extend cache expiration time
  extend(key: string, additionalTime: number) {
    const cached = this.cache.get(key);
    if (cached) {
      cached.timestamp += additionalTime;
      this.cache.set(key, cached);
    }
  }
}

export default ClientCache.getInstance();