module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      // 1. Configura o dotenv para ler sua chave do Google
      ["module:react-native-dotenv", {
        "moduleName": "@env",
        "path": ".env",
        "allowUndefined": false
      }],
      // 2. Necessário para animações e NativeWind
      'react-native-reanimated/plugin',
    ],
  };
};