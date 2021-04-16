const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const fetch = require('node-fetch');
const process = require('process');
const absoluteUrlExpression = /\(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,}\gi/gm


/* --------- CONTORLADOR GENERAL ---------- */
const controller = (file, options) => {
    const linksResult = fs.readFileSync(file, 'utf-8').match(absoluteUrlExpression) 
        if (options.two === undefined) {
            option = options.one
        } else if(options.two !== undefined){
            option = options.one +" "+ options.two
        }
            if (option === '--validate') {
                validatingLinks(file, linksResult, option)
            } else if (option === '--stats') {
                stats(linksResult, file)
            }else if (option === '--stats --validate') {
                statsAndValidate(linksResult, file)                    
            }else if (!option) {
                showingLinks(linksResult, file);
            }
};
const statsAndValidate = (link, file) => {
    let Links = link.map((allLinks) => {
        const linksAbsolute = allLinks.slice(1,-1);
        
        return fetch(linksAbsolute,['GET'])
            .then((res) => {
               return res
            }).catch((err) => console.log(err)) 
     })
    return Promise.all(Links)
         .then((res) =>  statsValid(res, link, file))
         .catch((err) => console.log(err))
};
const validatingLinks = (file, link) => {
    link.forEach((allLinks) => {
        const linksAbsolute = allLinks.slice(1,-1);
        fetch(linksAbsolute,['GET'])
            .then((res) => {
                showingValidLinks(file,res, linksAbsolute)   
            }).catch((err) => console.log(err)) 
    })               
};
const statsValid = (res, link, file) => {
    let totalLinks=link.length; 
    const uniqueLinks = [...new Set(link)].length; 
    const brokeLinks = []
    const arrayRes = res.forEach(res => {
        if (res.status !== 200) {
            brokeLinks.push(res)
            return brokeLinks
        }
    })
    const linksStats = {
        NAME:file,
        TOTALS:totalLinks,
        UNIQUE:uniqueLinks,
        BROKE: brokeLinks.length
    }
        showingStatsAndValidate(linksStats);
};
const stats = (link, file) => {
    let totalLinks=link.length; 
    const uniqueLinks = [...new Set(link)].length; 
    
    const linksStats = {
        NAME:file,
        TOTALS:totalLinks,
        UNIQUE:uniqueLinks
    }
    showingStats(linksStats)
};
/* --------- < FUNCIÓNES QUE RENDERIZAN RESULTADOS EN LA CONSOLA > ---------- */
const showingStatsAndValidate = (linksStats) => {
    setTimeout(() => {
        console.log(("      "), chalk.whiteBright.bold("FILE NAME: "),chalk.greenBright.bold(linksStats.NAME));
        console.log((" "))
        console.log(("      "), chalk.yellowBright.bold("TOTAL-LINKS: "),chalk.blueBright.bold(linksStats.TOTALS));
        console.log(("      "), chalk.yellowBright.bold("UNIQUE-LINKS:"),chalk.blueBright.bold(linksStats.UNIQUE));
        console.log(("      "), chalk.yellowBright.bold("BROKEN-LINKS:"),chalk.redBright.bold(linksStats.BROKE));
        console.log((" "));
    },1500)
};
const showingStats = (stats) =>{
    setTimeout(() => {
        console.log(("      "), chalk.whiteBright.bold("FILE: "),chalk.greenBright.bold(stats.NAME));
        console.log((" "))
        console.log(("      "), chalk.yellowBright.bold("TOTAL-LINKS:"),chalk.blueBright.bold(stats.TOTALS))
        console.log(("      "), chalk.yellowBright.bold("UNIQUE-LINKS:"),chalk.blueBright.bold(stats.UNIQUE))
        console.log((" "))
    }, 1500)
};
const showingValidLinks = (path, res, link) =>{
    if(res.status === 404){
        console.log(("      "), chalk.gray.bold(path), chalk.blueBright.bold (link.slice(0,25)) ,chalk.redBright.bold("FAIL"), chalk.yellowBright.bold(res.status))
    } else if (res.status !== 400){
        console.log(("      "), chalk.gray.bold(path), chalk.blueBright.bold (link.slice(0,25)),chalk.greenBright.bold(res.statusText), chalk.yellowBright.bold(res.status))
    } 
};
const showingLinks =  (links, file) => {
    links.forEach(link => {
       link.slice(1,-1)  
       console.log(("      "), chalk.gray.bold(file.slice(0,25)),chalk.green.bold(link.slice(1,40)))
    })
    console.log(("  "));
};

/* --------- TODA ESTA PARTE REALIZA LA VALIDACIÓN, DE SI ES UNA CARPETA O UN ARCHIVO .MD ---------- */ 
const getPathFinal = (files, directory, options) => {
    let filePathFinal = [];
        files.forEach(element => {
            const newPath = path.resolve(directory,element)
                if (path.extname(newPath) === ".md") {
                    filePathFinal.push(newPath) 
                }
                else 
                    getFilesFromDirectory(newPath, options)           
        });
        return filePathFinal
};
const getFilesFromDirectory = (directory, options) => {
    const files = fs.readdirSync(directory,'utf8')
        let pathFinal = getPathFinal(files, directory, options)
        
        pathFinal.forEach(mdFiles => {
            mdLinksFunction(mdFiles, options)
        })
};
const mdLinksFunction = (file, options) => {
    const files = fs.statSync(file)  
    if (files.isDirectory()) {
        getFilesFromDirectory(file, options)
    }else if (files.isFile()) {
        const extension = path.extname(file)
            if (extension === ".md") {
                controller(file, options)
            }};
}; 

const mdLinks = () => {
    console.log(("         "));
    console.log(("    "), chalk.bgWhite.black("                              ANALYZING                              "));
    console.log(("         "));
    const options = {
        one: process.argv[3],
        two: process.argv[4],
    };  
    const file = process.argv[2];
    mdLinksFunction(file, options);
}

mdLinks()
