import {defineConfig} from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        root: '.',
        include: ['**/*.e2e-spec.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text-summary'],
            reportsDirectory: './coverage',
            thresholds: {
                statements: 60,
                branches: 60,
                functions: 60,
                lines: 60,
            },
            include: ['src/**/*.{ts,js}'],
            exclude: [
                '**/constants/*.ts',
                '**/index.ts',
                '**/main.ts',
                '**/*.dto.ts',
                '**/*.abstract.ts',
                '**/*.spec.ts',
            ],
        },
    },
});
