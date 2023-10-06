const tableHeadings = ["id", "firstName", "lastName", "email", "phone"]
const choiceBtns = $(document).find(".choice")
const body = $(document.body)
const moreFilesDiv = $(document).find(".too-many-files")
const incorrectFormatDiv = $(document).find(".incorrect-format")

const filterInput = $("<input>")
const findBtn = $("<button>")
const findWrapper = $("<div>")
const addButton = $(document).find("#add-btn")
const userForm = $(document).find("#user-form")

const prevBtn = $("<button>")
const nextBtn = $("<button>")
const currentPageWrapper = $("<span>")

var currentPage = 1

prevBtn.html("Previous")
nextBtn.html("Next")
body.prepend(findWrapper)
findWrapper.attr("style", "display:none;margin-bottom: 10px")
findWrapper.append(filterInput, findBtn)

nextBtn.on("click", () => {
    print("hello")
})

prevBtn.on("click", () => {
    --currentPage
})

nextBtn.on("click", () => {
    ++currentPage
    print(currentPage)
})


const userInfo = $("<p>")

class SelectedUser {
    constructor(id, firstName, lastName, email, phone) {
        this.id = id
        this.name = [lastName, firstName].join(" ")
        this.email = email
        this.phone = phone
    }
    getInfo() {
        return `ID: ${this.id} -- Name: ${this.name} -- Email: ${this.email} -- Phone: ${this.phone}`
    }
}

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

function pagination() {

}

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

    outputElement.find("tr").click((e) => {
        let info = e.currentTarget.textContent.split("\n").filter(value => value != '')
        let newUser = new SelectedUser(...info)
        userInfo.text(newUser.getInfo())
        body.append(userInfo)
        newUser = null
    })

    $(document).find(".input-user").attr("style", "display: block;")

    addButton.attr("style", "display: inline")
    
    if (addButton.attr("listener") !== "true"){
        addButton.on("click", (e) => {
            e.preventDefault()
            addButton.attr("listener", "true")
            const newRecord = {}
            let data = $("form").serializeArray()
            print(data)
            data.forEach(item => {
                newRecord[item.name] = item.value
            })
            $(xmlDoc).find("root").prepend(createXMLElement(newRecord))
            updateTable(outputElement, xmlDoc, xslDoc)
        })
    }

    
    
    let elementsPerPage = 10
    let rowsInTable = $(outputElement).find("tr")
    let totalRows = rowsInTable.length
    let totalPages = Math.ceil(totalRows / elementsPerPage)
    let header = rowsInTable[0]


    let startIndex = (currentPage - 1) * elementsPerPage
    let endIndex = currentPage * elementsPerPage

    $(outputElement).append(prevBtn)
    $(outputElement).append(currentPageWrapper.html(currentPage))
    $(outputElement).append(nextBtn)

    print("Current page: "+ currentPage)
    print("Total pages: "+ totalPages)
    if (currentPage == 1) {
        prevBtn.attr("disabled", true)
    }
    else if (currentPage == totalPages) {
        print(currentPage)
        print(totalPages)
        nextBtn.attr("disabled", true)
    }
    else {
        nextBtn.attr("disabled", false)
        prevBtn.attr("disabled", false)
    }

    prevBtn.on("click", () => {
        --currentPage
        updateTable(outputElement, xmlDoc, xslDoc)
    })
    
    nextBtn.on("click", () => {
        ++currentPage
        updateTable(outputElement, xmlDoc, xslDoc)
    })
    

    for (let i=1; i<totalRows;i++){
        if(i < startIndex || i > endIndex){
            $(outputElement).find(rowsInTable[i]).hide()
        }
    }


    filterData(outputElement, xmlDoc, xslDoc)
}

function createXMLElement(record) {
    let currentString = "<element>"
    for (const [key, val] of Object.entries(record)) {
        currentString += `<${key}>${val}</${key}>`
    }
    return currentString += "</element>"
}

function filterData(outputElement, xmlDoc, xslDoc) {
    findWrapper.attr("style", "display:block;margin-bottom:10px")

    filterInput.attr({
        "placeholder": "Find",
        "style": "display:inline"
    })

    findBtn.attr("style", "display:inline")
    findBtn.text("Find")

    findBtn.on("click", () => {
        let checkedVal = filterInput.val()
        if (checkedVal.trim() === "") {
            $(xslDoc).find("#filter").attr("test", "id")
        }
        $(xslDoc).find("#filter").attr("test", `descendant::*[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${checkedVal}')]`)

        updateTable(outputElement, xmlDoc, xslDoc)
    })
}

async function main() {
    let [xml, xsl] = await waitForBtns();
    let [readyHTML, xmlDoc, xslDoc] = await performTransformation(xml, xsl)

    const newDoc = parser.parseFromString(readyHTML, "text/html")
    const outputElement = $("<div></div>")
    const addButton = $(document).find(".add-btn")
    
    
    outputElement.html(new XMLSerializer().serializeToString(newDoc))
    
    prevBtn.on("click", () => {
        --currentPage
    })
    
    nextBtn.on("click", () => {
        ++currentPage
        print(currentPage)
    })
    

    $(outputElement).append(prevBtn)
    $(outputElement).append(currentPageWrapper.html(currentPage))
    $(outputElement).append(nextBtn)
    
    updateTable(outputElement, xmlDoc, xslDoc)
};

main()