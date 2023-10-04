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
const parser = new DOMParser()

const print = console.log


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
                xmlDoc = parser.parseFromString(xmlDoc, "text/xml")
                xmlResolve(xmlDoc)
            })
            xmlReader.readAsBinaryString(xmlDoc)
        })

        await loadXMLPromise;
        const loadXSLPromise = new Promise(async (xslResolve) => {

            xsltReader.addEventListener("load", () => {
    
                xsltDoc = xsltReader.result
    
                xsltDoc = parser.parseFromString(xsltDoc, "text/xml")
                xsltProcessor.importStylesheet(xsltDoc)
    
                const transformedXml = xsltProcessor.transformToDocument(xmlDoc)

                const outputElement = document.createElement("div")
    
                let _ = [moreFilesDiv, incorrectFormatDiv, ...choiceBtns].map((element) => element.remove())
                body.appendChild(outputElement)
    
                readyHtml = new XMLSerializer().serializeToString(transformedXml)
                xslResolve(readyHtml)
            })

            xsltReader.readAsBinaryString(xsltDoc)
        })
        await loadXSLPromise;
        resolve([readyHtml, xmlDoc, xsltDoc])
    })
}


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
        let fileDoc
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
                    fileDoc = suffix === "xml" || suffix === "xsl" ? files[0] : fileDoc
                    clickedBtn.style.backgroundColor = "green"
                    resolve(fileDoc)
                }
            }
        })
        input.click();
    })
};

function updateTable(outputElement, xmlDoc, xslDoc, asceding=true){
    let sortXSL = xslDoc.getElementById("sort")
    
    xsltProcessor.importStylesheet(xslDoc)
    let updatedDOM = xsltProcessor.transformToDocument(xmlDoc)

    body.lastChild.remove()
    outputElement.innerHTML = new XMLSerializer().serializeToString(updatedDOM)

    body.appendChild(outputElement)
    for (let th of outputElement.getElementsByTagName("th")) {
        th.addEventListener("click", () => {
            sortXSL.setAttribute("select", th.id)
            if (th.id == "id") {
                sortXSL.setAttribute("data-type", "number")
            } else sortXSL.setAttribute("data-type", "string")

            sortXSL.setAttribute("order", asceding ? "asceding" : "descending")
            updateTable(outputElement, xmlDoc, xslDoc, !asceding)
        })
    }

}

async function main() {
    let [xml, xsl] = await waitForBtns();
    let [readyHTML, xmlDoc, xslDoc] = await performTransformation(xml, xsl)

    
    const newDoc = parser.parseFromString(readyHTML, "text/html")
    const outputElement = document.createElement("div")
    
    outputElement.innerHTML = new XMLSerializer().serializeToString(newDoc)

    updateTable(outputElement, xmlDoc, xslDoc)
};

main()