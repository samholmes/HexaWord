#!/bin/bash
NODE_ENV=development node --env-file=.env --import=tsx server/index.ts
