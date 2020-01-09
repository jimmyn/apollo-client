process.env.BABEL_ENV = 'test';
process.env.NODE_ENV = 'test';

module.exports = {
  transform: {
    '.(ts|tsx)': 'ts-jest'
  },
  transformIgnorePatterns: [ '[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$' ],
  moduleFileExtensions: [ 'ts', 'tsx', 'js', 'jsx', 'json', 'node' ],
  collectCoverageFrom: [ 'src/**/*.{ts,tsx}' ],
  moduleDirectories: ["node_modules", "src"],
  testMatch: [ '<rootDir>/**/*.(spec|test).{ts,tsx}' ],
  rootDir: '.'
};
