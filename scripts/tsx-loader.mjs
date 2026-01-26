// scripts/tsx-loader.mjs
import { register } from 'node:module'
import { pathToFileURL } from 'node:url'

register('tsx/esm', pathToFileURL('./'))