const funcraftapi = require("funcraft-api");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

/**
 * Methode d'appel à l'API funcraft pour récupérer un classement selon les paramètres.
 * 
 * @param {string} month la periode 
 * @param {string} game le type de jeu
 */
async function getTable(month, game) {
    const result = await funcraftapi.table(month, game);
    return result;
}

/**
 * Methode d'appel à l'API funcraft pour récupérer un classement selon les paramètres.
 * 
 * @param {string} pseudo le pseudo pour lequel recupere les stats 
 */
async function getAllStats(pseudo) {
    const result = await funcraftapi.allStats(pseudo);
    return result;
}

/**
 * mettre les minutes en heures + minutes
 * @param {number} minute le nombre de minute a tranformer 
 */
function convertMinute2Hour(minute) {
    outputHour  = (minute / 60) | 0;
    outputMinute = minute % 60;
    return `${outputHour}.${String(outputMinute).padStart(2, '0')}`;
}

/**
 * Fonction permettant de convertir le classement demandé en fichier CSV.
 *  - appel l'api funcraft pour récupérer le classement
 *  - construit le fichier csv resultat
 */
async function ranking2csv(period, game, outputFile) {
    
    //
    // APPEL A L'API FUNCRAFT POUR RECUPERATION DU CLASSEMENT
    // pour la function getTable, mettre la periode au format YYYY-MM (exemple : '2020-03')
    //
    const result = await getTable(period, game);

    //
    // CONVERSION DES 'MINUTES' EN 'HEURE.MINUTE'
    //
    result.map(player => { player.data.gameTime = convertMinute2Hour(player.data.gameTime)})

    
    //
    // ECRITURE DU FICHIER CSV RESULTAT 
    //
    const csvWriter = createCsvWriter({
        path: outputFile,
        header: [
            {id: 'rank', title: 'Rang'},
            {id: 'username', title: 'Pseudo'},
            {id: 'data.points', title: 'Points'},
            {id: 'data.gameTime', title: 'Temps de jeu'},
            {id: 'data.gameCount', title: 'Parties'},
            {id: 'data.winCount', title: 'TOP 1'},
            {id: 'stats.winrate', title: 'Winrate'},
            {id: 'data.kills', title: 'Kills'},
            {id: 'data.deathCount', title: 'Morts'},
            {id: 'stats.kd', title: 'KD'},
        ],
        headerIdDelimiter:'.'
    });
    csvWriter.writeRecords(result)
        .then(() => {
            console.log(`{ code: 0, info: 'file ${outputFile} generated.'}`);
        });
}

async function allStats2csv(pseudo, period, game, outputFile) {

    //
    // APPEL A L'API FUNCRAFT POUR RECUPERATION DU CLASSEMENT
    // pour la function getTable, mettre la periode au format YYYY-MM (exemple : '2020-03')
    //
    const result = await getAllStats(pseudo);

    let resultArray = Object.values(result).filter(p => {return typeof p==='object' && p!==null && p.always!==undefined})
    resultArray = resultArray.flatMap(p => {return Object.values(p)}).filter(p => {return p!==null});

    //
    // ECRITURE DU FICHIER CSV RESULTAT 
    //
    let csvWriter;
    if(period !== undefined && game !== undefined) {
        resultArray = resultArray.filter(p => { return eval(`p.monthName==='${period}'`)})
        resultArray = resultArray.filter(p => { return eval(`p.game==='${game}'`)})
        csvWriter = createCsvWriter({
            path: outputFile,
            header: [
                {id: 'rank', title: 'Rang'},
            ],
            headerIdDelimiter:'.'})
    } else if(period !== undefined) {
        resultArray = resultArray.filter(p => { return eval(`p.monthName==='${period}'`)})
        csvWriter = createCsvWriter({
            path: outputFile,
            header: [
                {id: 'game', title: 'Jeu'},
                {id: 'rank', title: 'Rang'},
            ],
            headerIdDelimiter:'.'})
    } else if(game !== undefined) {
        resultArray = resultArray.filter(p => { return eval(`p.game==='${game}'`)})
        csvWriter = createCsvWriter({
            path: outputFile,
            header: [
                {id: 'monthName', title: 'Periode'},
                {id: 'rank', title: 'Rang'},
            ],
            headerIdDelimiter:'.'})
    } else {
        csvWriter = createCsvWriter({
            path: outputFile,
            header: [
                {id: 'game', title: 'Jeu'},
                {id: 'monthName', title: 'Periode'},
                {id: 'rank', title: 'Rang'},
            ],
            headerIdDelimiter:'.'})
    }

    csvWriter.writeRecords(resultArray)
        .then(() => {
            console.log(`{ code: 0, info: 'file ${outputFile} generated.'}`);
        });

}    

exports.ranking2csv = ranking2csv;
exports.allStats2csv = allStats2csv;
