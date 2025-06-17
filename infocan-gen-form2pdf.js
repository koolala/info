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
        },
        inputFileNamePrefix: {
            type: String
        },
        inputFileNameSubfix: {
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
                content: '',
                fileName: '',
            };
            this.encryptPassword = '';
            this.dirtyText = '';

            this.inputFileNamePrefix = '';
            this.inputFileNameSubfix = '';

            this._runStartTime = new Date();
        }

    }

    connectedCallback() {
        
        if (GenForm2PDF.ignoreConstructed || this._ignore) return;
        super.connectedCallback();

        if (this.dirtyText == '') return;

        //
        // if (this.dirtyText != '' && this.dirtyText != this._dirtyText) {
        //     this._dirtyText = this.dirtyText;
            
        // }
        
        //this._onRequestGeneratePDF({});

        // const args = {
        //     bubbles: true,
        //     cancelable: false,
        //     composed: true,
        //     // value coming from input change event. 
        //     detail: {},
        // };

        // const event = new CustomEvent('generate-pdf', args);
        // this.dispatchEvent(event);
        
        //this._generatePDF();
    }

    // createRenderRoot() {        
    //     console.log("createRenderRoot");
    //     const root = super.createRenderRoot();
    //     return root;
    // }


    async firstUpdated() {
        
        if (GenForm2PDF.ignoreConstructed || this._ignore) return;

        console.log("firstUpdated");
        //this._runStartTime = new Date();
        
        GenForm2PDF.loadCustomLibrarys();
        
        await new Promise((r) => setTimeout(r, 0));
        this.addEventListener('generate-pdf', this._generatePDF);

        let $btn_submit = document.querySelector('button[data-e2e="btn-submit"]');
        if ($btn_submit != null) {
            $btn_submit.removeEventListener('click', this._onRequestGeneratePDF.bind(this), true);
            $btn_submit.addEventListener('click', this._onRequestGeneratePDF.bind(this), true);
        }
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

    //# For external call.
    async _onRequestGeneratePDF(e) {

        if (e) {
            console.log(e);
            //# Magic code..
            if (e.detail == null || e.detail === 1) {
                //# Cancel original submit button event
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                e.returnValue = false;
            }
            else if (e.detail.rawOnly == true) {
                //# re-trigger from our custom submit button event.
                //# See at the end of this function.
                return true;
            }            
        }
        
        //this.dirtyText = new Date().toISOString();
        //await this.updateComplete;

        const args = {
            bubbles: true,
            cancelable: true,
            composed: true,
            // value coming from input change event. 
            detail: {},
        };

        const event = new CustomEvent('generate-pdf', args);
        this.dispatchEvent(event);
        
        //await this._generatePDF();

        // while (
        //     (event.detail == null ? '' : event.detail.content) !== (this.value == null ? '' : this.value.content)
        // ) {
        //     await new Promise(r => setTimeout(r, 10)); // Wait a short time
        // }

        //# Give more time for pdf generation.
        await new Promise((r) => setTimeout(r, 1000));
        //await this.updateComplete;


        //# Magic Code
        if (e && e.target && e.detail.rawOnly == null) {
            //# Run original
            let args = {
                bubbles: true,
                cancelable: false,
                composed: true,
                // value coming from input change event. 
                detail: { rawOnly: true },
            };

            let event = new CustomEvent('click', args);
            e.target.dispatchEvent(event);
        }        
        
        return false;
    }

    //# For this compoent.
    async _generatePDF(e) {
        //await this.updateComplete;
        
        console.log("generatePDF");
        if (window.html2pdf == null) {
            console.error("html2pdf.js not loaded");
            return;
        }

        //await this.updateComplete;
        GenForm2PDF.ignoreConstructed = true;

        let cloneElement = document.querySelector("ntx-form-runtime > #nx-form-container > div.nx-form.form"); //.cloneNode(true);

        let testDiv = this.shadowRoot.getElementById('testdiv');
        let dpiWidth = 96;
        let dpiHeight = 96;

        if (testDiv) {
            dpiWidth = testDiv.offsetWidth || 96;
            dpiHeight = testDiv.offsetHeight || 96;
        }

        //box-shadow: none !important;
        const $form = document.querySelector("div.nx-theme-form");
        let form_originalStyle = "";

        if ($form != null) {
            form_originalStyle = $form.getAttribute("style") || "";
            $form.setAttribute("style", form_originalStyle + ";box-shadow: none !important;background-image: none; margin:0 !important;");
        }

        const tempBodyStyle = document.body.getAttribute("style") || "";
        let cloneElementWidth = cloneElement.offsetWidth;
        let cloneElementHeight = cloneElement.offsetHeight;
        let cloneElementLeft = cloneElement.offsetLeft;
        let cloneElementTop = cloneElement.offsetTop;
        
        if (cloneElementWidth < 900) {
            document.body.setAttribute("style", tempBodyStyle + ";width: 1280px !important;");
            cloneElementWidth = cloneElement.offsetWidth;
            cloneElementHeight = cloneElement.offsetHeight;
            cloneElementLeft = cloneElement.offsetLeft;
            cloneElementTop = cloneElement.offsetTop;
            document.body.setAttribute("style", tempBodyStyle + "");
        }


        //parseInt(this.margin) || 
        let opt = {
            margin: 5,
            //filename: 'my-file.pdf',
            image: { type: 'jpeg', quality: 0.98, margin: 0 },
            //html2canvas: { scale: 2, dpi: this.paper.dpiHeight, logging: true, scrollX: 0, scrollY: -window.scrollY },
    
            html2canvas: { 
                //scale: 1,
                //scale: 600 / (cloneElementWidth),
                scale: 2,
                //dpi: dpiHeight,
                dpi: 150,
                //dpi: 150,
                //# If windowWidth < 900
                //x: (900 * 0.25) / 2,
                x: (1280 - 900) / 2 + 5,
                //y: -10,
                y: 0,
                //width: 900 * 0.75,
                width: cloneElementWidth,
                //height: cloneElementHeight * 0.75 + 20,
                height: cloneElementHeight + 20,
                windowWidth: 1280,
                //windowWidth: 900,
                //height: cloneElement.clientHeight || cloneElement.offsetHeight || 1200,
                margin: 0,
                logging: true, 
                scrollX: -window.scrollX, 
                scrollY: -window.scrollY,
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
            //format:[canvasSizeObj.width,canvasSizeObj.height]
            jsPDF: { 
                //unit: 'in', 
                //format: 'a4',
                //unit: 'in',
                format: [
                    //900 * 0.75, //cloneElementWidth,
                    cloneElementWidth,
                    //cloneElementHeight * ( 900 / cloneElementWidth) * 0.75 + 100
                    (cloneElementHeight + 50)
                ], 
                orientation: 'portrait',
                putOnlyUsedFonts: true, 
                precision: 1,
                unit: "px"
             },
            //useCORS: true
        };


        //cloneElement.querySelector("infocan-gen-form2pdf")?.remove();
        let pdfData = await html2pdf().set(opt).from(cloneElement).outputPdf().then(function(pdf) { return btoa(pdf); }, function() { return ''; }); 
        //let pdfData = await html2pdf().set(opt).from(cloneElement).outputPdf('blob'); //datauri
        //let pdfData = await html2pdf().set(opt).from(cloneElement).outputPdf('datauristring');
        //let pdfDataArrayBuffer = await html2pdf().set(opt).from(cloneElement).outputPdf('arraybuffer');
        
        //cloneElement.remove();
        //cloneElement = null;

        //let pdf = await html2pdf().set(opt).from(element).outputPdf();

        if ($form!=null) $form.setAttribute("style", form_originalStyle + "");

        console.log("PDF generated");
        
        let tempValue = {
            contentLength: pdfData.length,
            fileName: (this.inputFileNamePrefix || "") + "_" + (this.inputFileNameSubfix || "") + "_" + this._runStartTime.toISOString().replace(/[\-:.]/g, '') + ".pdf",
            content: pdfData,
        };

        console.log(tempValue);

        //this.value = tempValue;
        await this._handleChange({
            data: tempValue
        });

        GenForm2PDF.ignoreConstructed = false;
        //await this.updateComplete;

        //# 
        if (window.isDebugMode) {
            GenForm2PDF.downloadAsPDF(pdfData);
        }

        return true;
    }
    

    async _handleChange(e) {
        const args = {
            bubbles: true,
            cancelable: false,
            composed: true,
            // value coming from input change event. 
            detail: e.data,
        };

        const event = new CustomEvent('ntx-value-change', args);
        this.dispatchEvent(event);

        
        // while (
        //     (event.detail == null ? '' : event.detail.content) !== (this.value == null ? '' : this.value.content)            
        // ) {
        //     await new Promise(r => setTimeout(r, 10)); // Wait a short time
        // }

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
                    required: false,
                    properties: {
                        contentLength: {
                            type: 'integer',
                            title: 'Content-length',
                            minimum: 0
                        },
                        content: {
                            type: 'string',
                            //format: 'byte',
                            //format: 'binary',
                            //format: 'x-ntx-file-reference',
                            title: 'Content',
                            required: true
                        },
                        fileName: {
                            type: 'string',
                            title: 'Mapped File name',
                            description: 'Prefix_Subfix_ID_ISODate.pdf',
                            required: true
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
                inputFileNamePrefix:  {
                    type: 'string',
                    title: 'File prefix'
                },
                inputFileNameSubfix:  {
                    type: 'string',
                    title: 'File subfix'
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
        return html`<div id='testdiv' style='height: 1in; left: -100%; position: fixed; top: -100%; width: 1in;'></div>`;
    }
}

const elementName = 'infocan-gen-form2pdf';
customElements.define(elementName, GenForm2PDF);

if (window.isDebugMode) {
    window.GenForm2PDF = window.GenForm2PDF || GenForm2PDF;
}