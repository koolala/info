import { html, LitElement } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js'

export class GenForm2PDF extends LitElement {
    static properties = {
        margin: { 
            type: Number 
        },
        value: { 
            type: Object
        },
        encryptPassword: { 
            type: String
        },
        dirtyText: {
            type: String
        }
    };
    
    static librarysLoaded = {
        html2pdf: false
    }

    
    constructor() {
        super();

        if (GenForm2PDF.ignoreConstructed) {
            this._ignore = true;
        }
        else {
            this.margin = 0;
            this.value = {
                contentLength: 0,
                content: ''
            };
            this.encryptPassword = null;
            this.dirtyText = '';
        }

    }

    connectedCallback() {
        
        if (GenForm2PDF.ignoreConstructed || this._ignore) return;
        super.connectedCallback();


        if (this.dirtyText != '' && this.dirtyText != this._dirtyText) {
            this._dirtyText = this.dirtyText;
            
            const args = {
                bubbles: true,
                cancelable: true,
                composed: true,
                // value coming from input change event. 
                detail: {                    
                },
            };

            const event = new CustomEvent('generate-pdf', args);
            this.dispatchEvent(event);
        }

    }

    // createRenderRoot() {        
    //     console.log("createRenderRoot");
    //     const root = super.createRenderRoot();
    //     return root;
    // }

    async firstUpdated() {
        
        if (GenForm2PDF.ignoreConstructed || this._ignore) return;

        console.log("firstUpdated");
        await new Promise((r) => setTimeout(r, 0));

        GenForm2PDF.loadCustomLibrarys();
        this.addEventListener('generate-pdf', this._generatePDF);

    }


    requestUpdate() {

        if (GenForm2PDF.ignoreConstructed || this._ignore) return;
        // console.log("requestUpdate");

        super.requestUpdate();
    }

    // shouldUpdate(changedProperties) {
    //     // Only update element if prop1 changed.
    //     return changedProperties.has('dirtyText');

    //     //if (changedProperties.size==0) return false;
    //     return this._processingPDF == false && this.dirtyText != '';
    //     //return true;
    // }

    // async willUpdate(changedProperties) {
    //     // only need to check changed properties for an expensive computation.
    //     //if (changedProperties.has('firstName') || changedProperties.has('lastName')) {
    //     //    this.sha = computeSHA(`${this.firstName} ${this.lastName}`);
    //     //}
    //     //if (changedProperties.has('firstName'))

    //     console.log("willUpdate");
    //     //changedProperties.has('dirtyText') && 
    //     if (this._processingPDF == true || this._processingPDF2 == true) {
    //         //this.value = '';
    //         return;
    //     }

    //     //await this._generatePDF();
    // }


    static loadCustomLibrarys() {

        if (window.html2pdf == null && GenForm2PDF.librarysLoaded.html2pdf == false) {
            GenForm2PDF.librarysLoaded.html2pdf = true;

            //const cdn = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js";
            //const cdn = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
            const cdn = "https://cdn.jsdelivr.net/gh/eKoopmans/html2pdf.js@0.10.3/dist/html2pdf.bundle.min.js";

            let scp = document.createElement("script");
            console.log("html2pdf.js loading from CDN: " + cdn);
            scp.onload = () => {
                // Now you can use html2pdf
                
                if (window.html2pdf == null && window.require != null) {
                    window.html2pdf = require("html2pdf");
                }

                if (window.html2pdf == null) {
                    console.error("html2pdf.js not loaded");
                    GenForm2PDF.librarysLoaded.html2pdf = true;
                } else {
                    console.log("html2pdf.js loaded successfully");
                }
            };
            scp.src = cdn;
            //document.body.appendChild(scp);
            document.body.append(scp);

        }
    }


    static downloadAsPDF(base64String) {
        //var base64String = document.getElementById("Base64StringTxtBox").value;

        if (base64String.startsWith("JVB")) {
            base64String = "data:application/pdf;base64," + base64String;
            GenForm2PDF.downloadFileObject(base64String);
        } else if (base64String.startsWith("data:application/pdf;base64")) {
            GenForm2PDF.downloadFileObject(base64String);
        } else if (base64String.startsWith("data:application/pdf;filename=generated.pdf;base64,JVB")) {
            GenForm2PDF.downloadFileObject(base64String);
        } else {
            //alert("Not a valid Base64 PDF string. Please check");
            console.error("Not a valid Base64 PDF string. Please check");
        }
    }


    static downloadFileObject(base64String) {
        const linkSource = base64String;
        const downloadLink = document.createElement("a");
        const fileName = "convertedPDFFile.pdf";
        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
    }

    async _generatePDF(e) {
        //await this.updateComplete;
        
        console.log("generatePDF");
        if (window.html2pdf == null) {
            console.error("html2pdf.js not loaded");
            return;
        }

        await this.updateComplete;
        GenForm2PDF.ignoreConstructed = true;

        let cloneElement = document.querySelector("div.nx-form.form"); //.cloneNode(true);

        //parseInt(this.margin) || 
        let opt = {
            margin: 0,
            //filename: 'my-file.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, 
                width: cloneElement.clientWidth || cloneElement.offsetWidth || 900,
                height: cloneElement.clientHeight || cloneElement.offsetHeight || 1200,
                ignoreElements: (el) => {
                    //console.log("ignoreElements", el);
                    //if (el.classList.contains('nx-form')) return true;
                    if (el == null) return false;
                    if (el.tagName?.toUpperCase() == elementName.toUpperCase()) return true; // ignore this element
                    if (el.classList.contains('infocan-gen-form2pdf')) return true; // ignore this element

                    if (el.classList.contains('d-print-none')) return true; // ignore elements with d-print-none class
                    if (el.classList.contains('nx-action-panel')) return true;
                    return false;
                } 
            },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
            //useCORS: true
        };

        cloneElement.querySelector("infocan-gen-form2pdf")?.remove();
        //let pdfData = await html2pdf().set(opt).from(cloneElement).outputPdf();
        let pdfData = await html2pdf().set(opt).from(cloneElement).outputPdf('datauristring');
        let pdfDataArrayBuffer = await html2pdf().set(opt).from(cloneElement).outputPdf('arraybuffer');
        
        //cloneElement.remove();
        cloneElement = null;

        //let pdf = await html2pdf().set(opt).from(element).outputPdf();
        GenForm2PDF.ignoreConstructed = false;

        console.log("PDF generated");
        
        //this.value = pdfData;
        //this.value = {
        //    contentLength: pdfData.length,
        //    content: pdfData
        //}

        this._handleChange({
            data: {
                contentLength: pdfData.length,
                content: pdfDataArrayBuffer
            }
        });

        //# 
        if (false) {
            GenForm2PDF.downloadAsPDF(pdfData);
        }

        return true;
    }
    

    _handleChange(e) {
        const args = {
            bubbles: true,
            cancelable: false,
            composed: true,
            // value coming from input change event. 
            detail: e.data,
        };

        const event = new CustomEvent('ntx-value-change', args);
        this.dispatchEvent(event);
    }

    static getMetaConfig() {
        return {
            controlName: 'Gen Form to PDF',
            fallbackDisableSubmit: true,
            version: '1.0',
            standardProperties: {
                readOnly: true,
                visibility: false,
                required: false,
                description: false,
                defaultValue: false,
                placeholder: false,
                toolTip: false,
                fieldLabel: false
            },
            properties: {
                value: {
                    type: 'object',
                    title: 'PDF File Base64',
                    isValueField: true,
                    properties: {
                        contentLength: {
                            type: 'integer',
                            title: 'Content-length',
                            minimum: 0
                        },
                        content: {
                            type: 'string',
                            format: 'byte',
                            //format: 'binary',
                            //format: 'x-ntx-file-reference',
                            title: 'Content',
                        }
                    }                    
                },
                margin: {
                    type: 'number',
                    title: 'PDF Margin',
                    minimum: 0,
                    maximum: 10,
                    defaultValue: 0
                },
                encryptPassword: {
                    type: 'string',
                    title: 'Encrypt PDF with Password',
                    description: 'If set, the PDF will be encrypted with this password.',
                    defaultValue: ''
                },
                dirtyText: {
                    type: 'string',
                    title: 'Dirty Text',
                    description: 'This field is used to trigger the PDF generation. Any change will trigger the PDF generation.',
                    defaultValue: ''
                }
            },
            events: [
                "generate-pdf"
            ]
        };
    }

    render() {
        return '';
        //return (this._ignore ? '' :
        //html`<p><textarea disabled=true style='width:100%;height:120px;'>${this.value}</textarea></p>`
        //);
    }
}

const elementName = 'infocan-gen-form2pdf';
customElements.define(elementName, GenForm2PDF);