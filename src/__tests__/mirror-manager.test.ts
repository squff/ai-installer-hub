import { MirrorManager } from '../core/mirror-manager';

describe('MirrorManager', () => {
  let manager: MirrorManager;

  beforeEach(() => {
    manager = new MirrorManager();
  });

  test('should default to China mirrors', () => {
    const npmMirror = manager.getNpmRegistry();
    expect(npmMirror).toContain('npmmirror');
  });

  test('should have npm mirror configured', () => {
    const mirror = manager.getMirror('npm');
    expect(mirror).toBeTruthy();
    expect(mirror).toContain('npmmirror');
  });

  test('should have pip mirror configured', () => {
    const mirror = manager.getPipIndex();
    expect(mirror).toBeTruthy();
    expect(mirror).toContain('tsinghua');
  });

  test('should have GitHub proxy configured', () => {
    const url = manager.getGithubUrl('https://github.com/test/repo.git');
    expect(url).toContain('ghproxy');
    expect(url).toContain('test/repo.git');
  });

  test('should have Docker mirrors for China', () => {
    const mirrors = manager.getDockerMirrors();
    expect(mirrors.length).toBeGreaterThan(0);
  });

  test('should generate valid Docker daemon config', () => {
    const config = manager.generateDockerDaemonConfig();
    const parsed = JSON.parse(config);
    expect(parsed['registry-mirrors']).toBeDefined();
    expect(Array.isArray(parsed['registry-mirrors'])).toBe(true);
  });

  test('should switch to global mirrors', () => {
    manager.enableGlobalMirror();
    const npmMirror = manager.getNpmRegistry();
    expect(npmMirror).toContain('npmjs');
  });

  test('should switch back to China mirrors', () => {
    manager.enableGlobalMirror();
    manager.enableChinaMirror();
    const npmMirror = manager.getNpmRegistry();
    expect(npmMirror).toContain('npmmirror');
  });

  test('should have all required mirror types', () => {
    const types = ['npm', 'pip', 'github', 'docker', 'nodejs'];
    for (const type of types) {
      const mirror = manager.getMirror(type);
      expect(mirror).toBeTruthy();
    }
  });
});
