import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';

export default defineConfig([
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'lib/index.cjs',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'lib/index.mjs',
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      commonjs(),
      typescript(),
      terser(),
    ],
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'lib/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
]);
