// Publica o admin DENTRO do servidor do site, em https://fechatudo.com.br/corporativo
// (alternativa à Vercel). Faz o build com o caminho /corporativo e a API no mesmo domínio,
// e copia para a pasta que o servidor serve.
// Uso: npm run deploy
// Destino padrão: ../../site_fechatudo/code/corporativo/build  (troque com ADMIN_DEPLOY_DIR=...)
// O build anterior fica em build.old, para voltar rapidamente se precisar.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'build');
const target = path.resolve(process.env.ADMIN_DEPLOY_DIR || path.join(root, '..', '..', 'site_fechatudo', 'code', 'corporativo', 'build'));
const backup = `${target}.old`;

// Variáveis definidas aqui têm prioridade sobre o .env.production (que é o da Vercel)
const build = spawnSync('npx', ['react-scripts', 'build'], {
    cwd: root,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, PUBLIC_URL: '/corporativo', REACT_APP_API_ORIGIN: '', REACT_APP_SITE_URL: 'https://fechatudo.com.br' },
});
if (build.status !== 0) process.exit(build.status || 1);

if (!fs.existsSync(path.join(source, 'index.html'))) {
    console.error('Build não encontrado.');
    process.exit(1);
}

fs.mkdirSync(path.dirname(target), { recursive: true });
if (fs.existsSync(target)) {
    fs.rmSync(backup, { recursive: true, force: true });
    fs.renameSync(target, backup);
    console.log(`Build anterior guardado em ${backup}`);
}
fs.cpSync(source, target, { recursive: true });
console.log(`Admin publicado em ${target} (acesso: /corporativo)`);
console.log('Para voltar à versão anterior: apague a pasta build e renomeie build.old para build.');
