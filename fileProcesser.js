import { xmlToJson } from "./converter.js"
// import { sortTableByColumn } from "./sortTable.js"

const tableHeadings = ["id", "firstName", "lastName", "email", "phone"]
const choiceBtns = document.getElementsByClassName("choice")
const body = document.body
const moreFilesDiv = document.getElementById("too-many-files")
const incorrectFormatDiv = document.getElementById("incorrect-format")

const xsltProcessor = new XSLTProcessor()
const xmlReader = new FileReader()
const xsltReader = new FileReader()
const xmlParser = new DOMParser()
const xsltParser = new DOMParser()

const print = console.log

var xmlDoc;
var xsltDoc;


async function waitForBtns() {
    return new Promise(async (resolve) => {
        let files = []
        for (let btn of choiceBtns) {
            const clickPromise = new Promise(async (btnResolve) => {
            btn.addEventListener("click", async () => {
                files.push(await importData(btn));
                // print(`wait:${res}`);
                btnResolve(files);
            });
            });
    
            await clickPromise;
        }
        resolve(files);
    });
}

async function performTransformation(xmlDoc, xsltDoc) {
    
    return new Promise(async (resolve) => {
        let readyHtml;

        const loadXMLPromise = new Promise(async (xmlResolve) => {
            xmlReader.addEventListener("load", () => {
                
                xmlDoc = xmlReader.result
                xmlDoc = xmlParser.parseFromString(xmlDoc, "text/xml")
                print(`LOAD XML ${xmlDoc}`)
                xmlResolve(xmlDoc)
            })
            xmlReader.readAsBinaryString(xmlDoc)
        })

        await loadXMLPromise;
        print("AFTER XML PROMISE")
        const loadXSLPromise = new Promise(async (xslResolve) => {
            print("ENTERED XSL PROMISE")
            xsltReader.addEventListener("load", () => {
                print("ENTERED XSL LISTENER")
                xsltDoc = xsltReader.result
    
                xsltDoc = xsltParser.parseFromString(xsltDoc, "text/xml")
                xsltProcessor.importStylesheet(xsltDoc)
    
                const transformedXml = xsltProcessor.transformToDocument(xmlDoc)
    
                const outputElement = document.createElement("div")
    
                let _ = [moreFilesDiv, incorrectFormatDiv, ...choiceBtns].map((element) => element.remove())
                body.appendChild(outputElement)
    
                readyHtml = new XMLSerializer().serializeToString(transformedXml)
                xslResolve(readyHtml)
            })
            print("AFTER EVENT LISTENER")
            xsltReader.readAsBinaryString(xsltDoc)
        })
        await loadXSLPromise;
        print(`RETURN ${xmlDoc}`)
        resolve([readyHtml, xmlDoc, xsltDoc])
    })
}

            // let txt = xsl.getElementById("sort")
            // txt.setAttribute("select", head)

            // if (head === "id") txt.setAttribute("data-type", "number")
            // else txt.setAttribute("data-type", "text")

            // xsltProcessor.importStylesheet(xsl)
            // let trans = xsltProcessor.transformToDocument(xmlDoc)
            // let ready = new XMLSerializer().serializeToString(trans)
            // outputElement.innerHTML = ready
            

            // let txt = xml.getElementsByTagName("id")
            // for (let t of txt) {
            //     print(t.textContent)
            // }


function checkBothFiles(xmlDoc, xsltDoc) {
    if (xsltDoc !== undefined && xmlDoc !== undefined) {
        performTransformation(xmlDoc, xsltDoc)
    }
};

function generateError(element, errorMessage) {
    body.lastChild.remove()
    body.appendChild(element)
    element.textContent = errorMessage
    element.style.display = "block"
};

function importData(clickedBtn) {
    return new Promise((resolve) => {
        let input = document.createElement('input');
        input.type = 'file';
        input.accept = ".xml,.xsl"
        input.addEventListener("change", () => {
            let files = Array.from(input.files);
            let suffix = files[0].name.split(".")[1]
    
            if (files.length > 1) {
                generateError(moreFilesDiv, "Too many files chosen")
            }
            else if (files !== undefined) {
                if (clickedBtn.id !== suffix) {
                    generateError(incorrectFormatDiv, "Incorrect Format")
                }
                else if (suffix === "xml" || suffix === "xsl") {
                    xmlDoc = suffix === "xml" || suffix === "xsl" ? files[0] : xmlDoc
                    clickedBtn.style.backgroundColor = "green"
                    resolve(xmlDoc)
                }
            }
        })
        input.click();
    })
};

async function main() {
    let [xml, xsl] = await waitForBtns();
    let [readyHTML, xmlDoc, xslDoc] = await performTransformation(xml, xsl)
    // print(xmlDoc)
    // print(xslDoc)
};

main()