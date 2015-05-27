var App, parse, rowyourboat;

parse = function(m) {
  var base, deli, handleLastline, i, isNum, lastLine, line, lines, lyricsDelims, noteDelims, notes, _i, _j, _k, _l, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3;
  notes = [];
  base = c4;
  lines = m.split("\n");
  isNum = {};
  _ref = [0, 1, 2, 3, 4, 5, 6, 7];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    i = _ref[_i];
    isNum[i] = true;
  }
  noteDelims = {};
  _ref1 = ["<", ">", "#", "b"];
  for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
    deli = _ref1[_j];
    noteDelims[deli] = true;
  }
  lyricsDelims = {};
  _ref2 = [",", ".", ";", "?", "!", "(", ")", " ", void 0];
  for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
    deli = _ref2[_k];
    lyricsDelims[deli] = true;
  }
  handleLastline = function(line) {
    var accidental, c, control, controlLine, duration, extraDuration, lastLyricsChar, lyrics, lyricsChar, lyricsLine, main, options, pitch, tempo, tempoLine, _l, _len3, _results;
    tempoLine = line.tempoLine, controlLine = line.controlLine, lyricsLine = line.lyricsLine, main = line.main;
    pitch = null;
    extraDuration = 0;
    options = {};
    accidental = 0;
    lyrics = {};
    lastLyricsChar = void 0;
    _results = [];
    for (i = _l = 0, _len3 = main.length; _l < _len3; i = ++_l) {
      c = main[i];
      if (i === main.length - 1 || pitch !== null && (isNum[c] || noteDelims[c])) {
        if (lyrics.exists) {
          if (i === main.length - 1) {
            lyrics.content += lyricsLine.substr(i);
          }
          lyrics.content.trim();
        }
        notes.push({
          pitch: {
            base: pitch,
            accidental: accidental
          },
          duration: duration + extraDuration,
          options: options,
          lyrics: lyrics
        });
        options = {};
        pitch = null;
        duration = null;
        extraDuration = 0;
        accidental = 0;
        lyrics = {};
      }
      tempo = tempoLine != null ? tempoLine[i] : void 0;
      control = controlLine != null ? controlLine[i] : void 0;
      lyricsChar = lyricsLine != null ? lyricsLine[i] : void 0;
      switch (c) {
        case "0":
          pitch = rest;
          break;
        case "1":
          pitch = base;
          break;
        case "2":
          pitch = base + 2;
          break;
        case "3":
          pitch = base + 4;
          break;
        case "4":
          pitch = base + 5;
          break;
        case "5":
          pitch = base + 7;
          break;
        case "6":
          pitch = base + 9;
          break;
        case "7":
          pitch = base + 11;
          break;
        case "<":
          base += 12;
          break;
        case ">":
          base -= 12;
          break;
        case "-":
          extraDuration += 8;
          break;
        case ".":
          extraDuration += duration / 2;
          break;
        case "#":
          accidental = 1;
          break;
        case "b":
          accidental = -1;
      }
      switch (control) {
        case "S":
          options.slur = "start";
          break;
        case "s":
          options.slur = "end";
      }
      if (isNum[c]) {
        duration = (function() {
          switch (tempo) {
            case "-":
              return 4;
            case "=":
              return 2;
            default:
              return 8;
          }
        })();
      }
      if ((lyricsChar != null) && !(isNum[c] && lyricsDelims[lyricsChar])) {
        if (lyrics.exists) {
          lyrics.content += lyricsChar;
        } else if (lyricsChar !== " ") {
          lyrics.exists = true;
          lyrics.content = lyricsChar;
          lyrics.hyphen = !(lastLyricsChar in lyricsDelims);
        }
      }
      _results.push(lastLyricsChar = lyricsChar);
    }
    return _results;
  };
  lastLine = {};
  for (i = _l = 0, _ref3 = lines.length; _l < _ref3; i = _l += 1) {
    line = lines[i];
    if (line[0] === "T") {
      lastLine.tempoLine = line.slice(1);
    } else if (line[0] === "C") {
      lastLine.controlLine = line.slice(1);
    } else if (line[0] === "L") {
      lastLine.lyricsLine = line.slice(1);
    } else if (line[0] === "M") {
      if (lastLine.main) {
        handleLastline(lastLine);
        lastLine = {};
      }
      lastLine.main = line.slice(1);
    }
  }
  if (lastLine.main) {
    handleLastline(lastLine);
  }
  return notes;
};

({
  controlSyms: {
    "S": "slur start",
    "s": "slur end"
  }
});

rowyourboat = "M1.   1.|  1   2    3.|   3  2   3    4|  5--|\nT              -             -        -\nLRow, row, row your boat, gently down the stream.\nM<1.>5.| 3.     1.| 5   4 3  2|1--|\nT                       -    -\nC                   S   s \nL Ha ha, fooled ya, I'm a submarine.";

App = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  getInitialState: function() {
    return {
      alignSections: true,
      melody: rowyourboat,
      rawTime: "3/4",
      sectionsPerLine: 4,
      song: {
        melody: parse(rowyourboat),
        time: {
          upper: 3,
          lower: 4
        },
        key: {
          left: "1",
          right: "C"
        }
      }
    };
  },
  onClick: function(e) {
    var melody, song;
    song = this.state.song;
    melody = parse(this.refs.input.getValue());
    song.melody = melody;
    return this.setState({
      song: song
    });
  },
  onChangeAlign: function(e) {
    return this.setState({
      alignSections: e.target.checked
    });
  },
  onChangeKey: function(e) {
    this.state.song.key.right = e.target.value;
    return this.setState({
      song: this.state.song
    });
  },
  onChangeTime: function(e) {
    var rawTime, time;
    rawTime = e.target.value;
    this.setState({
      rawTime: rawTime
    });
    time = this.parseRowTime(rawTime);
    if (time.upper > 0 && time.lower > 0) {
      this.state.song.time = time;
      return this.setState({
        song: this.state.song
      });
    }
  },
  parseRowTime: function(rawTime) {
    var iSplit;
    iSplit = rawTime.indexOf("/");
    return {
      upper: parseInt(rawTime.substr(0, iSplit)),
      lower: parseInt(rawTime.substr(iSplit + 1))
    };
  },
  validateTime: function(rawTime) {
    var lower, upper, _ref;
    _ref = this.parseRowTime(rawTime), upper = _ref.upper, lower = _ref.lower;
    if (("" + upper + "/" + lower) === rawTime) {
      return {
        upper: upper,
        lower: lower
      };
    } else {
      return null;
    }
  },
  onChangeSPL: function(e) {
    return this.setState({
      sectionsPerLine: parseInt(e.target.value)
    });
  },
  render: function() {
    var alignSections, brand, melody, rawTime, sectionsPerLine, song, _ref;
    _ref = this.state, song = _ref.song, melody = _ref.melody, alignSections = _ref.alignSections, rawTime = _ref.rawTime, sectionsPerLine = _ref.sectionsPerLine;
    brand = React.createElement("a", {
      "href": "https://github.com/felixhao28/react-jianpu",
      "className": "logo"
    }, "react-jianpu");
    return React.createElement("div", null, React.createElement(Navbar, {
      "brand": brand
    }, React.createElement(Nav, null, React.createElement(NavItem, {
      "href": "#",
      "onClick": this.onClick
    }, "Refresh"))), React.createElement(Grid, {
      "fluid": true
    }, React.createElement(Row, null, React.createElement(Col, {
      "md": 8.
    }, React.createElement(Input, {
      "groupClassName": "markup-input",
      "ref": "input",
      "type": "textarea",
      "label": "Markup",
      "defaultValue": melody,
      "rows": 10.
    })), React.createElement(Col, {
      "md": 4.
    }, React.createElement(Panel, {
      "header": "Options"
    }, React.createElement(Input, {
      "type": "text",
      "label": "Key",
      "placeholder": "1=C",
      "addonBefore": "1=",
      "value": song.key.right,
      "onChange": this.onChangeKey
    }), React.createElement(Input, {
      "type": "text",
      "label": "Time",
      "placeholder": "4/4",
      "value": rawTime,
      "onChange": this.onChangeTime,
      "bsStyle": (!this.validateTime(rawTime) ? "error" : void 0)
    }), React.createElement(Input, {
      "type": "checkbox",
      "label": "Align Sections",
      "onChange": this.onChangeAlign,
      "checked": alignSections
    }), React.createElement(Input, {
      "type": "number",
      "label": "Sections per line",
      "placeholder": "4",
      "value": sectionsPerLine,
      "onChange": this.onChangeSPL
    }))))), React.createElement(Panel, {
      "header": "Preview"
    }, React.createElement(Jianpu, {
      "song": song,
      "sectionsPerLine": sectionsPerLine,
      "alignSections": alignSections
    })));
  }
});

React.render(React.createElement(App, null), document.getElementById("mycontainer"));
