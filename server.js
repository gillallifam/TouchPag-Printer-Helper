const printer = require('./lib/printer');
var express = require('express');
var removeAccents = require("remove-accents")
var app = express();
app.use(express.json())
var strOrig = '[{"id":61,"name":"PIZZA","value":22.55,"fileName":"pedipag_product_61.jpeg","quantity":29,"subcategory":{"id":23,"description":"Pizza","category":{"id":6,"description":"Lanches"}}},{"id":62,"name":"SUCO DE LARANJA","value":4.97,"fileName":"pedipag_product_62.jpeg","quantity":44,"subcategory":{"id":4,"description":"Sucos","category":{"id":1,"description":"Bebidas"}}},{"id":63,"name":"SUCO DE LIMÃO","value":5.04,"fileName":"pedipag_product_63.jpeg","quantity":47,"subcategory":{"id":4,"description":"Sucos","category":{"id":1,"description":"Bebidas"}}},{"id":64,"name":"SUCO DE MARACUJÁ","value":5.06,"fileName":"pedipag_product_64.jpeg","quantity":47,"subcategory":{"id":4,"description":"Sucos","category":{"id":1,"description":"Bebidas"}}},{"id":66,"name":"VITAMINA DE MAMÃO","value":5.07,"fileName":"pedipag_product_66.jpeg","quantity":47,"subcategory":{"id":33,"description":"Vitaminas","category":{"id":1,"description":"Bebidas"}}},{"id":72,"name":"INGRESSO ROCK IN RIO","value":750.09,"fileName":"pedipag_product_72.jpeg","quantity":8,"subcategory":{"id":26,"description":"Show","category":{"id":7,"description":"Ingressos"}}},{"id":90,"name":"GATORADE MORANGO","value":6.58,"fileName":"pedipag_product_90.webp","quantity":40,"subcategory":{"id":17,"description":"Diversos","category":{"id":1,"description":"Bebidas"}}},{"id":152,"name":"REI LEÃO","value":25.6,"fileName":"pedipag_product_152.jpg","quantity":43,"subcategory":{"id":27,"description":"Cinema","category":{"id":7,"description":"Ingressos"}}},{"id":155,"name":"CHEDDAR MCMELT","value":15.24,"fileName":"pedipag_product_155.jpeg","quantity":1,"subcategory":{"id":35,"description":"Lanches e Bebidas","category":{"id":8,"description":"Combos"}}},{"id":168,"name":"CHEDDAR TENTADOR","value":15.18,"fileName":"pedipag_product_168.jpg","quantity":41,"subcategory":{"id":35,"description":"Lanches e Bebidas","category":{"id":8,"description":"Combos"}}},{"id":175,"name":"BOLINHO DE BACALHAU","value":14.53,"fileName":"pedipag_product_175.jpg","quantity":41,"subcategory":{"id":20,"description":"Tira Gostos","category":{"id":5,"description":"Petiscos"}}},{"id":193,"name":"COXINHA","value":4.56,"fileName":"pedipag_product_193.jpg","quantity":48,"subcategory":{"id":19,"description":"Salgadinhos","category":{"id":2,"description":"Snacks"}}},{"id":198,"name":"IMPÉRIO","value":8.22,"fileName":"pedipag_product_198.webp","quantity":42,"subcategory":{"id":3,"description":"Cervejas","category":{"id":1,"description":"Bebidas"}}},{"id":199,"name":"BUDWEISER","value":9.02,"fileName":"pedipag_product_199.webp","quantity":44,"subcategory":{"id":3,"description":"Cervejas","category":{"id":1,"description":"Bebidas"}}},{"id":201,"name":"ITAIPAVA","value":7.14,"fileName":"pedipag_product_201.webp","quantity":45,"subcategory":{"id":3,"description":"Cervejas","category":{"id":1,"description":"Bebidas"}}},{"id":202,"name":"CORONA EXTRA","value":8.57,"fileName":"pedipag_product_202.webp","quantity":45,"subcategory":{"id":3,"description":"Cervejas","category":{"id":1,"description":"Bebidas"}}},{"id":203,"name":"HEINEKEN","value":9.52,"fileName":"pedipag_product_203.jpg","quantity":47,"subcategory":{"id":1081,"description":"Cervejas","category":{"id":39,"description":"Bebidas"}}},{"id":204,"name":"MOJITO DE MORANGO ","value":8.15,"fileName":"pedipag_product_204.jpg","quantity":50,"subcategory":{"id":30,"description":"Drinks","category":{"id":1,"description":"Bebidas"}}},{"id":205,"name":"MOSCOW MULE ","value":12.22,"fileName":"pedipag_product_205.jpeg","quantity":50,"subcategory":{"id":30,"description":"Drinks","category":{"id":1,"description":"Bebidas"}}},{"id":206,"name":"MARGARITA","value":14.65,"fileName":"pedipag_product_206.png","quantity":50,"subcategory":{"id":30,"description":"Drinks","category":{"id":1,"description":"Bebidas"}}},{"id":207,"name":"BALDE DE STELLA","value":50.68,"fileName":"pedipag_product_207.png","quantity":43,"subcategory":{"id":3,"description":"Cervejas","category":{"id":1,"description":"Bebidas"}}}]'
var stmp = strOrig.replace(/{/g, '');
stmp = stmp.replace(/}/g, '');
stmp = stmp.replace(/:/g, ',');
stmp = stmp.split(',').join(" ")
var strcompressed = strOrig
var counts = wordFrequency(stmp)
var sortedWords = Object.keys(counts).sort((a, b) => { return b.length - a.length })
var pos = 0
var dict = {}
var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
console.time("comp")
for (const k of sortedWords) {
    if (counts[k] > 3 && k.length > 2) {
        dict[k] = '§' + chars.charAt(pos)
        strcompressed = strcompressed.split(k).join('§' + chars.charAt(pos))
        pos++
    }
}
console.timeEnd("comp")

console.log(dict, Object.keys(dict).length);
console.log(strcompressed);
var uncompressed = strcompressed
console.time("uncomp")
for (const [key, value] of Object.entries(dict)) {
    uncompressed = uncompressed.split(value).join(key)
    //console.log(key, value);
}
console.timeEnd("uncomp")
console.log("UNNNN");
console.log(uncompressed);
var F_CUT = new Buffer.from([0x1d, 0x56, 0x00]) // Full cut paper  
var endString = "\n\n\n\n\n\n"

function publishPrinters() {
    for (const prt of printer.getPrinters()) {
        if (prt.options["printer-is-accepting-jobs"]) {
            console.log(prt.name);
            app.post('/printer/' + prt.name, async function (req, res) {
                //res.send("{status:success}") 
                let rst = await printTask(prt.name, req.body)
                console.log("Ticket " + req.body.name + " printed!");
                //console.log("Print result: ", rst, req.body.name);
                res.send({ status: rst });
            });
        }
    }
    //console.log(app._router.stack);  
}

function wordFrequency(string) {

    /* Below is a regular expression that finds alphanumeric characters
       Next is a string that could easily be replaced with a reference to a form control
       Lastly, we have an array that will hold any words matching our pattern */
    var pattern = /\w+/g,
        matchedWords = string.match(pattern);

    /* The Array.prototype.reduce method assists us in producing a single value from an
       array. In this case, we're going to use it to output an object with results. */
    var counts = matchedWords.reduce(function (stats, word) {

        /* `stats` is the object that we'll be building up over time.
           `word` is each individual entry in the `matchedWords` array */
        if (stats[word]) {
            /* `stats` already has an entry for the current `word`.
               As a result, let's increment the count for that `word`. */
            stats[word] = stats[word] + 1;
        } else {
            /* `stats` does not yet have an entry for the current `word`.
               As a result, let's add a new entry, and set count to 1. */
            stats[word] = 1;
        }

        /* Because we are building up `stats` over numerous iterations,
           we need to return it for the next pass to modify it. */
        return stats;

    }, {});

    return counts

}

publishPrinters()

async function printTask(prtName, task) {
    if (task.items) {
        let items = task.items
        let str = ""
        let status = "error"
        str += pcmd.TXT_ALIGN_CT + pcmd.TXT_NORMAL + new Date().toISOString().
            replace(/T/, ' ').
            replace(/\..+/, '') + "\n\n"
        str += "Pedido em producao\n\n"
        str += pcmd.TXT_4SQUARE
        str += task.name.toUpperCase() + "\n\n"
        str += pcmd.TXT_BOLD_ON + 101 + pcmd.TXT_BOLD_OFF + "\n\n"
        str += pcmd.TXT_ALIGN_LT + pcmd.TXT_2HEIGHT + pcmd.TXT_2WIDTH
        for (let i = 0; i < items.length; i++) {
            str += items[i].qnt + "\t" + items[i].name + "\n"
        }

        result = await new Promise(r1 => {
            printer.printDirect({
                data: removeAccents(str) + endString + F_CUT,
                type: 'RAW',
                printer: prtName,
                success: async function (jobID) {
                    let maxTime = 30000
                    let interval = 250
                    status = await new Promise(r2 => {
                        let inter = setInterval(() => {
                            let j = printer.getJob(prtName, jobID);
                            if (j.status == "PRINTED") {
                                clearInterval(inter)
                                clearTimeout(timer)
                                r2("success")
                            }
                        }, interval);
                        let timer = setTimeout(() => {
                            console.log("Timeout on printing in: " + task.name);
                            clearInterval(inter)
                            printer.setJob(prtName, jobID, "CANCEL")
                            r2("fail")
                        }, maxTime);
                    });
                    r1(status)
                }, error: function (err) {
                    console.log("Error on printing: ", err);
                    status = "error"
                }
            })
        });
        return result
    } else {
        return "notitems"
    }
}

function printJSON(tsk) {
    //console.log(tsk);
    let task = JSON.parse(tsk)
    let items = task.items
    let str = task.name + "\n"
    for (let i = 0; i < items.length; i++) {
        str += items[i].age + "\t" + items[i].name + "\n"
    }

    printer.printDirect({
        data: str + "\n\n\n\n\n\n" + F_CUT,
        type: 'RAW',
        success: function (jobID) {
            console.log("sent to printer with ID: " + jobID);
        }
        , error: function (err) { console.log(err); }
    });
}

app.get('/', function (req, res) {
    res.send('TPS');//TouchPag printer server
});

app.get('/listprinters', function (req, res) {
    let printers = []
    for (const prt of printer.getPrinters()) {
        if (prt.options["printer-is-accepting-jobs"]) {
            p = { name: prt.name, status: prt.options["printer-is-accepting-jobs"] }
            printers.push(p)
        }
    }
    //console.log(printers);
    res.send(printers);
});

app.post('/printString/', function (req, res) {
    console.log("POST-printString", req.body.str);
    printString(req.body.str)
    res.send("success");
})

app.post('/printJSON/', function (req, res) {
    console.log("POST-printJSON", req.body.str);
    res.send("success");
})

function table(data) {
    let cellWidth = 5;
    let str = "" + pcmd.TXT_ALIGN_LT
    for (var i = 0; i < data.length; i++) {
        str += data[i].toString();
        var spaces = cellWidth - data[i].toString().length;
        for (var j = 0; j < spaces; j++) {
            str += new Buffer.from(" ");
        }
    }
    printer.printDirect({
        data: str + "\n\n\n\n\n\n" + F_CUT,
        type: 'RAW',
        success: function (jobID) {
            console.log("sent to printer with ID: " + jobID);
        }
        , error: function (err) { console.log(err); }
    });
}

//table(["One", "Two", "Three"]);
//table(["Um", "Dois", "Tres"]);
/* printer.tableCustom([                                       // Prints table with custom settings (text, align, width, cols, bold)
    { text:"Left", align:"LEFT", width:0.5 },
    { text:"Center", align:"CENTER", width:0.25, bold:true },
    { text:"Right", align:"RIGHT", cols:8 }
  ]); */

function printString(str) {
    printer.printDirect({
        data: str + "\n\n\n\n\n\n" + F_CUT,
        type: 'RAW',
        success: function (jobID) {
            console.log("sent to printer with ID: " + jobID);
        }
        , error: function (err) { console.log(err); }
    });
}

/* app.get('/testfile', function (req, res) {
    printer.printFile({
        filename: "tst.txt",
        success: function (jobID) {
            console.log("sent to printer with ID: " + jobID);
        },
        error: function (err) {
            console.log(err);
        }
    });
    res.send("See printer");
}); */
app.get('/test', function (req, res) {
    var numeroPedido = 101
    var tstString = `${pcmd.CHARCODE_LATINA}
    ${pcmd.TXT_2HEIGHT}PEDIDO DE PRODUCAO\n
    ${pcmd.TXT_4SQUARE}${pcmd.TXT_ALIGN_CT} 
    COZINHA\n    
    ${pcmd.TXT_4SQUARE}
    ${pcmd.TXT_BOLD_ON}${numeroPedido}${pcmd.TXT_BOLD_OFF}\n\n
    ${pcmd.TXT_2HEIGHT}${pcmd.TXT_ALIGN_LT}
    1\t TAPIOCA GRANDE\n
    2\t CAFE COM LEITE\n
`
    printString(tstString)
    res.send("See printer");
});
const port = 3536
app.listen(port, function () {
    console.log('Server listening on port ' + port + '!');
    console.log("-----------------------------");
});



var pcmd = {
    // Feed control sequences
    CTL_LF: new Buffer.from([0x0a]),              // Print and line feed
    CTL_FF: new Buffer.from([0x0c]),              // Form feed
    CTL_CR: new Buffer.from([0x0d]),              // Carriage return
    CTL_HT: new Buffer.from([0x09]),              // Horizontal tab
    CTL_SET_HT: new Buffer.from([0x1b, 0x44]),          // Set horizontal tab positions
    CTL_VT: new Buffer.from([0x1b, 0x64, 0x04]),      // Vertical tab

    // Printer hardware
    HW_INIT: new Buffer.from([0x1b, 0x40]),          // Clear data in buffer and reset modes
    HW_SELECT: new Buffer.from([0x1b, 0x3d, 0x01]),      // Printer select
    HW_RESET: new Buffer.from([0x1b, 0x3f, 0x0a, 0x00]),  // Reset printer hardware
    BEEP: new Buffer.from([0x1b, 0x1e]),              // Sounds built-in buzzer (if equipped)
    UPSIDE_DOWN_ON: new Buffer.from([0x1b, 0x7b, 0x01]),     // Upside down printing ON (rotated 180 degrees).
    UPSIDE_DOWN_OFF: new Buffer.from([0x1b, 0x7b, 0x00]),     // Upside down printing OFF (default).

    // Cash Drawer
    CD_KICK_2: new Buffer.from([0x1b, 0x70, 0x00]),      // Sends a pulse to pin 2 []
    CD_KICK_5: new Buffer.from([0x1b, 0x70, 0x01]),      // Sends a pulse to pin 5 []

    // Paper
    PAPER_FULL_CUT: new Buffer.from([0x1d, 0x56, 0x00]), // Full cut paper
    PAPER_PART_CUT: new Buffer.from([0x1d, 0x56, 0x01]), // Partial cut paper

    // Text format
    TXT_NORMAL: new Buffer.from([0x1b, 0x21, 0x00]), // Normal text
    TXT_2HEIGHT: new Buffer.from([0x1b, 0x21, 0x10]), // Double height text
    TXT_2WIDTH: new Buffer.from([0x1b, 0x21, 0x20]), // Double width text
    TXT_4SQUARE: new Buffer.from([0x1b, 0x21, 0x30]), // Quad area text
    TXT_UNDERL_OFF: new Buffer.from([0x1b, 0x2d, 0x00]), // Underline font OFF
    TXT_UNDERL_ON: new Buffer.from([0x1b, 0x2d, 0x01]), // Underline font 1-dot ON
    TXT_UNDERL2_ON: new Buffer.from([0x1b, 0x2d, 0x02]), // Underline font 2-dot ON
    TXT_BOLD_OFF: new Buffer.from([0x1b, 0x45, 0x00]), // Bold font OFF
    TXT_BOLD_ON: new Buffer.from([0x1b, 0x45, 0x01]), // Bold font ON
    TXT_INVERT_OFF: new Buffer.from([0x1d, 0x42, 0x00]), // Invert font OFF (eg. white background)
    TXT_INVERT_ON: new Buffer.from([0x1d, 0x42, 0x01]), // Invert font ON (eg. black background)
    TXT_FONT_A: new Buffer.from([0x1b, 0x4d, 0x00]), // Font type A
    TXT_FONT_B: new Buffer.from([0x1b, 0x4d, 0x01]), // Font type B
    TXT_ALIGN_LT: new Buffer.from([0x1b, 0x61, 0x00]), // Left justification
    TXT_ALIGN_CT: new Buffer.from([0x1b, 0x61, 0x01]), // Centering
    TXT_ALIGN_RT: new Buffer.from([0x1b, 0x61, 0x02]), // Right justification

    // Char code table
    CHARCODE_USA: new Buffer.from([0x1b, 0x52, 0x00]), // USA
    CHARCODE_FRANCE: new Buffer.from([0x1b, 0x52, 0x01]), // France
    CHARCODE_GERMANY: new Buffer.from([0x1b, 0x52, 0x02]), // Germany
    CHARCODE_UK: new Buffer.from([0x1b, 0x52, 0x03]), // U.K.
    CHARCODE_DENMARK1: new Buffer.from([0x1b, 0x52, 0x04]), // Denmark I
    CHARCODE_SWEDEN: new Buffer.from([0x1b, 0x52, 0x05]), // Sweden
    CHARCODE_ITALY: new Buffer.from([0x1b, 0x52, 0x06]), // Italy
    CHARCODE_SPAIN1: new Buffer.from([0x1b, 0x52, 0x07]), // Spain I
    CHARCODE_JAPAN: new Buffer.from([0x1b, 0x52, 0x08]), // Japan
    CHARCODE_NORWAY: new Buffer.from([0x1b, 0x52, 0x09]), // Norway
    CHARCODE_DENMARK2: new Buffer.from([0x1b, 0x52, 0x0A]), // Denmark II
    CHARCODE_SPAIN2: new Buffer.from([0x1b, 0x52, 0x0B]), // Spain II
    CHARCODE_LATINA: new Buffer.from([0x1b, 0x74, 0x12]), // Latin America
    CHARCODE_KOREA: new Buffer.from([0x1b, 0x52, 0x0D]), // Korea
    CHARCODE_SLOVENIA: new Buffer.from([0x1b, 0x52, 0x0E]), // Slovenia
    CHARCODE_CHINA: new Buffer.from([0x1b, 0x52, 0x0F]), // China
    CHARCODE_VIETNAM: new Buffer.from([0x1b, 0x52, 0x10]), // Vietnam
    CHARCODE_ARABIA: new Buffer.from([0x1b, 0x52, 0x11]), // ARABIA


    // Barcode format
    BARCODE_TXT_OFF: new Buffer.from([0x1d, 0x48, 0x00]), // HRI barcode chars OFF
    BARCODE_TXT_ABV: new Buffer.from([0x1d, 0x48, 0x01]), // HRI barcode chars above
    BARCODE_TXT_BLW: new Buffer.from([0x1d, 0x48, 0x02]), // HRI barcode chars below
    BARCODE_TXT_BTH: new Buffer.from([0x1d, 0x48, 0x03]), // HRI barcode chars both above and below
    BARCODE_FONT_A: new Buffer.from([0x1d, 0x66, 0x00]), // Font type A for HRI barcode chars
    BARCODE_FONT_B: new Buffer.from([0x1d, 0x66, 0x01]), // Font type B for HRI barcode chars
    BARCODE_HEIGHT: new Buffer.from([0x1d, 0x68, 0x64]), // Barcode Height [1-255]
    BARCODE_WIDTH: new Buffer.from([0x1d, 0x77, 0x03]), // Barcode Width  [2-6]
    BARCODE_UPC_A: new Buffer.from([0x1d, 0x6b, 0x00]), // Barcode type UPC-A
    BARCODE_UPC_E: new Buffer.from([0x1d, 0x6b, 0x01]), // Barcode type UPC-E
    BARCODE_EAN13: new Buffer.from([0x1d, 0x6b, 0x02]), // Barcode type EAN13
    BARCODE_EAN8: new Buffer.from([0x1d, 0x6b, 0x03]), // Barcode type EAN8
    BARCODE_CODE39: new Buffer.from([0x1d, 0x6b, 0x04]), // Barcode type CODE39
    BARCODE_ITF: new Buffer.from([0x1d, 0x6b, 0x05]), // Barcode type ITF
    BARCODE_NW7: new Buffer.from([0x1d, 0x6b, 0x06]), // Barcode type NW7

    //BARCODE_CODE128

    // BARCODE_CODE128  : new Buffer.from([0x1d, 0x6b, 0x04]), // Barcode type CODE39
    BARCODE_CODE128_TEXT_1: new Buffer.from([0x1d, 0x48, 1]), // printer data above the bar code
    BARCODE_CODE128_TEXT_2: new Buffer.from([0x1d, 0x48, 2]), // printer data below the bar code
    BARCODE_CODE128_TEXT_3: new Buffer.from([0x1d, 0x48, 3]), // printer data both above and below the bar code

    // QR Code
    QRCODE_MODEL1: new Buffer.from([0x1d, 0x28, 0x6b, 0x04, 0x00, 0x31, 0x41, 0x31, 0x00]), // Model 1
    QRCODE_MODEL2: new Buffer.from([0x1d, 0x28, 0x6b, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00]), // Model 2
    QRCODE_MODEL3: new Buffer.from([0x1d, 0x28, 0x6b, 0x04, 0x00, 0x31, 0x41, 0x33, 0x00]), // Model 3

    QRCODE_CORRECTION_L: new Buffer.from([0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, 0x30]), // Correction level: L - 7%
    QRCODE_CORRECTION_M: new Buffer.from([0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, 0x31]), // Correction level: M - 15%
    QRCODE_CORRECTION_Q: new Buffer.from([0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, 0x32]), // Correction level: Q - 25%
    QRCODE_CORRECTION_H: new Buffer.from([0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, 0x33]), // Correction level: H - 30%

    QRCODE_CELLSIZE_1: new Buffer.from([0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, 0x01]),   // Cell size 1
    QRCODE_CELLSIZE_2: new Buffer.from([0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, 0x02]),   // Cell size 2
    QRCODE_CELLSIZE_3: new Buffer.from([0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, 0x03]),   // Cell size 3
    QRCODE_CELLSIZE_4: new Buffer.from([0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, 0x04]),   // Cell size 4
    QRCODE_CELLSIZE_5: new Buffer.from([0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, 0x05]),   // Cell size 5
    QRCODE_CELLSIZE_6: new Buffer.from([0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, 0x06]),   // Cell size 6
    QRCODE_CELLSIZE_7: new Buffer.from([0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, 0x07]),   // Cell size 7
    QRCODE_CELLSIZE_8: new Buffer.from([0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, 0x08]),   // Cell size 8

    QRCODE_PRINT: new Buffer.from([0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x51, 0x30]),        // Print QR code


    // Image format
    S_RASTER_N: new Buffer.from([0x1d, 0x76, 0x30, 0x00]), // Set raster image normal size
    S_RASTER_2W: new Buffer.from([0x1d, 0x76, 0x30, 0x01]), // Set raster image double width
    S_RASTER_2H: new Buffer.from([0x1d, 0x76, 0x30, 0x02]), // Set raster image double height
    S_RASTER_Q: new Buffer.from([0x1d, 0x76, 0x30, 0x03]), // Set raster image quadruple

    // Printing Density
    PD_N50: new Buffer.from([0x1d, 0x7c, 0x00]), // Printing Density -50%
    PD_N37: new Buffer.from([0x1d, 0x7c, 0x01]), // Printing Density -37.5%
    PD_N25: new Buffer.from([0x1d, 0x7c, 0x02]), // Printing Density -25%
    PD_N12: new Buffer.from([0x1d, 0x7c, 0x03]), // Printing Density -12.5%
    PD_0: new Buffer.from([0x1d, 0x7c, 0x04]), // Printing Density  0%
    PD_P50: new Buffer.from([0x1d, 0x7c, 0x08]), // Printing Density +50%
    PD_P37: new Buffer.from([0x1d, 0x7c, 0x07]), // Printing Density +37.5%
    PD_P25: new Buffer.from([0x1d, 0x7c, 0x06]), // Printing Density +25%

    specialCharacters: {
        "Č": 94,
        "č": 126,
        "Š": 91,
        "š": 123,
        "Ž": 64,
        "ž": 96,
        "Đ": 92,
        "đ": 124,
        "Ć": 93,
        "ć": 125,
        "ß": 225,
        "ẞ": 225,
        "ö": 148,
        "Ö": 153,
        "Ä": 142,
        "ä": 132,
        "ü": 129,
        "Ü": 154,
        "é": 130,
        "Ç": 128,
        "ç": 135,
        "ã": 198,
        "Ã": 199,
        "ú": 163,
        "Ú": 233,
        "õ": 228,
        "Õ": 229,
        "Í": 214,
        "í": 161,
    }
}






