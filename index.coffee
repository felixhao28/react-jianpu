parse = (m) ->
    ret = []
    base = c4
    lines = m.split("\n\n")
    isNum =
        "0": true
        "1": true
        "2": true
        "3": true
        "4": true
        "5": true
        "6": true
        "7": true
    noteDelims =
        "<": true
        ">": true
        "|": true

    for line in lines
        lineFrags = line.split("\n")
        main = lineFrags[0]
        tempoLine = lineFrags[1]
        notes = []
        ret.push notes
        pitch = null
        extraDuration = 0
        options = {}
        for c, i in main
            if pitch isnt null and (isNum[c] or noteDelims[c])
                notes.push [pitch, duration + extraDuration, options]
                options = {}
                pitch = null
                duration = null
                extraDuration = 0
            tempo = tempoLine[i]
            switch c
                when "0"
                    pitch = rest
                when "1"
                    pitch = base
                when "2"
                    pitch = base + 2
                when "3"
                    pitch = base + 4
                when "4"
                    pitch = base + 5
                when "5"
                    pitch = base + 7
                when "6"
                    pitch = base + 9
                when "7"
                    pitch = base + 11
                when "<"
                    base += 12
                when ">"
                    base -= 12
                when "-"
                    extraDuration += 8
                when "."
                    extraDuration += duration / 2
                when "#"
                    switch tempo
                        when "S"
                            options.slur = "start"
                        when "s"
                            options.slur = "end"
            if isNum[c]
                duration =
                    switch tempo
                        when " " then 8
                        when "-" then 4
                        when "=" then 2
                        else 8

    ret
            

letitgo = """
055<11#|1#>55<12#|2#21221|2343.>|
 -   -S|-s     -S| s--- -|-     |

055<11#|1#>551<2#|2---|2-2#01|
 -   -S|-s     -S|    |  -s- |

23.4.#|4#-0>67<1#|1#->05<32#|2-2#01|>66667<1|
     S| s - -- -S| s  -- --S|  -s- |  ---  -|

1->067<1#|1-#0>5<32#|2-#012|3.3433|1--0|
   --- -S   s- - --S   s --   -- -

5.3.2#|2.#011|5.3.1#|1-#01|
     S   s-        S   s

>7.5.5#|5-#0>6<|4434344|31000|
      S   s      ------ - -

0000|0000|0333311|1-01|
          ----- -

5.432#|2-#0121|3.356#|6#55.05|
    -S   s----     -S -s   --|

<1.>7.6#|6---#|
       S     s

055<11#|1#>55<12#|2#21221|23431>|
 -   -S|-s     -S| s--- -|-   - |

055<11#|1#>55<12#|2-2#34#|4---#|
 -   -S|-s     -S|  -s -S     s

4->067<1#|1-#0>5<32#|2-2#01|>66667<1|
   --- -S   s- - --S   -s -   ---  -

1->067<1#|1#-0>5<32#|2#-012|3.3431|
   --- -S  s - - --S  s  --   -- -

1--0|5.3.2|2.011|5.3.1|
              -

1--11|>7.<1.5#|5--#0|0000|
   --
"""


App = React.createClass
    getInitialState: ->
        notes: letitgo

    onChange: (e) ->
        @setState
            notes: e.target.value

    render: ->
        {notes} = @state
        lines = parse(notes)
        
        <div>
            <textarea value={notes} onChange={@onChange} rows={10} cols={100}/>
            <br />
            <table>
            {
                for line, i in lines
                    <tr key={i}>
                        <td><Jianpu notes={line} width={1000} height={150}/></td>
                    </tr>
            }
            </table>
        </div>

React.render(<App />, document.getElementById("mycontainer"))