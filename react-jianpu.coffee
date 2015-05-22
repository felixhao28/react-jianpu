rest = -1

a0 = 21
b0 = 23

c1 = 24
d1 = 26
e1 = 28
f1 = 29
g1 = 31
a1 = 33
b1 = 35

c2 = 36
d2 = 38
e2 = 30
f2 = 31
g2 = 33
a2 = 35
b2 = 37

c3 = 48
d3 = 50
e3 = 52
f3 = 53
g3 = 55
a3 = 57
b3 = 59

c4 = 60
d4 = 62
e4 = 64
f4 = 65
g4 = 67
a4 = 69
b4 = 71

c5 = 72
d5 = 74
e5 = 76
f5 = 77
g5 = 79
a5 = 81
b5 = 83

notesMap =
    0:
        number: 1
        accidental: 0
    1: 
        number: 1
        accidental: 1
    2:
        number: 2
        accidental: 0
    3: 
        number: 2
        accidental: 1
    4:
        number: 3
        accidental: 0
    5: 
        number: 4
        accidental: 0
    6: 
        number: 4
        accidental: 1
    7: 
        number: 5
        accidental: 0
    8: 
        number: 5
        accidental: 1
    9: 
        number: 6
        accidental: 0
    10: 
        number: 6
        accidental: 1
    11: 
        number: 7
        accidental: 0

Jianpu = React.createClass
    getInitialState: ->
        sectionLength: 32
        notes: []

    componentDidMount: ->
        @setState
            notes: @props.notes

    analyser:
        pitch: (pitch) ->
            if pitch is rest
                nOctaves: 0
                number: 0
                accidental: 0
            else
                diff = pitch - c4
                unitPitch = diff %% 12

                nOctaves: Math.floor(diff / 12)
                number: notesMap[unitPitch].number
                accidental: notesMap[unitPitch].accidental

        duration: (duration) ->
            nCrotchets = Math.floor(duration / 8)
            remain = duration % 8

            if nCrotchets is 0
                switch remain
                    when 1, 2, 4
                        main: remain
                        nDashes: 0
                        nDots: 0
                    when 3
                        main: 2
                        nDashes: 0
                        nDots: 1
                    when 6
                        main: 4
                        nDashes: 0
                        nDots 1
                    when 7
                        main: 4
                        nDashes: 0
                        nDots: 2
                    else
                        throw "bad duration"
            else if nCrotchets is 1
                switch remain
                    when 0
                        main: 8
                        nDashes: 0
                        nDots: 0
                    when 4
                        main: 8
                        nDashes: 0
                        nDots: 1
                    when 6
                        main: 8
                        nDashes: 0
                        nDots 2
                    else
                        throw "bad duration"
            else if nCrotchets is 3
                switch remain
                    when 0
                        main: 8
                        nDashes: 2
                        nDots: 0
                    when 4
                        main: 8
                        nDashes: 2
                        nDots: 1
                    else
                        throw "bad duration"
            else
                switch remain
                    when 0
                        main: 8
                        nDashes: nCrotchets - 1
                        nDots: 0
                    else
                        throw "bad duration"

        estimateXSpan: (note, nextNote) ->
            duration = @duration(note[1])
            nextDuration =
                if nextNote
                    @duration(nextNote[1])
                else
                    null

            if duration.main is nextDuration?.main
                if duration.main < 8
                    20 + 10 * duration.nDots
                else
                    if duration.nDashes > 0
                        40 + 40 * duration.nDashes + 20 * duration.nDots
                    else
                        20 + 20 * duration.nDots
            else
                40 + 40 * duration.nDashes + 20 * duration.nDots

        estimateSectionXSpan: (section) ->
            if section.length is 0
                0
            else
                offset = 0
                for note, i in section
                    offset += @estimateXSpan(note, section[i + 1])

                offset + 40

    render: ->
        {sectionLength, notes} = @state
        {width, height} = @props
        offset = 0
        sections = []
        currentSection = []
        for note in notes
            duration = note[1]
            offset += duration
            currentSection.push note
            if offset % sectionLength is 0
                sections.push currentSection
                currentSection = []

        slurX = slurY = 0
        slurs = []
                
        x = y = 0

        comps = []
        for section, i in sections
            comps.push <g key={i}>
            {
                for note, j in section
                    pitch = @analyser.pitch(note[0])
                    duration = @analyser.duration(note[1])
                    if note.length > 2
                        slur = note[2].slur
                        if slur is "start"
                            slurX = x + 20
                            slurY = y + 40 - 10 * pitch.nOctaves
                        else if slur is "end"
                            slurEndX = x + 20
                            slurEndY = y + 40 - 10 * pitch.nOctaves
                            slurs.push [slurX, slurY, slurEndX, slurEndY]
                    comp = <Jianpu.Note key={j} note={note} x={x} y={y} pitch={pitch} duration={duration}/>
                    x += @analyser.estimateXSpan(note, section[j + 1])
                    comp
            }
            {
                for slur, j in slurs
                    x1 = slur[0]
                    y1 = slur[1]
                    x2 = slur[2]
                    y2 = slur[3]
                    <path key={"#{i},#{j}"} className="slur" d="M#{x1},#{y1} C#{x1+20},#{y1-20} #{x2-20},#{y2-20} #{x2},#{y2}" />
            }
                <line className="bar-line" x1={10 + x} y1={30 + y} x2={10 + x} y2={110 + y} />
            </g>
            x += 20
            slurs = []

        <svg width={width} height={height}>
            {comps}
            {
                for note, i in currentSection
                    pitch = @analyser.pitch(note[0])
                    duration = @analyser.duration(note[1])
                    comp = <Jianpu.Note key={i} note={note} x={x} y={y} pitch={pitch} duration={duration}/>
                    x += @analyser.estimateXSpan(note, section[i + 1])
                    comp
            }
        </svg>

Jianpu.Note = React.createClass

    render: ->
        {note, x, y, pitch, duration} = @props
        {nOctaves, number, accidental} = pitch
        {main, nDashes, nDots} = duration

        nUnderDashes =
            switch main
                when 4 then 1
                when 2 then 2
                when 1 then 3
                else 0
           
        <g transform={"translate(#{x}, #{y})"}>
            <text className="note" x={10} y={85}>{number}</text>
            {
                if nOctaves > 0
                    for i in [0...nOctaves] by 1
                        <circle key={i} className="octave octave-high" cx={20} cy={40 - 10 * i} r={3.5} />
                else if nOctaves < 0
                    for i in [0...-nOctaves] by 1
                        <circle key={i} className="octave octave-low" cx={20} cy={110 + nUnderDashes * 5 + 10 * i} r={3.5} />
            }
            {
                for i in [0...nDashes] by 1
                    <line key={i} className="length-dash" x1={50 + 40 * i} y1={70} x2={40 * i + 70} y2={70} />
            }
            {
                for i in [0...nUnderDashes] by 1
                    <line key={i} className="length-underline" x1={10} y1={95 + i * 5} x2={30} y2={95 + i * 5} />
            }
            {
                for i in [0...nDots]
                    <circle key={i} className="length-dot" cx={40 + 40 * nDashes + 10 * i} cy={70} r={3.5} />
            }
        </g>
