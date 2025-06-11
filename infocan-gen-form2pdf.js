import { html, LitElement } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js'
//import { html2pdf } from 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';

export class GenForm2PDF extends LitElement {
    static properties = {
        margin: { type: String },
        pdfFileBase64: { type: String },
        encryptPassword: { type: String },
        dirtyText: {
            type: String, 
            hasChanged(newVal, oldVal) {
                //return newVal?.toLowerCase() !== oldVal?.toLowerCase();
                return newVal !== oldVal;
            }
        }
    };
    
    static librarysLoaded = {
        html2pdf: false
    }

    constructor() {
        super();

        this.margin = 0;
        this.pdfFileBase64 = '';
        this.encryptPassword = null;
        this.dirtyText = '';
        this._processingPDF = false;

    }

    connectedCallback() {
        super.connectedCallback();

        console.log("connectedCallback");
    }

    createRenderRoot() {
        const root = super.createRenderRoot();

        console.log("createRenderRoot");
        GenForm2PDF.loadCustomLibrarys();

        return root;
    }

    firstUpdated() {
        console.log("firstUpdated");
    }

    requestUpdate() {
        console.log("requestUpdate");

        //this.pdfFileBase64 == '' && 
        if (this._processingPDF == false) {
            this._processingPDF = true;
            this._generatePDF();
            this._processingPDF = false;
        }
    }

    shouldUpdate(changedProperties) {
        // Only update element if prop1 changed.
        return changedProperties.has('dirtyText');
    }

    willUpdate(changedProperties) {
        // only need to check changed properties for an expensive computation.
        //if (changedProperties.has('firstName') || changedProperties.has('lastName')) {
        //    this.sha = computeSHA(`${this.firstName} ${this.lastName}`);
        //}
        //if (changedProperties.has('firstName'))

        console.log("willUpdate");

        if (changedProperties.has('dirtyText')) {
            this.pdfFileBase64 = '';
        }
    }


    static loadCustomLibrarys() {
        if (window.html2pdf == null && GenForm2PDF.librarysLoaded.html2pdf == false) {
            GenForm2PDF.librarysLoaded.html2pdf = true;

            //const cdn = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
            const cdn = "https://cdn.jsdelivr.net/gh/eKoopmans/html2pdf.js@0.10.3/dist/html2pdf.bundle.min.js";

            var scp = document.createElement("script");
            console.log("html2pdf.js loading from CDN: " + cdn);
            scp.onload = () => {
                // Now you can use html2pdf
                
                if (window.html2pdf == null && require != null) {
                    window.html2pdf = require("html2pdf");
                }

                if (window.html2pdf == null) {
                    console.error("html2pdf.js not loaded");
                } else {
                    console.log("html2pdf.js loaded successfully");
                }
            };
            scp.src = cdn;
            document.body.appendChild(scp);

        }
    }

    async _generatePDF() {
        const element = document.querySelector("div.nx-form.form");

        console.log("generatePDF");
        if (window.html2pdf == null || element == null) {
            console.error("html2pdf.js not loaded or element not found");
                
            this._handleChange({
                data: ""
            });
            return;
        }

        var opt = {
            margin: this.margin,
            //filename:     'myfile.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };


        //# Test Mode
        //html2pdf().set(opt).from(element).save('my-pdf.pdf');
        var pdf = await html2pdf().set(opt).from(element).outputPdf();

        // This logs the right base64
        //console.log(btoa(pdf));
        const pdfData = btoa(pdf);
        this.pdfFileBase64 = pdfData;

        console.log("PDF generated");

        this._handleChange({
            data: pdfData
        });
    }


    _handleChange(e) {
        const args = {
            bubbles: true,
            cancelable: false,
            composed: true,
            // value coming from input change event. 
            pdfFileBase64: e.data,
        };

        const event = new CustomEvent('ntx-value-change', args);
        this.dispatchEvent(event);

    }

    static getMetaConfig() {
        return {
            controlName: 'Gen Form to PDF',
            fallbackDisableSubmit: true,
            version: '1.0',
            properties: {
                pdfFileBase64: {
                    type: 'string',
                    title: 'PDF File Base64',
                    isValueField: true
                    //,
                    //required: true
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
            }
        };
    }

    render() {
        return html`<p>...</p>`;
    }
}

const elementName = 'infocan-gen-form2pdf';
customElements.define(elementName, GenForm2PDF);