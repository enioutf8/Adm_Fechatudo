// Copia o build do admin para a pasta que o servidor do site serve em /corporativo.
// Uso: npm run deploy   (roda o build antes)
// Destino padrão: ../../site_fechatudo/code/corporativo/build  (troque com ADMIN_DEPLOY_DIR=...)
// O build anterior fica em build.old, para voltar rapidamente se precisar.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'build');
const target = path.resolve(process.env.ADMIN_DEPLOY_DIR || path.join(root, '..', '..', 'site_fechatudo', 'code', 'corporativo', 'build'));
const backup = `${target}.old`;

if (!fs.existsSync(path.join(source, 'index.html'))) {
    console.error('Build não encontrado. Rode "npm run build" antes.');
    process.exit(1);
}

fs.mkdirSync(path.dirname(target), { recursive: true });
if (fs.existsSync(target)) {
    fs.rmSync(backup, { recursive: true, force: true });
    fs.renameSync(target, backup);
    console.log(`Build anterior guardado em ${backup}`);
}
fs.cpSync(source, target, { recursive: true });
console.log(`Admin publicado em ${target}`);
console.log('Para voltar à versão anterior: apague a pasta build e renomeie build.old para build.');
