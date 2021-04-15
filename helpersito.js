const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const fetch = require('node-fetch');
const process = require('process');

const extensionMd = '.md'  
// REGULAREXPRESSION THAT I USE
const fileRegularExpresion = /^(.+)\/([^\/]+)$/m;
const absoluteUrlExpression = /\(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,}\gi/gm


// CONST THAT G THE ACTUAL DIRECTORY
const objt = path.parse(__filename);
const actuaDir = objt.dir
let totalLinks;
const totalValidateLinks = [];
const totalBrokelinks = [];
const justOtherLinks = [];

// PROCESS.ORG
const options = process.argv[2];
const controller = (file, e) => {
    
    switch (e) {
        case '--Validate':
            getValidatedLinks(file)
            break;
        case'--Stats':
            console.log("voy a sacar estadisticas");
            case '--Validate':
                getStaticsLinks(file)
            break;
        default: getLinks(file)
        //console.log(file)
            break;
    }
}

const statsAndValidate = (path,link) => {
    const links = [];
    links.push(link);
    fetch(links,['GET'])
      .then(
        (res) => { 
            
            if(res.status === 404){
                totalBrokelinks.push(res.status)
                console.log(totalBrokelinks.length)
           } else if (res.status !== 400){
                totalValidateLinks.push(res.status)
                console.log(totalValidateLinks.length);

          }        
        }
      ).catch(
        (error) => console.log(error)
      )
};

// THIS FUNCTION RETURN THE STATICS
const getStaticsLinks = (path) => {
    
        
        console.log(path)
        /*
        links.forEach((res) =>  {
            //console.log(links)
            const newLinks = res.slice(1,-1);
            statsAndValidate(path,newLinks)
        })*/
}

const validatingLinks = (path,link) => {
    const links = [];
    links.push(link);
    fetch(links,['GET'])
      .then(
        (res) => { 
            if(res.status === 404){
                console.log(chalk.gray.bold (path), chalk.blueBright.bold (link.slice(0,25)),'...' ,chalk.redBright.bold("FAIL"), chalk.yellowBright.bold(res.status))
            } else if (res.status !== 400){
                console.log(chalk.gray.bold (path), chalk.blueBright.bold (link.slice(0,25)),'...',chalk.greenBright.bold(res.statusText), chalk.yellowBright.bold(res.status))
             }        
        }
      ).catch(
        (error) => console.log(error)
      )
};

// THIS FUNCTION RETURN THE LINKS IN A FILE
const getValidatedLinks = (path) => {
    fs.readFile(path, 'utf8', (err, data) => {
        const info = data     
        if (err) {
         console.log(chalk.bgRed(err))
        }
        const links = (info.match(absoluteUrlExpression)) 
        links.forEach((res) =>  {
            //console.log(links)
            const newLinks = res.slice(1,-1);
            // console.log(newLinks)
             validatingLinks(path ,newLinks)         
        })
})
};

// THIS FUNCTION RETURNS THE COMPLETE FILEPATHS ON A DIRECTORY
const knowingPath = (actualDir, directory, file, e) => {
    const pathFinal = path.join(actualDir, directory, file)
    const extension = path.extname(pathFinal)
    console.log(pathFinal)

        if(!extension){
            getFilesFromDirectory(pathFinal)
        }  
    
    mdLinks(pathFinal, e)
    
}

const getFilesFromDirectory = (directory, e) => {

    fs.readdir(directory, (err, files) => {
        if(err) {
            console.log(chalk.bgRed(err))
        }
        const totalFile = files
    
            totalFile.forEach(element => {
            knowingPath(actuaDir, directory, element, e)         
            });
    })
};

const getLinks = (path) => {
    fs.readFile(path, 'utf8', (err, data) => {

        const info = data       
        if (err) {
         console.log(chalk.bgRed(err))
        }
        console.log(info)
        const links = (info.match(absoluteUrlExpression)) 
        links.forEach(links => console.log(chalk.gray.bold(path),chalk.green.bold(links.slice(1,-1))))
})
};

const mdLinks = (file, e) => {
    
    const files = file
    const extension = path.extname(files)

    if(extension === extensionMd){
        controller(file, e)
        console.log("holoooo")
    }
    if (files.match(fileRegularExpresion)){
        getFilesFromDirectory(files, e)
    }

};

mdLinks('./fileOne.md', options)
// mdLinks('./filestwo',options)
//mdLinks('./README.md', options)
//mdLinks('./fileFour.txt') 

