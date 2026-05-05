const fs = require('node:fs');
const path = require('node:path');
const tsconfigPaths = require('tsconfig-paths');

const rootDir = __dirname;
const tsconfigPath = path.join(rootDir, 'tsconfig.base.json');
const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
const paths = tsconfig.compilerOptions?.paths ?? {};

tsconfigPaths.register({
  baseUrl: path.join(process.cwd(), 'dist'),
  paths,
});
