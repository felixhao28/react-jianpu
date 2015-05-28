Slider = React.createClass
    propTypes:
        id: React.PropTypes.string
        min: React.PropTypes.number
        max: React.PropTypes.number
        step: React.PropTypes.number
        value: React.PropTypes.number.isRequired
        formatter: React.PropTypes.func
        onSlide: React.PropTypes.func

    getDefaultProps: ->
        min: 0
        max: 100
        step: 1
        value: 50
        formatter: null
        onSlide: ->

    componentWillUpdate: (nextProps, nextState) ->
        nextState.slider.setValue(nextProps.value)

    componentDidMount: ->
        {formatter, id, min, max, step, value} = @props
        slider = new BootstrapSlider @getDOMNode(),
            id: id
            min: min
            max: max
            step: step
            value: value
            formatter: formatter
        
        slider.on "slide", (event) =>
            @props.onSlide(event)
            @state.slider.setValue(event)

        slider.on "slideStop", (event) =>
            @props.onSlide(event)
            @state.slider.setValue(event)

        @setState
            slider: slider

    render: ->
        <div />
