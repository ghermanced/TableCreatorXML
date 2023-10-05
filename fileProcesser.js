const tableHeadings = ["id", "firstName", "lastName", "email", "phone"]
const choiceBtns = $(document).find(".choice")
const body = $(document.body)
const moreFilesDiv = $(document).find(".too-many-files")
const incorrectFormatDiv = $(document).find(".incorrect-format")

const xsltProcessor = new XSLTProcessor()
const xmlReader = new FileReader()
const xsltReader = new FileReader()
const parser = new DOMParser()

const print = console.log


async function waitForBtns() {
    const files = [];
  
    for (const btn of choiceBtns) {
        files.push(await new Promise(async (btnResolve) => {
            $(btn).on("click", async () => {
                const file = await importData(btn);
                btnResolve(file);
            });
        }));
    }
  
    return files;
}

async function performTransformation(xmlDoc, xsltDoc) {
    
    return new Promise(async (resolve) => {
        let readyHtml;

        const loadXMLPromise = new Promise(async (xmlResolve) => {
            xmlReader.addEventListener("load", () => {
                
                xmlDoc = xmlReader.result
                xmlDoc = $.parseXML(xmlDoc)
                xmlResolve(xmlDoc)
            })
            xmlReader.readAsBinaryString(xmlDoc)
        })

        await loadXMLPromise;
        const loadXSLPromise = new Promise(async (xslResolve) => {

            xsltReader.addEventListener("load", () => {
    
                xsltDoc = xsltReader.result
    
                xsltDoc = $.parseXML(xsltDoc)
                xsltProcessor.importStylesheet(xsltDoc)
    
                const transformedXml = xsltProcessor.transformToDocument(xmlDoc)

                const outputElement = $("<div>")
    
                let _ = [moreFilesDiv, incorrectFormatDiv, ...choiceBtns].map((element) => element.remove())
                $("body").append(outputElement)
    
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
    $(document.body).children().last().remove();
    $(document.body).append(element);
    element.text(errorMessage);
    element.css("display", "block");
};

function importData(clickedBtn) {
    return new Promise((resolve) => {
        let fileDoc
        let input = $("<input>")
        input.attr({
            "type": "file",
            "accept": ".xml,.xsl"
        })

        input.on("change", () => {
            let files = Array.from(input[0].files);
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
        input.trigger("click");
    })
};

function updateTable(outputElement, xmlDoc, xslDoc, asceding=true){ 
    let sortXSL = $(xslDoc).find("#sort")

    xsltProcessor.importStylesheet(xslDoc)
    let updatedDOM = xsltProcessor.transformToDocument(xmlDoc)

    $(document.body).children().last().remove()
    outputElement.html(new XMLSerializer().serializeToString(updatedDOM))

    $(document.body).append(outputElement)

    outputElement.find("th").click((e) => {
        let th = $(e.currentTarget)
        let dataType
        if (th.attr("id") == "id") {
            dataType = "number"
        } else dataType = "string"

        sortXSL.attr({
            "select": th.attr("id"),
            "data-type": dataType,
            "order": asceding ? "ascending" : "descending",
        })
        updateTable(outputElement, xmlDoc, xslDoc, !asceding)
    })

}

async function main() {
    let [xml, xsl] = await waitForBtns();
    let [readyHTML, xmlDoc, xslDoc] = await performTransformation(xml, xsl)

    
    const newDoc = parser.parseFromString(readyHTML, "text/html")
    const outputElement = $("<div></div>")
    
    outputElement.html(new XMLSerializer().serializeToString(newDoc))

    updateTable(outputElement, xmlDoc, xslDoc)
};

main()