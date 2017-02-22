var Jianpu, a0, a1, a2, a3, a4, a5, b0, b1, b2, b3, b4, b5, c1, c2, c3, c4, c5, d1, d2, d3, d4, d5, e1, e2, e3, e4, e5, f1, f2, f3, f4, f5, g1, g2, g3, g4, g5, notesMap, numberMap, rest,
  modulo = function(a, b) { return (+a % (b = +b) + b) % b; };

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

numberMap = {
  1: 0,
  2: 2,
  3: 4,
  4: 5,
  5: 7,
  6: 9,
  7: 11
};

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

Jianpu = React.createClass({displayName: "Jianpu",
  getDefaultProps: function() {
    return {
      sectionsPerLine: 4,
      alignSections: false
    };
  },
  analyser: {
    pitch: function(pitch) {
      var diff, unitPitch;
      if (pitch.base === rest) {
        return {
          nOctaves: 0,
          number: 0,
          accidental: 0
        };
      } else {
        diff = pitch.base - c4;
        unitPitch = modulo(diff, 12);
        return {
          nOctaves: Math.floor(diff / 12),
          number: notesMap[unitPitch].number,
          accidental: pitch.accidental
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
            return {
              main: 4,
              nDashes: 0,
              nDots: 1
            };
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
    estimateMusicXSpan: function(note, nextNote) {
      var duration, nextDuration;
      duration = this.duration(note.duration);
      nextDuration = nextNote ? this.duration(nextNote.duration) : null;
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
    estimateLyricsXSpan: function(note) {
      if (note.lyrics.exists) {
        return 10 + calculateSize(note.lyrics.content, {
          font: "Arial",
          fontSize: "20px"
        }).width;
      } else {
        return 0;
      }
    },
    estimateXSpan: function(note, nextNote) {
      return Math.max(this.estimateMusicXSpan(note, nextNote), this.estimateLyricsXSpan(note));
    },
    estimateSectionXSpan: function(section) {
      var i, k, len, note, offset;
      if (section.length === 0) {
        return 0;
      } else {
        offset = 0;
        for (i = k = 0, len = section.length; k < len; i = ++k) {
          note = section[i];
          offset += this.estimateXSpan(note, section[i + 1]);
        }
        return offset + 20;
      }
    }
  },
  render: function() {
    var alignSections, barX, barY, comp, computedNotes, computedSections, ctrl1X, ctrl2X, currentSection, delta, duration, height, heightPerLine, highlight, i, j, k, l, lastWidth, len, len1, len2, len3, len4, len5, len6, len7, len8, m, marginBottom, n, nLines, nSectionsThisLine, newWidth, newstartX, newx, note, noteInfo, notes, o, offset, p, pitch, q, r, ref, ref1, ref2, ref3, ref4, s, section, sectionLength, sectionOffsets, sectionPadding, sectionWidth, sections, sectionsPerLine, slur, slurEndX, slurEndY, slurX, slurY, slurs, song, startX, startY, t, width, x, x1, x2, xSpan, y, y1, y2;
    ref = this.props, song = ref.song, width = ref.width, height = ref.height, sectionsPerLine = ref.sectionsPerLine, alignSections = ref.alignSections, highlight = ref.highlight;
    console.log(song.name);
    heightPerLine = 200;
    marginBottom = 0;
    sectionPadding = 20;
    if (song == null) {
      return React.createElement("div", null);
    } else {
      sectionLength = parseFloat(song.time.upper) * 32 / parseFloat(song.time.lower);
      offset = 0;
      sections = [];
      currentSection = [];
      ref1 = song.melody;
      for (k = 0, len = ref1.length; k < len; k++) {
        note = ref1[k];
        duration = note.duration;
        offset += duration;
        currentSection.push(note);
        if (offset % sectionLength === 0) {
          sections.push(currentSection);
          currentSection = [];
        }
      }
      slurX = slurY = 0;
      x = y = 0;
      nSectionsThisLine = 0;
      computedSections = [];
      for (i = l = 0, len1 = sections.length; l < len1; i = ++l) {
        section = sections[i];
        startX = x;
        startY = y;
        computedNotes = [];
        for (j = m = 0, len2 = section.length; m < len2; j = ++m) {
          note = section[j];
          pitch = this.analyser.pitch(note.pitch);
          duration = this.analyser.duration(note.duration);
          computedNotes.push({
            note: note,
            x: x,
            y: y,
            pitch: pitch,
            duration: duration
          });
          x += this.analyser.estimateXSpan(note, section[j + 1]);
        }
        computedSections.push({
          notes: computedNotes,
          startX: startX,
          startY: startY,
          x: x += sectionPadding,
          y: y
        });
        nSectionsThisLine++;
        if (nSectionsThisLine >= sectionsPerLine) {
          y += heightPerLine;
          x = 0;
          nSectionsThisLine = 0;
        }
      }
      if (alignSections) {
        sectionWidth = (function() {
          var n, ref2, results;
          results = [];
          for (i = n = 0, ref2 = sectionsPerLine; n < ref2; i = n += 1) {
            results.push(0);
          }
          return results;
        })();
        nSectionsThisLine = 0;
        for (n = 0, len3 = computedSections.length; n < len3; n++) {
          section = computedSections[n];
          newWidth = section.x - section.startX;
          if (newWidth > sectionWidth[nSectionsThisLine]) {
            sectionWidth[nSectionsThisLine] = newWidth;
          }
          nSectionsThisLine = (nSectionsThisLine + 1) % sectionsPerLine;
        }
        sectionOffsets = [0];
        for (i = o = 0, ref2 = sectionWidth.length; o < ref2; i = o += 1) {
          sectionOffsets[i + 1] = sectionOffsets[i] + sectionWidth[i];
        }
        nSectionsThisLine = 0;
        for (p = 0, len4 = computedSections.length; p < len4; p++) {
          section = computedSections[p];
          xSpan = section.x - section.startX;
          newstartX = sectionOffsets[nSectionsThisLine];
          newx = sectionOffsets[nSectionsThisLine + 1];
          delta = (newx - newstartX - xSpan) / section.notes.length;
          ref3 = section.notes;
          for (i = q = 0, len5 = ref3.length; q < len5; i = ++q) {
            noteInfo = ref3[i];
            noteInfo.x = (noteInfo.x - section.startX) + delta * (i + 1) + newstartX;
          }
          section.startX = newstartX;
          section.x = newx;
          nSectionsThisLine = (nSectionsThisLine + 1) % sectionsPerLine;
        }
      }
      for (r = 0, len6 = computedSections.length; r < len6; r++) {
        section = computedSections[r];
        section.slurs = [];
        ref4 = section.notes;
        for (s = 0, len7 = ref4.length; s < len7; s++) {
          noteInfo = ref4[s];
          if (noteInfo.note.options != null) {
            slur = noteInfo.note.options.slur;
            if (slur === "start") {
              slurX = noteInfo.x + 20;
              slurY = noteInfo.y + 40 - 10 * noteInfo.pitch.nOctaves;
            } else if (slur === "end") {
              slurEndX = noteInfo.x + 20;
              slurEndY = noteInfo.y + 40 - 10 * noteInfo.pitch.nOctaves;
              section.slurs.push([slurX, slurY, slurEndX, slurEndY]);
            }
          }
        }
      }
      if (width == null) {
        nSectionsThisLine = 0;
        width = -1;
        lastWidth = 0;
        for (t = 0, len8 = computedSections.length; t < len8; t++) {
          section = computedSections[t];
          lastWidth += section.x - section.startX;
          nSectionsThisLine = nSectionsThisLine + 1;
          if (nSectionsThisLine === sectionsPerLine && width < lastWidth) {
            width = lastWidth;
            lastWidth = 0;
            nSectionsThisLine = 0;
          }
        }
        if (nSectionsThisLine < sectionsPerLine - 1 && currentSection.length > 0) {
          lastWidth += this.analyser.estimateSectionXSpan(currentSection);
        }
        if (width < lastWidth) {
          width = lastWidth;
        }
        width += sectionPadding;
      }
      if (height == null) {
        nLines = Math.ceil((computedSections.length + (currentSection.length > 0 ? 1 : 0)) / sectionsPerLine);
        height = nLines * heightPerLine + marginBottom;
      }
      return React.createElement("svg", {
        "width": width,
        "height": height
      }, React.createElement("text", {
        "x": 10,
        "y": 20,
        "className": "signature"
      }, song.key.left + "=" + song.key.right + " " + song.time.upper + "/" + song.time.lower), (function() {
        var len9, results, u;
        results = [];
        for (i = u = 0, len9 = computedSections.length; u < len9; i = ++u) {
          section = computedSections[i];
          notes = section.notes, slurs = section.slurs;
          results.push(React.createElement("g", {
            "key": i
          }, (function() {
            var len10, results1, v;
            results1 = [];
            for (j = v = 0, len10 = notes.length; v < len10; j = ++v) {
              noteInfo = notes[j];
              note = noteInfo.note, pitch = noteInfo.pitch, duration = noteInfo.duration;
              results1.push(React.createElement(Jianpu.Note, {
                "key": j,
                "note": note,
                "x": noteInfo.x,
                "y": noteInfo.y,
                "pitch": pitch,
                "duration": duration,
                "highlight": highlight === note
              }));
            }
            return results1;
          })(), (function() {
            var len10, results1, v;
            results1 = [];
            for (j = v = 0, len10 = slurs.length; v < len10; j = ++v) {
              slur = slurs[j];
              x1 = slur[0];
              y1 = slur[1];
              x2 = slur[2];
              y2 = slur[3];
              ctrl1X = x1 + 20;
              ctrl2X = x2 - 20;
              if (ctrl1X > ctrl2X) {
                ctrl1X = ctrl2X = (x1 + x2) / 2;
              }
              results1.push(React.createElement("path", {
                "key": i + "," + j,
                "className": "slur",
                "d": "M" + x1 + "," + y1 + " C" + ctrl1X + "," + (y1 - 20) + " " + ctrl2X + "," + (y2 - 20) + " " + x2 + "," + y2
              }));
            }
            return results1;
          })(), (barX = section.x, barY = section.y, i === sections.length - 1 && currentSection.length === 0 ? React.createElement("g", {
            "className": "doublebar-line"
          }, React.createElement("line", {
            "x1": barX - 7,
            "y1": 30 + barY,
            "x2": barX - 7,
            "y2": 110 + barY
          }), React.createElement("line", {
            "x1": barX,
            "y1": 30 + barY,
            "x2": barX,
            "y2": 110 + barY
          })) : React.createElement("g", {
            "className": "bar-line"
          }, React.createElement("line", {
            "x1": barX,
            "y1": 30 + barY,
            "x2": barX,
            "y2": 110 + barY
          })))));
        }
        return results;
      })(), (function() {
        var len9, results, u;
        results = [];
        for (i = u = 0, len9 = currentSection.length; u < len9; i = ++u) {
          note = currentSection[i];
          pitch = this.analyser.pitch(note.pitch);
          duration = this.analyser.duration(note.duration);
          comp = React.createElement(Jianpu.Note, {
            "key": i,
            "note": note,
            "x": x,
            "y": y,
            "pitch": pitch,
            "duration": duration
          });
          x += this.analyser.estimateXSpan(note, section[i + 1]);
          results.push(comp);
        }
        return results;
      }).call(this));
    }
  }
});

Jianpu.Note = React.createClass({displayName: "Note",
  render: function() {
    var accidental, accidentalText, duration, highlight, i, lyrics, main, nDashes, nDots, nOctaves, nUnderDashes, note, number, pitch, ref, x, y;
    ref = this.props, note = ref.note, x = ref.x, y = ref.y, pitch = ref.pitch, duration = ref.duration, highlight = ref.highlight;
    nOctaves = pitch.nOctaves, number = pitch.number, accidental = pitch.accidental;
    main = duration.main, nDashes = duration.nDashes, nDots = duration.nDots;
    lyrics = note.lyrics;
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
    accidentalText = (function() {
      switch (accidental) {
        case -2:
          return "♭♭";
        case -1:
          return "♭";
        case 0:
          return null;
        case 1:
          return "♯";
        case 2:
          return "♯♯";
      }
    })();
    return React.createElement("g", {
      "transform": "translate(" + x + ", " + y + ")"
    }, (highlight ? React.createElement("rect", {
      "className": "highlight",
      "x": 5,
      "y": 20,
      "width": 40 + 40 * nDashes + 10 * nDots,
      "height": 100
    }) : void 0), (accidentalText ? React.createElement("text", {
      "className": "accidental",
      "x": -5,
      "y": 80
    }, accidentalText) : void 0), React.createElement("text", {
      "className": "note",
      "x": 10,
      "y": 85
    }, number), ((function() {
      var k, l, ref1, ref2, results, results1;
      if (nOctaves > 0) {
        results = [];
        for (i = k = 0, ref1 = nOctaves; k < ref1; i = k += 1) {
          results.push(React.createElement("circle", {
            "key": i,
            "className": "octave octave-high",
            "cx": 20,
            "cy": 40 - 10 * i,
            "r": 3.5
          }));
        }
        return results;
      } else if (nOctaves < 0) {
        results1 = [];
        for (i = l = 0, ref2 = -nOctaves; l < ref2; i = l += 1) {
          results1.push(React.createElement("circle", {
            "key": i,
            "className": "octave octave-low",
            "cx": 20,
            "cy": 110 + nUnderDashes * 5 + 10 * i,
            "r": 3.5
          }));
        }
        return results1;
      }
    })()), (function() {
      var k, ref1, results;
      results = [];
      for (i = k = 0, ref1 = nDashes; k < ref1; i = k += 1) {
        results.push(React.createElement("line", {
          "key": i,
          "className": "length-dash",
          "x1": 50 + 40 * i,
          "y1": 70,
          "x2": 40 * i + 70,
          "y2": 70
        }));
      }
      return results;
    })(), (function() {
      var k, ref1, results;
      results = [];
      for (i = k = 0, ref1 = nUnderDashes; k < ref1; i = k += 1) {
        results.push(React.createElement("line", {
          "key": i,
          "className": "length-underline",
          "x1": 10,
          "y1": 95 + i * 5,
          "x2": 30,
          "y2": 95 + i * 5
        }));
      }
      return results;
    })(), (function() {
      var k, ref1, results;
      results = [];
      for (i = k = 0, ref1 = nDots; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
        results.push(React.createElement("circle", {
          "key": i,
          "className": "length-dot",
          "cx": 40 + 40 * nDashes + 10 * i,
          "cy": 70,
          "r": 3.5
        }));
      }
      return results;
    })(), (lyrics.exists ? React.createElement("text", {
      "className": "lyrics",
      "x": 10,
      "y": 135
    }, "" + (lyrics.hyphen ? "-" : "") + lyrics.content) : void 0));
  }
});
