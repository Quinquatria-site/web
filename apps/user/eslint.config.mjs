import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const SERVER_ENUM_MARKER = /^(CHN|FOODTRUCK|ARTIST|PERMANENT|LOST_ITEM_IMAGE|RESOURCE_NOT_FOUND)$/
const USE_SCHEMA = '서버 데이터 모델은 @quen/schema 에서 가져오세요.'

const schemaRules = {
  'no-restricted-syntax': [
    'error',
    {
      selector: `TSAsExpression[typeAnnotation.typeName.name='const'] > ArrayExpression > Literal[value=${SERVER_ENUM_MARKER}]`,
      message: `서버 enum 을 다시 정의하고 있습니다. ${USE_SCHEMA}`,
    },
    {
      selector: `TSAsExpression[typeAnnotation.typeName.name='const'] > ObjectExpression > Property[key.name=${SERVER_ENUM_MARKER}]`,
      message: `서버 enum 을 다시 정의하고 있습니다. ${USE_SCHEMA}`,
    },
    {
      selector: `TSUnionType > TSLiteralType > Literal[value=${SERVER_ENUM_MARKER}]`,
      message: `서버 enum 을 다시 정의하고 있습니다. ${USE_SCHEMA}`,
    },
    {
      selector:
        ":matches(TSInterfaceDeclaration, TSTypeAliasDeclaration)[id.name=/Translation$/]:has(TSPropertySignature[key.name='language_code'])",
      message: `번역 타입을 다시 정의하고 있습니다. @quen/schema 의 WithTranslations 로 조립하세요.`,
    },
  ],
  'no-restricted-imports': [
    'error',
    {
      patterns: [
        {
          group: ['**/packages/schema/**', '@quen/schema/src/**'],
          message: '@quen/schema/entities/… 처럼 패키지 경로로 가져오세요.',
        },
      ],
    },
  ],
}

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ['**/*.{ts,tsx}'],
    rules: schemaRules,
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
])

export default eslintConfig
