const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// 1) Desativa o novo handling de "exports" do package.json
config.resolver.unstable_enablePackageExports = false;

// 2) Garante que Metro só use a condição "require"
config.resolver.unstable_conditionNames = ['require'];

// 3) Mapear o módulo 'stream' para o browserify
config.resolver.extraNodeModules = {
  stream: require.resolve('stream-browserify'),
};

// 4) (Opcional) Adiciona 'cjs' ao sourceExts caso alguma lib use esse formato
config.resolver.sourceExts.push('cjs');

module.exports = config;
