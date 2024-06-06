"use client"

import { useRef } from 'react';

function PDFViewer({id}) {
    const iframeRef = useRef(null);

    // Function to handle interactions with the PDF
    const handlePDFInteraction = () => {
        // Accessing the contentDocument of the iframe
        const iframe = iframeRef.current;
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;

        // Example interaction: Scroll to a specific page
        const pageNumber = 3; // Change this to the desired page number
        iframeDocument.querySelector(`[data-page-number="${pageNumber}"]`).scrollIntoView();
    };

    return (
        <div className="h-screen">
            <button onClick={handlePDFInteraction}>Scroll to Page 3</button>
            <iframe
                ref={iframeRef}
                src={"/ley/" + id + "/pdf/"+id+".pdf"}
                width="100%"
                height="100%"
                title="PDF Viewer"
            />
        </div>
    );
}

function PDFViewer0({id}) {
    return <iframe
        src={"/ley/" + id + ".pdf"}
        width="100%"
        height="100%"
        allowFullScreen
    />
}

export default function Law({params}) {
    return <div className="h-screen">
        <PDFViewer0 id={params.id}/>
    </div>
}

/*"use client"

import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

import { Document, Page } from 'react-pdf';

const PDFViewer = ({src}) => {
    return <Document file={src}>
        <Page pageNumber={1} />
    </Document>
};

export default function Law({params}){
    return <PDFViewer src={"/ley/"+params.id+".pdf"}/>
}*/