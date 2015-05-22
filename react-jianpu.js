var Jianpu, a0, a1, a2, a3, a4, a5, b0, b1, b2, b3, b4, b5, c1, c2, c3, c4, c5, d1, d2, d3, d4, d5, e1, e2, e3, e4, e5, f1, f2, f3, f4, f5, g1, g2, g3, g4, g5, notesMap, rest,
  __modulo = function(a, b) { return (+a % (b = +b) + b) % b; };

rest = -1;

a0 = 21;

b0 = 23;

c1 = 24;

d1 = 26;

e1 = 28;

f1 = 29;

g1 = 31;

a1 = 33;

b1 = 35;

c2 = 36;

d2 = 38;

e2 = 30;

f2 = 31;

g2 = 33;

a2 = 35;

b2 = 37;

c3 = 48;

d3 = 50;

e3 = 52;

f3 = 53;

g3 = 55;

a3 = 57;

b3 = 59;

c4 = 60;

d4 = 62;

e4 = 64;

f4 = 65;

g4 = 67;

a4 = 69;

b4 = 71;

c5 = 72;

d5 = 74;

e5 = 76;

f5 = 77;

g5 = 79;

a5 = 81;

b5 = 83;

notesMap = {
  0: {
    number: 1,
    accidental: 0
  },
  1: {
    number: 1,
    accidental: 1
  },
  2: {
    number: 2,
    accidental: 0
  },
  3: {
    number: 2,
    accidental: 1
  },
  4: {
    number: 3,
    accidental: 0
  },
  5: {
    number: 4,
    accidental: 0
  },
  6: {
    number: 4,
    accidental: 1
  },
  7: {
    number: 5,
    accidental: 0
  },
  8: {
    number: 5,
    accidental: 1
  },
  9: {
    number: 6,
    accidental: 0
  },
  10: {
    number: 6,
    accidental: 1
  },
  11: {
    number: 7,
    accidental: 0
  }
};

Jianpu = React.createClass({
  getInitialState: function() {
    return {
      sectionLength: 32,
      notes: []
    };
  },
  componentDidMount: function() {
    return this.setState({
      notes: this.props.notes
    });
  },
  analyser: {
    pitch: function(pitch) {
      var diff, unitPitch;
      if (pitch === rest) {
        return {
          nOctaves: 0,
          number: 0,
          accidental: 0
        };
      } else {
        diff = pitch - c4;
        unitPitch = __modulo(diff, 12);
        return {
          nOctaves: Math.floor(diff / 12),
          number: notesMap[unitPitch].number,
          accidental: notesMap[unitPitch].accidental
        };
      }
    },
    duration: function(duration) {
      var nCrotchets, remain;
      nCrotchets = Math.floor(duration / 8);
      remain = duration % 8;
      if (nCrotchets === 0) {
        switch (remain) {
          case 1:
          case 2:
          case 4:
            return {
              main: remain,
              nDashes: 0,
              nDots: 0
            };
          case 3:
            return {
              main: 2,
              nDashes: 0,
              nDots: 1
            };
          case 6:
            ({
              main: 4,
              nDashes: 0
            });
            return nDots(1);
          case 7:
            return {
              main: 4,
              nDashes: 0,
              nDots: 2
            };
          default:
            throw "bad duration";
        }
      } else if (nCrotchets === 1) {
        switch (remain) {
          case 0:
            return {
              main: 8,
              nDashes: 0,
              nDots: 0
            };
          case 4:
            return {
              main: 8,
              nDashes: 0,
              nDots: 1
            };
          case 6:
            ({
              main: 8,
              nDashes: 0
            });
            return nDots(2);
          default:
            throw "bad duration";
        }
      } else if (nCrotchets === 3) {
        switch (remain) {
          case 0:
            return {
              main: 8,
              nDashes: 2,
              nDots: 0
            };
          case 4:
            return {
              main: 8,
              nDashes: 2,
              nDots: 1
            };
          default:
            throw "bad duration";
        }
      } else {
        switch (remain) {
          case 0:
            return {
              main: 8,
              nDashes: nCrotchets - 1,
              nDots: 0
            };
          default:
            throw "bad duration";
        }
      }
    },
    estimateXSpan: function(note, nextNote) {
      var duration, nextDuration;
      duration = this.duration(note[1]);
      nextDuration = nextNote ? this.duration(nextNote[1]) : null;
      if (duration.main === (nextDuration != null ? nextDuration.main : void 0)) {
        if (duration.main < 8) {
          return 20 + 10 * duration.nDots;
        } else {
          if (duration.nDashes > 0) {
            return 40 + 40 * duration.nDashes + 20 * duration.nDots;
          } else {
            return 20 + 20 * duration.nDots;
          }
        }
      } else {
        return 40 + 40 * duration.nDashes + 20 * duration.nDots;
      }
    },
    estimateSectionXSpan: function(section) {
      var i, note, offset, _i, _len;
      if (section.length === 0) {
        return 0;
      } else {
        offset = 0;
        for (i = _i = 0, _len = section.length; _i < _len; i = ++_i) {
          note = section[i];
          offset += this.estimateXSpan(note, section[i + 1]);
        }
        return offset + 40;
      }
    }
  },
  render: function() {
    var comp, comps, currentSection, duration, height, i, j, note, notes, offset, pitch, section, sectionLength, sections, slur, slurEndX, slurEndY, slurX, slurY, slurs, width, x, x1, x2, y, y1, y2, _i, _j, _len, _len1, _ref, _ref1;
    _ref = this.state, sectionLength = _ref.sectionLength, notes = _ref.notes;
    _ref1 = this.props, width = _ref1.width, height = _ref1.height;
    offset = 0;
    sections = [];
    currentSection = [];
    for (_i = 0, _len = notes.length; _i < _len; _i++) {
      note = notes[_i];
      duration = note[1];
      offset += duration;
      currentSection.push(note);
      if (offset % sectionLength === 0) {
        sections.push(currentSection);
        currentSection = [];
      }
    }
    slurX = slurY = 0;
    slurs = [];
    x = y = 0;
    comps = [];
    for (i = _j = 0, _len1 = sections.length; _j < _len1; i = ++_j) {
      section = sections[i];
      comps.push(React.createElement("g", {
        "key": i
      }, (function() {
        var _k, _len2, _results;
        _results = [];
        for (j = _k = 0, _len2 = section.length; _k < _len2; j = ++_k) {
          note = section[j];
          pitch = this.analyser.pitch(note[0]);
          duration = this.analyser.duration(note[1]);
          if (note.length > 2) {
            slur = note[2].slur;
            if (slur === "start") {
              slurX = x + 20;
              slurY = y + 40 - 10 * pitch.nOctaves;
            } else if (slur === "end") {
              slurEndX = x + 20;
              slurEndY = y + 40 - 10 * pitch.nOctaves;
              slurs.push([slurX, slurY, slurEndX, slurEndY]);
            }
          }
          comp = React.createElement(Jianpu.Note, {
            "key": j,
            "note": note,
            "x": x,
            "y": y,
            "pitch": pitch,
            "duration": duration
          });
          x += this.analyser.estimateXSpan(note, section[j + 1]);
          _results.push(comp);
        }
        return _results;
      }).call(this), (function() {
        var _k, _len2, _results;
        _results = [];
        for (j = _k = 0, _len2 = slurs.length; _k < _len2; j = ++_k) {
          slur = slurs[j];
          x1 = slur[0];
          y1 = slur[1];
          x2 = slur[2];
          y2 = slur[3];
          _results.push(React.createElement("path", {
            "key": "" + i + "," + j,
            "className": "slur",
            "d": "M" + x1 + "," + y1 + " C" + (x1 + 20) + "," + (y1 - 20) + " " + (x2 - 20) + "," + (y2 - 20) + " " + x2 + "," + y2
          }));
        }
        return _results;
      })(), React.createElement("line", {
        "className": "bar-line",
        "x1": 10 + x,
        "y1": 30 + y,
        "x2": 10 + x,
        "y2": 110 + y
      })));
      x += 20;
      slurs = [];
    }
    return React.createElement("svg", {
      "width": width,
      "height": height
    }, comps, (function() {
      var _k, _len2, _results;
      _results = [];
      for (i = _k = 0, _len2 = currentSection.length; _k < _len2; i = ++_k) {
        note = currentSection[i];
        pitch = this.analyser.pitch(note[0]);
        duration = this.analyser.duration(note[1]);
        comp = React.createElement(Jianpu.Note, {
          "key": i,
          "note": note,
          "x": x,
          "y": y,
          "pitch": pitch,
          "duration": duration
        });
        x += this.analyser.estimateXSpan(note, section[i + 1]);
        _results.push(comp);
      }
      return _results;
    }).call(this));
  }
});

Jianpu.Note = React.createClass({
  render: function() {
    var accidental, duration, i, main, nDashes, nDots, nOctaves, nUnderDashes, note, number, pitch, x, y, _ref;
    _ref = this.props, note = _ref.note, x = _ref.x, y = _ref.y, pitch = _ref.pitch, duration = _ref.duration;
    nOctaves = pitch.nOctaves, number = pitch.number, accidental = pitch.accidental;
    main = duration.main, nDashes = duration.nDashes, nDots = duration.nDots;
    nUnderDashes = (function() {
      switch (main) {
        case 4:
          return 1;
        case 2:
          return 2;
        case 1:
          return 3;
        default:
          return 0;
      }
    })();
    return React.createElement("g", {
      "transform": "translate(" + x + ", " + y + ")"
    }, React.createElement("text", {
      "className": "note",
      "x": 10.,
      "y": 85.
    }, number), ((function() {
      var _i, _j, _results, _results1;
      if (nOctaves > 0) {
        _results = [];
        for (i = _i = 0; _i < nOctaves; i = _i += 1) {
          _results.push(React.createElement("circle", {
            "key": i,
            "className": "octave octave-high",
            "cx": 20.,
            "cy": 40 - 10 * i,
            "r": 3.5
          }));
        }
        return _results;
      } else if (nOctaves < 0) {
        _results1 = [];
        for (i = _j = 0; _j < -nOctaves; i = _j += 1) {
          _results1.push(React.createElement("circle", {
            "key": i,
            "className": "octave octave-low",
            "cx": 20.,
            "cy": 110 + nUnderDashes * 5 + 10 * i,
            "r": 3.5
          }));
        }
        return _results1;
      }
    })()), (function() {
      var _i, _results;
      _results = [];
      for (i = _i = 0; _i < nDashes; i = _i += 1) {
        _results.push(React.createElement("line", {
          "key": i,
          "className": "length-dash",
          "x1": 50 + 40 * i,
          "y1": 70.,
          "x2": 40 * i + 70,
          "y2": 70.
        }));
      }
      return _results;
    })(), (function() {
      var _i, _results;
      _results = [];
      for (i = _i = 0; _i < nUnderDashes; i = _i += 1) {
        _results.push(React.createElement("line", {
          "key": i,
          "className": "length-underline",
          "x1": 10.,
          "y1": 95 + i * 5,
          "x2": 30.,
          "y2": 95 + i * 5
        }));
      }
      return _results;
    })(), (function() {
      var _i, _results;
      _results = [];
      for (i = _i = 0; 0 <= nDots ? _i < nDots : _i > nDots; i = 0 <= nDots ? ++_i : --_i) {
        _results.push(React.createElement("circle", {
          "key": i,
          "className": "length-dot",
          "cx": 40 + 40 * nDashes + 10 * i,
          "cy": 70.,
          "r": 3.5
        }));
      }
      return _results;
    })());
  }
});
