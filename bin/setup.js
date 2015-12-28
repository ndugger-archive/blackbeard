#!/usr/bin/env node

const cmd = require('commander');

cmd.version('0.1.0-beta')
	.option('-b, --boilerplate', 'Setup with boilerplate examples')
	.option('-d, --database <db>', 'Install necesary database modules', /^(postgres|mysql|mariadb|sqlite|mssql)$/i, 'postgres')
	.parse(process.argv);

console.log(cmd);