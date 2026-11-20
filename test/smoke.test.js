// Smoke tests: start the real server and check the main routes and static assets.
// Requires `yarn run build` first (serves dist/app/boot.js).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const pkg  = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));

let server;
let baseUrl;
let stdout = '';
let stderr = '';

before(async () => {
    server = spawn(process.execPath, ['server.js'], {
        cwd: root,
        env: {
            ...process.env,
            PORT        : '0',
            API_HOST    : process.env.API_HOST     || 'https://api.cbddev.xyz',
            ACCOUNTS_URL: process.env.ACCOUNTS_URL || 'https://accounts.cbddev.xyz',
            ENCRYPTION_PASSWORD: process.env.ENCRYPTION_PASSWORD || 'smoke-test-only',
        },
        stdio: ['ignore', 'pipe', 'pipe'],
    });
    server.stderr.on('data', (d) => { stderr += d; });

    baseUrl = await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`server did not start\n${stdout}\n${stderr}`)), 20000);
        server.on('exit', (code) => reject(new Error(`server exited (${code})\n${stdout}\n${stderr}`)));
        server.stdout.on('data', (d) => {
            stdout += d;
            const m = /Server listening on .*"port":(\d+)/.exec(stdout);
            if (m) { clearTimeout(timer); resolve(`http://127.0.0.1:${m[1]}`); }
        });
    });
});

after(() => server?.kill());

function satisfiesEngines(version, range) {
    const cmp = (a, b) => { for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] - b[i]; return 0; };
    const v = version.replace(/^v/, '').split('.').map(Number);
    return range.split('||').some((alt) => {
        const m = /^\s*(\^|>=)(\d+)\.(\d+)\.(\d+)\s*$/.exec(alt);
        if (!m) throw new Error(`unsupported engines range: ${alt}`);
        const min = m.slice(2).map(Number);
        return cmp(v, min) >= 0 && (m[1] === '>=' || v[0] === min[0]);
    });
}

test('node version satisfies package.json engines', () => {
    assert.ok(satisfiesEngines(process.version, pkg.engines.node),
        `${process.version} does not satisfy ${pkg.engines.node}`);
});

for (const path of ['/', '/projects', '/translation', '/articles', '/clearing-house', '/widgets']) {
    test(`GET ${path} renders the app template`, async () => {
        const res = await fetch(baseUrl + path);
        assert.equal(res.status, 200);
        const html = await res.text();
        assert.match(html, /<title>SCBD \| Manage<\/title>/);
        assert.match(html, /apiHost\s*: 'https:\/\/api\.cbddev\.xyz'/);
    });
}

for (const [path, type] of [
    ['/app/boot.js',                          /javascript/],
    ['/app/dist/css/AdminLTE.min.css',        /text\/css/],
    ['/app/dist/css/skins/_all-skins.min.css', /text\/css/],
    ['/app/dist/css/application-style.css',   /text\/css/],
]) {
    test(`GET ${path} serves a static asset`, async () => {
        const res = await fetch(baseUrl + path);
        assert.equal(res.status, 200);
        assert.match(res.headers.get('content-type'), type);
        assert.ok((await res.arrayBuffer()).byteLength > 0);
    });
}

test('GET /app/missing.js returns 404', async () => {
    const res = await fetch(baseUrl + '/app/missing.js');
    assert.equal(res.status, 404);
});

test('server log is clean', () => {
    assert.equal(stderr.trim(), '', `unexpected stderr:\n${stderr}`);
    assert.doesNotMatch(stdout, /error|warning|deprecat/i);
});
