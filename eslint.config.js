import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'

export default [
	js.configs.recommended,
	...pluginVue.configs['flat/essential'],
	{
		files: ['**/*.{js,vue}'],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.node,
				__APP_BASE__: 'readonly'
			}
		},
		rules: {
			'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			'vue/multi-word-component-names': 'off'
		}
	},
	{
		ignores: ['dist/**', 'node_modules/**']
	},
	eslintConfigPrettier
]
