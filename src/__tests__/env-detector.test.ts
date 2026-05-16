import { EnvironmentDetector } from '../core/env-detector';

describe('EnvironmentDetector', () => {
  let detector: EnvironmentDetector;

  beforeEach(() => {
    detector = new EnvironmentDetector();
  });

  test('should detect platform', async () => {
    const env = await detector.detect();
    expect(['windows', 'linux', 'macos']).toContain(env.platform);
  });

  test('should detect architecture', async () => {
    const env = await detector.detect();
    expect(['x64', 'arm64', 'arm']).toContain(env.arch);
  });

  test('should detect home directory', async () => {
    const env = await detector.detect();
    expect(env.homeDir).toBeTruthy();
    expect(env.homeDir.length).toBeGreaterThan(0);
  });

  test('should detect install directory', async () => {
    const env = await detector.detect();
    expect(env.installDir).toContain('.ai-installer-hub');
  });

  test('should detect shell type', async () => {
    const env = await detector.detect();
    expect(env.shellType).toBeTruthy();
  });

  test('should detect OS version', async () => {
    const env = await detector.detect();
    expect(env.osVersion).toBeTruthy();
  });
});
