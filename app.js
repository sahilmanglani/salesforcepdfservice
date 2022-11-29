const express = require('express');
const fs = require('fs');
const app = express();
const bodyParser = require('body-parser');
const jsforce = require('jsforce');


const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/', (req, res) => {
    const sfCred = req.body;
    const conn = new jsforce.Connection({
        instanceUrl: sfCred.InstanceUrl,
        accessToken: sfCred.AccessToken
    });
    //let records = [];
    let query = `Select AccountId , Name, MailingStreet, MailingCity, MailingCountry,  Email, Birthdate FROM Contact where AccountId = '${sfCred.recordId}'`;
    conn.query(query, function (err, result) {
        if (err) { return console.error(err); }
        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument;
        if (result.records.length > 0) {
            createGridinPdf(doc, result.records);
            doc.end();
            doc.pipe(fs.createWriteStream('attachment.pdf'));
            const pdfData = fs.readFileSync('./attachment.pdf').toString('base64');
            conn.sobject('Attachment').create({
                ParentId: sfCred.recordId,
                Name: 'Attachment.pdf', // <= Turns out the name has to have .pdf
                Body: pdfData,
                ContentType: 'application/pdf',
                Description: 'Related Record Id PDF',
            });
            res.send('Pdf Created : attachment.pdf');
        }
        else {
            res.send('No Records Found for this record Id');
        }

    });
})

createGridinPdf = (doc, data) => {
    let i;
    const tableTop = 50;
    doc.font("Helvetica-Bold");
    generateTableRow(doc, tableTop, "Name", "MailingStreet", "MailingCity", "MailingCountry", "Email", "Birthdate")
    generateHr(doc, tableTop + 20);
    doc.font("Helvetica");
    for (i = 0; i < data.length; i++) {
        const item = data[i];
        const position = tableTop + (i + 1) * 30;
        generateTableRow(
            doc,
            position,
            item.Name,
            item.MailingStreet,
            item.MailingCity,
            item.MailingCountry,
            item.Email,
            item.Birthdate
        );

        generateHr(doc, position + 50);
    }

}

generateTableRow = (doc, y, Name, MailingStreet, MailingCity, MailingCountry, Email, Birthdate) => {
    doc
        .fontSize(10)
        .text(Name, 50, y)
        .text(MailingStreet, 150, y)
        .text(MailingCountry, 250, y)
        .text(MailingCity, 350, y)
        .text(Email, 450, y)
        .text(Birthdate, 550, y)
}

generateHr = (doc, y) => {
    doc
        .strokeColor("#aaaaaa")
        .lineWidth(1)
        .moveTo(50, y)
        .lineTo(750, y)
        .stroke();
}

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});
