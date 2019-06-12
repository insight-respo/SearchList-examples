module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  globals: {
    'ts-jest': {
      diagnostics: {
        ignoreCodes: [2536, 2339]
      }
    },
    '__UMI_HTML_SUFFIX': false
  }
};