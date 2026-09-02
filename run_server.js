import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const isWin = process.platform === 'win32';
let pythonCmd = 'python';

const venvWin = path.resolve('.venv', 'Scripts', 'python.exe');
const venvUnix = path.resolve('.venv', 'bin', 'python');

if (isWin && fs.existsSync(venvWin)) {
    pythonCmd = venvWin;
} else if (fs.existsSync(venvUnix)) {
    pythonCmd = venvUnix;
}

const child = spawn(pythonCmd, ['backend/manage.py', 'runserver', '8000'], {
    stdio: 'inherit',
});

child.on('exit', (code) => {
    process.exit(code ?? 0);
});

process.on('SIGINT', () => {
    child.kill('SIGINT');
    process.exit(0);
});

process.on('SIGTERM', () => {
    child.kill('SIGTERM');
    process.exit(0);
});
