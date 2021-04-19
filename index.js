const funcraftapi = require("funcraft-api");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');

/**
 * Methode d'appel à l'API funcraft pour récupérer un classement selon les paramètres.
 * @param {string} month la periode 
 * @param {string} game le type de jeu
 */
async function getTable(month, game) {
    const result = await funcraftapi.table(month, game);
    return result;
}

/**
 * Methode d'appel à l'API funcraft pour récupérer un classement selon les paramètres.
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
 * @param {String} period la periode pour laquelle recuperer le classement 
 * @param {String} game le jeu pour lequel recuperer le classement
 * @param {String} outputFile le nom du fichier de sortie
 */
async function ranking2csv(period, game, outputFile) {
    
    // Appel a l'API funcraft pour recuperation du classement
    // Pour la function getTable, mettre la periode au format YYYY-MM (exemple : '2020-03')
    const result = await getTable(period, game);

    // Conversion des minutes en heure.minute
    result.map(player => { player.data.gameTime = convertMinute2Hour(player.data.gameTime)})
    
    // Ecriture du fichier csv resultat 
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

/**
 * Fonction permettant de convertir le classement demandé en fichier json.
 *  - appel l'api funcraft pour récupérer le classement
 *  - construit le fichier json resultat
 * @param {String} period la periode pour laquelle recuperer le classement 
 * @param {String} game le jeu pour lequel recuperer le classement
 * @param {String} outputFile le nom du fichier de sortie
 */
async function ranking2json(period, game, outputFile) {
    
    // Appel a l'API funcraft pour recuperation du classement
    // Pour la function getTable, mettre la periode au format YYYY-MM (exemple : '2020-03')
    const result = await getTable(period, game);

    // Conversion des minutes en heure.minute
    result.map(player => { player.data.gameTime = convertMinute2Hour(player.data.gameTime)})
    
    // Ecriture des stats dans le fichier json resultat
    const json = JSON.stringify(result);
    fs.writeFile(outputFile, json, 'utf8', () => {
        console.log(`{ code: 0, info: 'file ${outputFile} generated.'}`)}); 
}

/**
 * Fonction permettant de recuperer les stats d'un joueur et de les convertir en fichier CSV.
 *  - appel l'api funcraft pour récupérer les stats
 *  - construit le fichier csv resultat 
 * @param {String} pseudo le pseudo du joueur pour qui recuperer les stats 
 * @param {String} period periode pour laquelle recuperer les stats
 * @param {String} game jeu pour lequel recuperer les stats
 * @param {String} outputFile nom du fichier csv de sortie 
 */
async function stats2csv(pseudo, period, game, outputFile) {

    // Recuperation des stats filtrees
    const result = await getStats(pseudo,period,game);

    // Ecriture des stats dans le fichier csv resultat
    let header =  []
    if(game === undefined)  header.push({id: 'game', title: 'Jeu'})
    if(period === undefined) header.push({id: 'monthName', title: 'Periode'})
    header.push({id: 'rank', title: 'Rang'})

    const csvWriter = createCsvWriter({
        path: outputFile,
        header: header,
        headerIdDelimiter:'.'})
    csvWriter.writeRecords(result)
        .then(() => {
            console.log(`{ code: 0, info: 'file ${outputFile} generated.'}`);
        });
}    

/**
 * Fonction permettant de recuperer les stats d'un joueur et de les convertir en fichier json.
 *  - appel l'api funcraft pour récupérer les stats
 *  - construit le fichier json resultat 
 * @param {String} pseudo le pseudo du joueur pour qui recuperer les stats 
 * @param {String} period la periode pour laquelle recuperer les stats
 * @param {String} game jeu pour lequel recuperer les stats
 * @param {String} outputFile nom du fichier json de sortie 
 */async function stats2json(pseudo, period, game, outputFile) {
    // Recuperation des stats filtrees
    const result = await getStats(pseudo,period,game);

    // Ecriture des stats dans le fichier json resultat
    const json = JSON.stringify(result);
    fs.writeFile(outputFile, json, 'utf8', () => {
        console.log(`{ code: 0, info: 'file ${outputFile} generated.'}`)});
}

/**
 * Recupere les statistiques d'un joueur selon les filtres specifies (game et/ou period)
 * @param {String} pseudo le pseudo du joueur pour qui recuperer les stats
 * @param {String} period la periode pour laquelle recuperer les stats
 * @param {String} game jeu pour lequel recuperer les stats
 */
async function getStats(pseudo, period, game) {
    // Appel a l'API funcraft pour recuperation des stats
    let result = await getAllStats(pseudo);

    // Reformattage du resultat
    result = Object.values(result).filter(p => {return typeof p==='object' && p!==null && p.always!==undefined})
    result = result.flatMap(p => {return Object.values(p)}).filter(p => {return p!==null});

    // Filtrage du resultat 
    if(period !== undefined) {
        result = result.filter(p => { return eval(`p.monthName==='${period}'`)})
    } 
    if(game !== undefined) {
        result = result.filter(p => { return eval(`p.game==='${game}'`)})
    }

    return result;
}


exports.ranking2csv = ranking2csv;
exports.ranking2json = ranking2json;
exports.stats2csv = stats2csv;
exports.stats2json = stats2json;
