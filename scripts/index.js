var App, parse, rowyourboat,
  __modulo = function(a, b) { return (+a % (b = +b) + b) % b; };

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
      },
      isPlaying: null,
      volume: 30,
      bpm: 120,
      instrument: "piano"
    };
  },
  playNotes: function(notes) {
    var i, playHelper;
    i = 0;
    playHelper = (function(_this) {
      return function() {
        var bpm, crotchetDuration, diff, duration, instrument, n, nOctaves, note, noteStr, pitch, unitPitch, volume, _ref;
        if (i >= notes.length || _this.shouldStop) {
          _this.shouldStop = false;
          return _this.setState({
            isPlaying: null
          });
        } else {
          note = notes[i];
          pitch = note.pitch, duration = note.duration;
          _this.setState({
            isPlaying: note
          });
          _ref = _this.state, volume = _ref.volume, bpm = _ref.bpm, instrument = _ref.instrument;
          crotchetDuration = 60 / bpm;
          if (pitch.base > 0) {
            diff = pitch.base + pitch.accidental - c4;
            unitPitch = __modulo(diff, 12);
            n = notesMap[unitPitch];
            noteStr = String.fromCharCode(65 + (n.number + 1) % 7);
            if (n.accidental === 1) {
              noteStr += "#";
            }
            nOctaves = Math.floor(diff / 12) + 4;
            Synth.setVolume(volume / 100);
            Synth.play(instrument, noteStr, nOctaves, duration / 8 * crotchetDuration);
          }
          setTimeout(playHelper, duration / 8 * crotchetDuration * 1000);
          return i++;
        }
      };
    })(this);
    return playHelper();
  },
  shouldStop: false,
  stopPlaying: function() {
    return this.shouldStop = true;
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
  onChangeVolume: function(v) {
    return this.setState({
      volume: v
    });
  },
  onChangeBPM: function(e) {
    return this.setState({
      bpm: parseInt(e.target.value)
    });
  },
  instruments: ["piano", "organ", "acoustic", "edm"],
  onSelectInstrument: function(eventKey) {
    return this.setState({
      instrument: eventKey
    });
  },
  onClickInstrument: function(e) {
    var bpm, crotchetDuration, instrument, volume, _ref;
    _ref = this.state, volume = _ref.volume, bpm = _ref.bpm, instrument = _ref.instrument;
    crotchetDuration = 60 / bpm;
    Synth.setVolume(volume / 100);
    return Synth.play(instrument, "C", 4, crotchetDuration * 2);
  },
  render: function() {
    var alignSections, bpm, brand, instr, instrument, isPlaying, melody, rawTime, sectionsPerLine, song, volume, _ref;
    _ref = this.state, song = _ref.song, melody = _ref.melody, alignSections = _ref.alignSections, rawTime = _ref.rawTime, sectionsPerLine = _ref.sectionsPerLine, isPlaying = _ref.isPlaying, volume = _ref.volume, bpm = _ref.bpm, instrument = _ref.instrument;
    brand = React.createElement("a", {
      "href": "https://github.com/felixhao28/react-jianpu",
      "className": "logo"
    }, "react-jianpu");
    return React.createElement("div", null, React.createElement(Navbar, {
      "brand": brand
    }, React.createElement(Nav, null, React.createElement(NavItem, {
      "href": "#",
      "onClick": this.onClick
    }, "Refresh"), (isPlaying ? React.createElement(NavItem, {
      "href": "#",
      "onClick": this.stopPlaying
    }, "Stop") : React.createElement(NavItem, {
      "href": "#",
      "onClick": this.playNotes.bind(this, song.melody)
    }, "Play")))), React.createElement(Grid, {
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
    }, React.createElement(PanelGroup, {
      "defaultActiveKey": "1",
      "accordion": true
    }, React.createElement(Panel, {
      "header": "General",
      "eventKey": "1"
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
    })), React.createElement(Panel, {
      "header": "Playback",
      "eventKey": "2"
    }, React.createElement("div", {
      "className": "form-group"
    }, React.createElement("label", {
      "className": "control-label"
    }, "Volume"), React.createElement(Slider, {
      "min": 0.,
      "max": 100.,
      "step": 1.,
      "value": volume,
      "onSlide": this.onChangeVolume,
      "toolTip": true,
      "formatter": (function(v) {
        return "" + v + "%";
      })
    })), React.createElement(Input, {
      "type": "number",
      "label": "BPM",
      "placeholder": "120",
      "value": bpm,
      "onChange": this.onChangeBPM
    }), React.createElement("div", {
      "className": "form-group"
    }, React.createElement("label", {
      "className": "control-label"
    }, "Instrument"), React.createElement(SplitButton, {
      "title": instrument,
      "onSelect": this.onSelectInstrument,
      "onClick": this.onClickInstrument
    }, (function() {
      var _i, _len, _ref1, _results;
      _ref1 = this.instruments;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        instr = _ref1[_i];
        _results.push(React.createElement(MenuItem, {
          "key": instr,
          "eventKey": instr
        }, instr));
      }
      return _results;
    }).call(this)))))))), React.createElement(Panel, {
      "header": "Preview"
    }, React.createElement(Jianpu, {
      "song": song,
      "sectionsPerLine": sectionsPerLine,
      "alignSections": alignSections,
      "highlight": isPlaying
    })));
  }
});

React.render(React.createElement(App, null), document.getElementById("mycontainer"));
