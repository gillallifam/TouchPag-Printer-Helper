var printer = require("printer")
var express = require('express');
var removeAccents = require("remove-accents")
var dateFormat = require('dateformat');
var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./svStorage');
var app = express();
app.use(express.json())

//localStorage.setItem('myFirstKey', 'myFirstValue');
//localStorage.clear()
//console.log(localStorage.getItem('myFirstKey') || "getDefault");

var F_CUT = new Buffer.from([0x1d, 0x56, 0x00]) // Full cut paper  
var endString = "\n\n\n\n\n\n"

function publishPrinters() {
    //console.log(printer.getPrinters());
    for (const prt of printer.getPrinters()) {
        console.log(prt.name);
        app.post('/printer/' + prt.name, async function (req, res) {
            let rst = await printTask(prt.name, req.body)
            console.log("Name: " + req.body.name + "order: " + req.body.orderId + "status: " + rst);
            res.send({ local: req.body.name, status: rst });
        });
    }
}

publishPrinters()

async function printTask(prtName, task) {
    if (task.items) {
        let items = task.items
        let str = ""
        let status = "error"
        str += pc.TXT_ALIGN_CT + pc.TXT_NORMAL + dateFormat(new Date(), "dd/mm/yyyy HH:MM:ss") + "\n\n"
        str += "Pedido em producao\n\n"
        str += pc.TXT_4SQUARE
        str += task.name.toUpperCase() + "\n\n"
        str += pc.TXT_BOLD_ON + task.orderId + pc.TXT_BOLD_OFF + "\n\n"
        str += pc.TXT_ALIGN_LT + pc.TXT_2HEIGHT + pc.TXT_2WIDTH
        for (let i = 0; i < items.length; i++) {
            str += items[i].qnt + "\t" + items[i].name + "\n"
            if (items[i].obs && task.name != "entrega") {
                items[i].obs = items[i].obs.replace(/[\n\r]/g, '\n\t*');
                str += "\t*" + items[i].obs + "\n"
            }
        }

        result = await new Promise(r1 => {
            printer.printDirect({
                data: removeAccents(str) + endString + F_CUT,
                type: 'RAW',
                printer: prtName,
                success: async function (jobID) {
                    let maxTime = 15000
                    let interval = 1
                    status = await new Promise(r2 => {
                        let timer = setTimeout(() => {
                            console.log("Timeout on printing in: " + task.name);
                            printer.setJob(prtName, jobID, "CANCEL")
                            r2("fail")
                        }, maxTime);

                        let inter = setInterval(() => {
                            try {
                                //console.log(printer.getJob(prtName, jobID));
                                printer.getJob(prtName, jobID).status
                            } catch (error) {
                                clearInterval(inter)
                                clearTimeout(timer)
                                r2("success")
                                console.log("Job finished: " + jobID);
                            }
                        }, interval);
                    });
                    r1(status)
                }, error: function (err) {
                    console.log("Error on printing: ", err);
                    status = "error"
                    r1(status)
                }
            })
        });
        return result
    } else {
        return "notitems"
    }
}

app.get('/', function (req, res) {
    res.send('TPS');//TouchPag printer server
});

app.get('/listprinters', function (req, res) {
    let printers = []
    for (const prt of printer.getPrinters()) {
        p = { name: prt.name, status: true }
        printers.push(p)
    }
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

const port = 3536
app.listen(port, function () {
    console.log('Server listening on port ' + port + '!');
    console.log("-----------------------------");
});

var pc = {
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

