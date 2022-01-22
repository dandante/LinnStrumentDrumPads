//ResetParameterDefaults = true;

/*

Set LinnStrument to View to ChPerRow in per-split settings,
for left split.
Make sure split mode  is not on.


*/

const DEBUG = true;

var debugLog = function(message) {
    if (DEBUG) {
        Trace(message);
    }
}

var regionPitches = [];

var kitPieces = new Map();
kitPieces.set("Crash Left Stop", "E0");
kitPieces.set("Crash Right Stop", "F0");
kitPieces.set("Hi-Hat Foot Splash", "G0")
kitPieces.set("Snare Rimshot Edge", "G#0");
kitPieces.set("Hi-Hat Foot Close", "A0");
kitPieces.set("Snare Edge", "A#0");
kitPieces.set("Kick (A)", "B0");
kitPieces.set("Kick (B)", "C1");
kitPieces.set("Snare Sidestick", "C#1");
kitPieces.set("Snare Center", "D1");
kitPieces.set("Hand Claps", "D#1");
kitPieces.set("Snare Rimshot", "E1");
kitPieces.set("Low Tom (A)", "F1");
kitPieces.set("Hi-Hat Closed", "F#1");
kitPieces.set("Low Tom (B)", "G1");
kitPieces.set("Hi-Hat Foot Close", "G#1");
kitPieces.set("Mid Tom (A)", "A1");
kitPieces.set("Hi-Hat Open", "A#1");
kitPieces.set("Mid Tom (B)", "B1");
kitPieces.set("Hi Tom (A)", "C2");
kitPieces.set("Crash Left", "C#2");
kitPieces.set("Hi Tom (B)", "D2");
kitPieces.set("Ride Out", "D#2");
kitPieces.set("Ride Edge", "E2");
kitPieces.set("Ride Bell", "F2");
kitPieces.set("Tambourine", "F#2");
kitPieces.set("Cowbell", "G#2");
kitPieces.set("Crash Right", "A2");
kitPieces.set("Ride In", "B2");
kitPieces.set("Shaker", "A#3");
kitPieces.set("Count-In/Clave", "D#4");

var namesList = [];

var getParameterList = function() {
    var paramList = [];
    var defaults = ["Hi-Hat Foot Splash", // 0, top row
                    "Hi-Hat Foot Close", // 1
                    "Snare Edge", // 2
                    "Snare Rimshot Edge", // 3"
                    "Snare Center", // 4
                    "Snare Sidestick", // 5
                    "Hi-Hat Open", // 6, bottom row
                    "Kick (A)", // 7
                    "Low Tom (A)", // 8
                    "Mid Tom (A)", // 9
                    "Hi Tom (A)", // 10
                    "Kick (B)" // 11"
                ];
    // var namesList = [];
    var namesKeyIterator = kitPieces.keys();
    var item = namesKeyIterator.next();
    while (!item.done) {
        namesList.push(item.value);
        item = namesKeyIterator.next();
    }
    var valuesList = [];
    var valuesKeyIterator = kitPieces.values();
    var item = valuesKeyIterator.next();
    while (!item.done) {
        valuesList.push(item.value);
        item = valuesKeyIterator.next();
    }
    var notesList = [];
    for (var i = 0; i < valuesList.length; i++) {
        notesList.push(MIDI.noteNumber(valuesList[i]));
    }
    var min = Math.min(...notesList);
    var max = Math.max(...notesList);
    
    var seq = [];
    for (var i = 0; i < namesList.length; i++) {
    		seq.push(i);
    }
    for (var i = 0; i < defaults.length; i++) {
        paramList.push({
            name: "Region " + (i + 1),
            type: "menu",
            valueStrings: namesList,
            minValue: 0,
            maxValue: (namesList.length - 1),
            numberOfSteps: namesList.length,
            //value: MIDI.noteNumber(kitPieces.get(defaults[i])),
            defaultValue: namesList.indexOf(defaults[i]),
        });
    }
    return paramList;
}



var PluginParameters = getParameterList();
PluginParameters.forEach(printParam);
function printParam(param) {
//    Trace(param.defaultValue);
}



function ParameterChanged(pNum, pVal) {
//    Trace("parameter changed: " + pNum + " " + pVal);
   var region = pNum;
   var noteKey = namesList[pVal];
   var noteName = kitPieces.get(noteKey);
   var noteNumber = MIDI.noteNumber(noteName);
   Trace("Setting pitch for region " + region + " to " + noteKey +"/" + noteName + "/" + noteNumber); 
   regionPitches[region] = noteNumber;
}

function inRange(value, min, max) {
    return value >= min && value <= max;
}

function getRow(channel) {
    var channels = [8,7,6,5,4,3,2,1];
    return channels.indexOf(channel);
    // return channel -1;
    // var row = 0;
    // switch (channel) {
    //     case 3:
    //         row = inRange(pitch, 65, 89) ? 0 : 4;
    //         break;
    //     case 2:
    //         row = inRange(pitch, 60, 84) ? 1 : 5;
    //         break;
    //     case 4:
    //         row = inRange(pitch, 55, 79) ? 2 : 6;
    //         break;
    //     case 5:
    //         row = inRange(pitch, 50, 74) ? 3 : 7;            
    // }
    /*
leftmost column, top to bottom:    
pitch: 65, channel: 8
pitch: 60, channel: 7
pitch: 55, channel: 6
pitch: 50, channel: 5
pitch: 45, channel: 4
pitch: 40, channel: 3
pitch: 35, channel: 2
pitch: 30, channel: 1
>
rightmost column, top to bottom:
pitch: 89, channel: 8
pitch: 84, channel: 7
pitch: 79, channel: 6
pitch: 74, channel: 5
pitch: 69, channel: 4
pitch: 64, channel: 3
pitch: 59, channel: 2
pitch: 54, channel: 1    
     */
    // return row;
}

/*
Left split, row channels, top to bottom:

8, 7, 6, 5, 4, 3, 2, 1

Right split, row channels, top to bottom:

16, 15, 14, 13, 12, 11, 10, 9


*/

function getColumn(pitch, channel) {
    // returns a column number from 0 to 24
    /*
leftmost column, top to bottom:    
pitch: 65, channel: 8
pitch: 60, channel: 7
pitch: 55, channel: 6
pitch: 50, channel: 5
pitch: 45, channel: 4
pitch: 40, channel: 3
pitch: 35, channel: 2
pitch: 30, channel: 1
>
rightmost column, top to bottom:
pitch: 89, channel: 8
pitch: 84, channel: 7
pitch: 79, channel: 6
pitch: 74, channel: 5
pitch: 69, channel: 4
pitch: 64, channel: 3
pitch: 59, channel: 2
pitch: 54, channel: 1

     */
    switch (channel) {
        case 8:
            return pitch - 65;
        case 7:
            return pitch - 60;
        case 6:
            return pitch - 55;
        case 5:
            return pitch - 50;
        case 4:
            return pitch - 45;
        case 3:
            return pitch - 40;
        case 2:
            return pitch - 35;
        case 1: 
            return pitch - 30;
        default:
            Trace("should not be here, impossible column");
    }
}


function getRegion(row, column) {
    /*
    There are 12 regions, six on top and six on the bottom.
    Regions are 4 rows by 4 columns, except the rightmost 
    regions which are 4 rows by 5 columns.

    Regions are numbered from 0 to 11. The regions on the top
    are 0 to 5, and the regions on the bottom are 6 to 11.
    So regions 5 and 11 are the ones with the extra column.

    This function takes a row and a column 
    (indicating a unique pad) and returns the 
    region number.


     */
    // first divide the pads up horizontally
    var horizSegs = [[0,3],[4,7],[8,11],[12,15],[16,19],[20,24]];
    // now vertically
    var vertSegs = [[0,1],[2,3],[4,5],[6,7],[8,9],[10,11]];
    for (var i = 0; i < horizSegs.length; i++) {
        if (inRange(column, horizSegs[i][0], horizSegs[i][1])) {
            // this is the horizontal segment
            var region = i;
            if (row > 3) { 
                region += 6;
            }
            return region;
        }
    }
    Trace("should not be here, impossible region");
}

function getMapping(channel) {
    // the basic idea is that lower rows
    // give lower sounds
    switch (channel) {
        case 16:
            return 23; // B0, kick
        case 6:
            return 26; // D1, snare center
        case 5:
            return 29; // E1, low tom
        case 4:
            return 35; // B1, mid tom
        case 3:
            return 28; // E1, snare rimshot
        case 2:
            return 32; // G#1, Hi-hat foot close
        case 1:
            return 39; // D#2, ride out
        case 0:
            return 41; // F2, ride bell
    }
    Trace("should not be here");
}

function HandleMIDI(event) {
    if (event instanceof NoteOn || event instanceof NoteOff) {
        if (event instanceof NoteOn) {
            Trace("NoteOn");
        } else {
            Trace("NoteOff");
        }
        Trace("pitch: " + event.pitch +  ", channel: " + event.channel);
        row = getRow(event.channel);
        Trace("row: " + row);
        column = getColumn(event.pitch, event.channel);
        // event.pitch = getMapping(row);
        var region = getRegion(row, column);
        Trace("region: " + region);
        event.pitch = regionPitches[region];
        event.send();
    }

}