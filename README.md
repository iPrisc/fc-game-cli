# fc-game client

Hello! this is a command line tool to get info, stats on funcraft server.
This CLI tool is based on the **funcraft-api** npm package.

## Prerequisite

This CLI require [nodejs](https://nodejs.org/en/download/) to be installed on the target machine.
   > This CLI has been tested with node 15.14.0.

## Install
    npm i -g fc-game-cli

## Usage
    fc-game-cli <command> <options>
    
    examples:
        fc-game-cli ranking2csv -p always -g survival -f survival-ranking.csv

Available commands are :
*   **ranking2csv** : generate csv file containing ranking for a game and a period
    options :
    *   -p, --period <period> : the period for the ranking (format YYYY-MM).
    *   -g, --game <game> : the game for the ranking
    *   -f, --filename <filename> : the output csv filename.

*   **allstats2csv** : generate csv file containing ranking for a pseudo eventually filtered by period and/or game :
    *   -n, --pseudo <pseudo> : the pseudo to get the stats for.
    *   -p, --period [period] : the period to get the stats for.
    *   -g, --game [game] : the game to get the stats for
    *   -f, --filename <filename> : the output csv filename.

   more commands to come !

<u>note</u> : The CLI return json formatted output to be more easily integrated within other command line batch tools:

    > fc-game-cli ranking2csv -f out.csv -p '2021-04' -g survival
    { code: 0, info: 'file out.csv generated.'}
    > fc-game-cli ranking2csv -f out.csv -p '2021-04' -g fakegame
    { code: 1, error: 'Specified game is incorrect.'}