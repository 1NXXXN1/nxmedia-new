import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import next from 'eslint-config-next';

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  js.configs.recommended,
  ...compat.extends('next/core-web-vitals'),
  ...compat.extends('next/typescript'),
];
