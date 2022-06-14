import typescript from 'rollup-plugin-typescript2';
import nodeResolve from '@rollup/plugin-node-resolve';

export default [
  {
    input: ['./src/index.ts'],
    output: {
      dir: 'dist',
      format: 'esm',
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      typescript()
    ]
  }
];
