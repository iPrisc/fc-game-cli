#! /usr/bin/env node

const pkg = require('../package.json');
const program = require('commander');
const {ranking2csv} = require('../index.js');

/*
* ranking2csv command definition
*/
program
    .command('ranking2csv')
    .description('generate csv file containing ranking for a game and a period')
    .option('-f, --filename <filename>', 'output csv file')
    .option('-p, --period <period>', 'the period for the ranking')
    .option('-g, --game <game>', 'the game for the ranking')
    .action((options, command) => {
        
        if(!options.game || !options.period || !options.filename) {
            command.outputHelp();
        } else {
             ranking2csv(options.period, options.game, options.filename).catch((reason)=>console.log(reason))
        }
    })

// Run the command
program.parse(process.argv);



