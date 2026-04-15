import { spawn } from 'child_process';

/**
 * Spawns a command, streams stdout/stderr to the terminal, and resolves on
 * exit code 0. Rejects with an Error otherwise.
 * @param {string} cmd
 * @param {string[]} args
 * @returns {Promise<void>}
 */
export function run(cmd, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    child.on('error', (err) => {
      reject(err);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Process exited with code ${code}`));
      }
    });
  });
}

/**
 * Like run(), but captures stdout and stderr instead of streaming them.
 * @param {string} cmd
 * @param {string[]} args
 * @returns {Promise<{ stdout: string; stderr: string }>}
 */
export function capture(cmd, args = []) {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';

    const child = spawn(cmd, args, {
      shell: process.platform === 'win32',
    });

    child.stdout?.on('data', (d) => { stdout += d.toString(); });
    child.stderr?.on('data', (d) => { stderr += d.toString(); });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        const err = new Error(`Process exited with code ${code}`);
        err.stdout = stdout;
        err.stderr = stderr;
        reject(err);
      }
    });
  });
}
