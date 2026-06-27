module.exports = (options) => {
  // Remove ForkTsCheckerWebpackPlugin — type errors are caught in CI, not the Docker build
  const plugins = (options.plugins || []).filter(
    (p) => p?.constructor?.name !== 'ForkTsCheckerWebpackPlugin',
  );

  return {
    ...options,
    plugins,
    resolve: {
      ...(options.resolve || {}),
      extensionAlias: {
        '.js': ['.ts', '.js'],
        '.mjs': ['.mts', '.mjs'],
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true,
                configFile: 'tsconfig.json',
              },
            },
          ],
          exclude: /node_modules/,
        },
      ],
    },
    // Bundle everything into dist/main.js except Prisma (needs native binaries at runtime)
    externals: {
      '@prisma/client': 'commonjs @prisma/client',
      '.prisma/client': 'commonjs .prisma/client',
    },
  };
};
