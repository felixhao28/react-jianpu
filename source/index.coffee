parse = (m) ->
    notes = []
    base = c4
    lines = m.split("\n")
    isNum = {}
    for i in [0, 1, 2, 3, 4, 5, 6, 7]
        isNum[i] = true
    noteDelims = {}
    for deli in ["<", ">", "#", "b"]
        noteDelims[deli] = true
    lyricsDelims = {}
    for deli in [",", ".", ";", "?", "!", "(", ")", " ", undefined]
        lyricsDelims[deli] = true

    handleLastline = (line) ->
        {tempoLine, controlLine, lyricsLine, main} = line
        pitch = null
        extraDuration = 0
        options = {}
        accidental = 0
        lyrics = {}
        lastLyricsChar = undefined
        for c, i in main
            if i is main.length - 1 or pitch isnt null and (isNum[c] or noteDelims[c])
                if lyrics.exists
                    if i is main.length - 1
                        lyrics.content += lyricsLine.substr(i)
                    lyrics.content.trim()
                notes.push
                    pitch:
                        base: pitch
                        accidental: accidental
                    duration: duration + extraDuration
                    options: options
                    lyrics: lyrics
                options = {}
                pitch = null
                duration = null
                extraDuration = 0
                accidental = 0
                lyrics = {}

            tempo = tempoLine?[i]
            control = controlLine?[i]
            lyricsChar = lyricsLine?[i]
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
                    accidental = 1
                when "b"
                    accidental = -1

            switch control
                when "S"
                    options.slur = "start"
                when "s"
                    options.slur = "end"

            if isNum[c]
                duration =
                    switch tempo
                        when "-" then 4
                        when "=" then 2
                        else 8
            if lyricsChar? and not (isNum[c] and lyricsDelims[lyricsChar])
                if lyrics.exists
                    lyrics.content += lyricsChar
                else if lyricsChar isnt " "
                    lyrics.exists = true
                    lyrics.content = lyricsChar
                    lyrics.hyphen = lastLyricsChar not of lyricsDelims

            lastLyricsChar = lyricsChar

    lastLine = {}
    for i in [0...lines.length] by 1
        line = lines[i]
        if line[0] is "T"
            lastLine.tempoLine = line[1..]
        else if line[0] is "C"
            lastLine.controlLine = line[1..]
        else if line[0] is "L"
            lastLine.lyricsLine = line[1..]
        else if line[0] is "M"
            if lastLine.main
                handleLastline(lastLine)
                lastLine = {}
            lastLine.main = line[1..]
    if lastLine.main
        handleLastline(lastLine)
    notes

controlSyms:
    "S": "slur start"
    "s": "slur end"

rowyourboat = """
M1.   1.|  1   2    3.|   3  2   3    4|  5--|
T              -             -        -
LRow, row, row your boat, gently down the stream.
M<1.>5.| 3.     1.| 5   4 3  2|1--|
T                       -    -
C                   S   s 
L Ha ha, fooled ya, I'm a submarine.
"""

App = React.createClass
    mixins: [React.addons.LinkedStateMixin]

    getInitialState: ->
        alignSections: true
        melody: rowyourboat
        rawTime: "3/4"
        rawKey: "1=C"
        sectionsPerLine: 4
        song:
            melody: parse(rowyourboat)
            time:
                upper: 3
                lower: 4
            key:
                left: "1"
                right: "C"
        isPlaying: null
        volume: 30
        bpm: 120
        instrument: "piano"

    playNotes: (notes) ->
        i = 0
        playHelper = =>
            if i >= notes.length or @shouldStop
                @shouldStop = false
                @setState
                    isPlaying: null
            else
                note = notes[i]
                {pitch, duration} = note
                @setState
                    isPlaying: note
                {bpm, instrument, song} = @state
                crotchetDuration = 60 / bpm
                if pitch.base > 0
                    m = song.key.right.match(/(#|b)?([A-G])/)
                    if m[1] is "#"
                        base = 1
                    else if m[1] is "b"
                        base = -1
                    else
                        base = 0
                    number = (m[2].charCodeAt(0) - 60) % 7 + 1
                    base += numberMap[number]
                    diff = base + pitch.base + pitch.accidental - c4
                    unitPitch = diff %% 12
                    n = notesMap[unitPitch]
                    noteStr = String.fromCharCode(65 + (n.number + 1) % 7)
                    if n.accidental is 1
                        noteStr += "#"
                    nOctaves = Math.floor(diff / 12) + 4
                    Synth.play(instrument, noteStr, nOctaves, duration / 8 * crotchetDuration)
                setTimeout(playHelper, duration / 8 * crotchetDuration * 1000)
                i++
        playHelper()

    shouldStop: false
    stopPlaying: ->
        @shouldStop = true

    onClick: (e) ->
        {song} = @state
        melody = parse(@refs.input.getValue())
        song.melody = melody

        @setState
            song: song

    onChangeAlign: (e) ->
        @setState
            alignSections: e.target.checked

    onChangeKey: (e) ->
        rawKey = e.target.value
        @setState
            rawKey: rawKey
        if key = @parseKey(rawKey)
            @state.song.key = key
            @setState
                song: @state.song
    
    parseKey: (key) ->
        m = key.match /^([1-7])=((?:#|b)?[A-G])$/
        if m?
            left: m[1]
            right: m[2]
        else
            null

    onChangeTime: (e) ->
        rawTime = e.target.value
        @setState
            rawTime: rawTime
        time = @parseRowTime(rawTime)
        if time.upper > 0 and time.lower > 0
            @state.song.time = time
            @setState
                song: @state.song
    
    parseRowTime: (rawTime) ->
        iSplit = rawTime.indexOf("/")
        upper: parseInt(rawTime.substr(0, iSplit))
        lower: parseInt(rawTime.substr(iSplit + 1))

    validateTime: (rawTime) ->
        {upper, lower} = @parseRowTime(rawTime)
        if "#{upper}/#{lower}" is rawTime
            upper: upper
            lower: lower
        else
            null

    onChangeSPL: (e) ->
        @setState
            sectionsPerLine: parseInt(e.target.value)

    onChangeVolume: (v) ->
        Synth.setVolume(v / 100)
        @setState
            volume: v

    onChangeBPM: (e) ->
        @setState
            bpm: parseInt(e.target.value)

    instruments: ["piano", "organ", "acoustic", "edm"]

    onSelectInstrument: (eventKey) ->
        @setState
            instrument: eventKey

    onClickInstrument: (e) ->
        {volume, bpm, instrument} = @state
        crotchetDuration = 60 / bpm
        Synth.setVolume(volume / 100)
        Synth.play(instrument, "C", 4, crotchetDuration * 2)

    render: ->
        {song, melody, alignSections, rawTime, sectionsPerLine, isPlaying, volume, bpm, instrument, rawKey} = @state
        
        brand =
            <a href="https://github.com/felixhao28/react-jianpu" className="logo">
                react-jianpu
            </a>
        <div>
            <Navbar brand={brand}>
                <Nav>
                    <NavItem href="#" onClick={@onClick}>Refresh</NavItem>
                    {
                        if isPlaying
                            <NavItem href="#" onClick={@stopPlaying}>Stop</NavItem>
                        else
                            <NavItem href="#" onClick={@playNotes.bind(this, song.melody)}>Play</NavItem>
                    }
                </Nav>
            </Navbar>
            <Grid fluid>
                <Row>
                    <Col md={8}>
                        <Input groupClassName="markup-input" ref="input" type="textarea" label="Markup" defaultValue={melody} rows={10}/>
                    </Col>
                    <Col md={4}>
                        <PanelGroup defaultActiveKey="1" accordion>
                        <Panel header="General" eventKey="1">
                            <Input type="text" label="Key" placeholder="1=C" value={rawKey} onChange={@onChangeKey} bsStyle={if not @parseKey(rawKey)? then "error"}/>
                            <Input type="text" label="Time" placeholder="4/4" value={rawTime} onChange={@onChangeTime} bsStyle={if not @validateTime(rawTime) then "error"}/>
                            <Input type="checkbox" label="Align Sections" onChange={@onChangeAlign} checked={alignSections}/>
                            <Input type="number" label="Sections per line" placeholder="4" value={sectionsPerLine} onChange={@onChangeSPL}/>
                        </Panel>
                        <Panel header="Playback" eventKey="2">
                            <div className="form-group">
                                <label className="control-label">Volume</label>
                                <Slider
                                    min={0}
                                    max={100}
                                    step={1}
                                    value={volume}
                                    onSlide={@onChangeVolume}
                                    toolTip={true}
                                    formatter={(v) -> "#{v}%"}
                                />
                            </div>
                            <Input type="number" label="BPM" placeholder="120" value={bpm} onChange={@onChangeBPM}/>
                            <div className="form-group">
                                <label className="control-label">Instrument</label>
                                <SplitButton title={instrument} onSelect={@onSelectInstrument} onClick={@onClickInstrument}>
                                {
                                    for instr in @instruments
                                        <MenuItem key={instr} eventKey={instr}>{instr}</MenuItem>
                                }
                                </SplitButton>
                            </div>
                        </Panel>
                        </PanelGroup>
                    </Col>
                </Row>
            </Grid>
            <Panel header="Preview">
                <Jianpu
                    song={song}
                    sectionsPerLine={sectionsPerLine}
                    alignSections={alignSections}
                    highlight={isPlaying}
                />
            </Panel>
        </div>

React.render(<App />, document.getElementById("mycontainer"))