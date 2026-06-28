// eslint.config.js
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from 'typescript-eslint';

export default defineConfig([
    {
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module", // Explicitly tells ESLint you are using ES modules
            parser: tseslint.parser,
            parserOptions: {
                project: 'tsconfig.json',
                sourceType: 'module',
            },
            globals: {
                ...globals.node,
            }
        },
        extends: [
            tseslint.configs.recommended
        ],
        rules: {
            '@typescript-eslint/interface-name-prefix': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
]);