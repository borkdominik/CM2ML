import yeger from '@yeger/eslint-config'

export default yeger({
  rules: {
    'import/no-unresolved': 'off',
    'react/prop-types': 'off',
    'react-refresh/only-export-components': 'off',
  },
})
