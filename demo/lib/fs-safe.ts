// AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence granted.
// Safe file writes shared by the local stores. Server only.
import {promises as fs} from 'node:fs';
import path from 'node:path';

// Windows can briefly lock a file that an editor or antivirus is reading; retry a few times.
export async function renameWithRetry(from: string, to: string) {
  for (let attempt = 0; ; attempt++) {
    try { await fs.rename(from, to); return; }
    catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (attempt >= 5 || !['EPERM', 'EBUSY', 'EACCES'].includes(code ?? '')) throw error;
      await new Promise(resolve => setTimeout(resolve, 40 * (attempt + 1)));
    }
  }
}

// Write the whole file to a temporary name, flush it to disk, then rename it over the real one.
// A crash leaves either the old file or the new one, never half of each.
export async function writeJsonAtomic(file: string, data: unknown) {
  await fs.mkdir(path.dirname(file), {recursive: true});
  const tmp = `${file}.${process.pid}.tmp`;
  const handle = await fs.open(tmp, 'w');
  try { await handle.writeFile(JSON.stringify(data, null, 2) + '\n', 'utf8'); await handle.sync(); }
  finally { await handle.close(); }
  await renameWithRetry(tmp, file);
}

export async function listFiles(dir: string, pattern: RegExp): Promise<string[]> {
  try { return (await fs.readdir(dir)).filter(name => pattern.test(name)).sort(); }
  catch { return []; }
}

// Copy a file into a backup folder under a sortable name, then keep only the newest `keep` copies
// that share its prefix.
export async function backupFile(file: string, backupDir: string, name: string, prefix: string, keep: number) {
  try { await fs.access(file); } catch { return; }
  await fs.mkdir(backupDir, {recursive: true});
  await fs.copyFile(file, path.join(backupDir, name));
  const names = await listFiles(backupDir, new RegExp(`^${prefix}.+\\.json$`));
  for (const old of names.slice(0, Math.max(0, names.length - keep))) await fs.rm(path.join(backupDir, old), {force: true});
}
