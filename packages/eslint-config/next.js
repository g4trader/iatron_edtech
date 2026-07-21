import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import base from './index.js';

export default [...base, ...nextVitals, ...nextTypescript];
