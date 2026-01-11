import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.ts',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'src/test/',
                '**/*.d.ts',
                '**/*.config.*',
                '**/mockData',
                'dist/'
            ],
            lines: 60,
            functions: 60,
            branches: 60,
            statements: 60,
            // Progressive coverage thresholds:
            // Phase 1 (Current): 60% - Foundation phase (Milestones 1-2)
            // Phase 2 (After M2): 65% - Growth phase (Milestones 2-4)
            // Phase 3 (After M4): 75% - Enforcement phase (Milestones 5-8)
            // Target: 80%+ by project completion
        }
    },
});
