'use strict';
// Compatibility entry point. Uses real async converters; old mock API was removed.
module.exports = require('./src/core/converter.cjs');
if (require.main === module) require('./src/cli.cjs');
