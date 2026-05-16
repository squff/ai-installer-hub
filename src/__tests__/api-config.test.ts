import { ApiConfigManager } from '../core/api-config';

describe('ApiConfigManager', () => {
  let manager: ApiConfigManager;

  beforeEach(() => {
    manager = new ApiConfigManager();
  });

  test('should have China-recommended providers', () => {
    const providers = manager.listProviders();
    const chinaProviders = providers.filter((p) => p.chinaRecommended);
    expect(chinaProviders.length).toBeGreaterThan(0);
  });

  test('should list providers with needsProxy flag', () => {
    const providers = manager.listProviders();
    const proxyProviders = providers.filter((p) => p.needsProxy);
    expect(proxyProviders.length).toBeGreaterThan(0);

    for (const p of proxyProviders) {
      expect(p.chinaRecommended).toBe(false);
    }
  });

  test('should find provider by name', () => {
    const deepseek = manager.getProvider('deepseek');
    expect(deepseek).toBeDefined();
    expect(deepseek!.displayName).toContain('DeepSeek');
    expect(deepseek!.needsProxy).toBe(false);
  });

  test('should return undefined for unknown provider', () => {
    const unknown = manager.getProvider('nonexistent');
    expect(unknown).toBeUndefined();
  });

  test('should have envKey for all providers', () => {
    const providers = manager.listProviders();
    for (const p of providers) {
      expect(p.envKey).toBeTruthy();
      expect(p.envKey).toMatch(/_API_KEY$/);
    }
  });

  test('should have baseUrl for all providers', () => {
    const providers = manager.listProviders();
    for (const p of providers) {
      expect(p.baseUrl).toBeTruthy();
    }
  });

  test('should have models for all providers', () => {
    const providers = manager.listProviders();
    for (const p of providers) {
      expect(p.models.length).toBeGreaterThan(0);
    }
  });

  test('DeepSeek should be first in China-recommended list', () => {
    const providers = manager.listProviders();
    const chinaProviders = providers.filter((p) => p.chinaRecommended);
    expect(chinaProviders[0].name).toBe('deepseek');
  });
});
