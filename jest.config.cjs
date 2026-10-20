module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  moduleNameMapper: {
    '^@exp1/(.*)$': '<rootDir>/src/experiment1/$1',
    '^@exp2/(.*)$': '<rootDir>/src/experiment2/$1',
    '^@exp3/(.*)$': '<rootDir>/src/experiment3/$1',
    '^@exp4/(.*)$': '<rootDir>/src/experiment4/$1',
  },
}