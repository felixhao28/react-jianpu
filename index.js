var App, letitgo, parse;

parse = function(m) {
  var base, c, duration, extraDuration, i, isNum, line, lineFrags, lines, main, noteDelims, notes, options, pitch, ret, tempo, tempoLine, _i, _j, _len, _len1;
  ret = [];
  base = c4;
  lines = m.split("\n\n");
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
    "|": true
  };
  for (_i = 0, _len = lines.length; _i < _len; _i++) {
    line = lines[_i];
    lineFrags = line.split("\n");
    main = lineFrags[0];
    tempoLine = lineFrags[1];
    notes = [];
    ret.push(notes);
    pitch = null;
    extraDuration = 0;
    options = {};
    for (i = _j = 0, _len1 = main.length; _j < _len1; i = ++_j) {
      c = main[i];
      if (pitch !== null && (isNum[c] || noteDelims[c])) {
        notes.push([pitch, duration + extraDuration, options]);
        options = {};
        pitch = null;
        duration = null;
        extraDuration = 0;
      }
      tempo = tempoLine[i];
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
          switch (tempo) {
            case "S":
              options.slur = "start";
              break;
            case "s":
              options.slur = "end";
          }
      }
      if (isNum[c]) {
        duration = (function() {
          switch (tempo) {
            case " ":
              return 8;
            case "-":
              return 4;
            case "=":
              return 2;
            default:
              return 8;
          }
        })();
      }
    }
  }
  return ret;
};

letitgo = "055<11#|1#>55<12#|2#21221|2343.>|\n -   -S|-s     -S| s--- -|-     |\n\n055<11#|1#>551<2#|2---|2-2#01|\n -   -S|-s     -S|    |  -s- |\n\n23.4.#|4#-0>67<1#|1#->05<32#|2-2#01|>66667<1|\n     S| s - -- -S| s  -- --S|  -s- |  ---  -|\n\n1->067<1#|1-#0>5<32#|2-#012|3.3433|1--0|\n   --- -S   s- - --S   s --   -- -\n\n5.3.2#|2.#011|5.3.1#|1-#01|\n     S   s-        S   s\n\n>7.5.5#|5-#0>6<|4434344|31000|\n      S   s      ------ - -\n\n0000|0000|0333311|1-01|\n          ----- -\n\n5.432#|2-#0121|3.356#|6#55.05|\n    -S   s----     -S -s   --|\n\n<1.>7.6#|6---#|\n       S     s\n\n055<11#|1#>55<12#|2#21221|23431>|\n -   -S|-s     -S| s--- -|-   - |\n\n055<11#|1#>55<12#|2-2#34#|4---#|\n -   -S|-s     -S|  -s -S     s\n\n4->067<1#|1-#0>5<32#|2-2#01|>66667<1|\n   --- -S   s- - --S   -s -   ---  -\n\n1->067<1#|1#-0>5<32#|2#-012|3.3431|\n   --- -S  s - - --S  s  --   -- -\n\n1--0|5.3.2|2.011|5.3.1|\n              -\n\n1--11|>7.<1.5#|5--#0|0000|\n   --";

App = React.createClass({
  getInitialState: function() {
    return {
      notes: letitgo
    };
  },
  onChange: function(e) {
    return this.setState({
      notes: e.target.value
    });
  },
  render: function() {
    var i, line, lines, notes;
    notes = this.state.notes;
    lines = parse(notes);
    return React.createElement("div", null, React.createElement("textarea", {
      "value": notes,
      "onChange": this.onChange,
      "rows": 10.,
      "cols": 100.
    }), React.createElement("br", null), React.createElement("table", null, (function() {
      var _i, _len, _results;
      _results = [];
      for (i = _i = 0, _len = lines.length; _i < _len; i = ++_i) {
        line = lines[i];
        _results.push(React.createElement("tr", {
          "key": i
        }, React.createElement("td", null, React.createElement(Jianpu, {
          "notes": line,
          "width": 1000.,
          "height": 150.
        }))));
      }
      return _results;
    })()));
  }
});

React.render(React.createElement(App, null), document.getElementById("mycontainer"));
