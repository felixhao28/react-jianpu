var App, parse, rowyourboat;

parse = function(m) {
  var base, handleLastline, i, isNum, lastLine, line, lines, noteDelims, notes, _i, _ref;
  notes = [];
  base = c4;
  lines = m.split("\n");
  isNum = {
    "0": true,
    "1": true,
    "2": true,
    "3": true,
    "4": true,
    "5": true,
    "6": true,
    "7": true
  };
  noteDelims = {
    "<": true,
    ">": true,
    "|": true,
    "#": true,
    "b": true
  };
  handleLastline = function(line) {
    var accidental, c, control, controlLine, duration, extraDuration, i, main, options, pitch, tempo, tempoLine, _i, _len, _results;
    tempoLine = line.tempoLine, controlLine = line.controlLine, main = line.main;
    pitch = null;
    extraDuration = 0;
    options = {};
    accidental = 0;
    _results = [];
    for (i = _i = 0, _len = main.length; _i < _len; i = ++_i) {
      c = main[i];
      if (pitch !== null && (isNum[c] || noteDelims[c])) {
        notes.push([pitch + accidental, duration + extraDuration, options]);
        options = {};
        pitch = null;
        duration = null;
        extraDuration = 0;
        accidental = 0;
      }
      tempo = tempoLine != null ? tempoLine[i] : void 0;
      control = controlLine != null ? controlLine[i] : void 0;
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
        _results.push(duration = (function() {
          switch (tempo) {
            case "-":
              return 4;
            case "=":
              return 2;
            default:
              return 8;
          }
        })());
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };
  lastLine = {};
  for (i = _i = 0, _ref = lines.length; _i < _ref; i = _i += 1) {
    line = lines[i];
    if (line[0] === "T") {
      lastLine.tempoLine = line.slice(1);
    } else if (line[0] === "C") {
      lastLine.controlLine = line.slice(1);
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

rowyourboat = "M1.1.|123.|3234|5--|\nT      -    - -\nM<1.>5.|3.1.|5432|1--|\nT             - -\nC            Ss";

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
      "width": 1000.,
      "height": 1000.,
      "sectionsPerLine": sectionsPerLine,
      "alignSections": alignSections
    })));
  }
});

React.render(React.createElement(App, null), document.getElementById("mycontainer"));
