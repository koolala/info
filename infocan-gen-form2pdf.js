import { html, LitElement } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js'
// import $ from 'https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js';
// import jsPDF from 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
//import html2canvas from 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.min.js';
//import html2pdf from 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';

import { html2pdf } from 'https://github.com/eKoopmans/html2pdf.js/blob/main/dist/html2pdf.bundle.min.js';


export class GenForm2PDF extends LitElement {
    static properties = {
        margin: { type: String },
        pdfFileBase64: { type: String },
        encryptPassword: { type: String }
    };

    constructor() {
        super();
        this.margin = 0;
        this.pdfFileBase64 = '';
        this.encryptPassword = null;
    }

    generatePDF() {
        const element = $("div.nx-form.form");
        var _self = this;

        var opt = {
                margin: _self.margin,
                //filename:     'myfile.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2 },
                jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

	    //# Test Mode
        //html2pdf().set(opt).from(element[0]).save('my-pdf.pdf');


        html2pdf().set(opt).from(element[0]).outputPdf().then(function(pdf) {
            // This logs the right base64
            //console.log(btoa(pdf));
            _self.pdfFileBase64 = btoa(pdf);
        });
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
                    isValueField: true,
                    required: true
                },
                margin: {
                    type: 'number',
                    title: 'PDF Margin',
                    minimum: 0,
                    maximum: 10,
                    defaultValue: 0,
                },
                encryptPassword: {
                    type: 'string',
                    title: 'Encrypt PDF with Password',
                    description: 'If set, the PDF will be encrypted with this password.',
                    defaultValue: '',
                }
            }
        };
    }

    render() {
        return html`<p><p/>`;
    }
}

const elementName = 'infocan-gen-form2pdf';
customElements.define(elementName, GenForm2PDF);