var Slider;

Slider = React.createClass({
  propTypes: {
    id: React.PropTypes.string,
    min: React.PropTypes.number,
    max: React.PropTypes.number,
    step: React.PropTypes.number,
    value: React.PropTypes.number.isRequired,
    formatter: React.PropTypes.func,
    onSlide: React.PropTypes.func
  },
  getDefaultProps: function() {
    return {
      min: 0,
      max: 100,
      step: 1,
      value: 50,
      formatter: null,
      onSlide: function() {}
    };
  },
  componentWillUpdate: function(nextProps, nextState) {
    return nextState.slider.setValue(nextProps.value);
  },
  componentDidMount: function() {
    var formatter, id, max, min, slider, step, value, _ref;
    _ref = this.props, formatter = _ref.formatter, id = _ref.id, min = _ref.min, max = _ref.max, step = _ref.step, value = _ref.value;
    slider = new BootstrapSlider(this.getDOMNode(), {
      id: id,
      min: min,
      max: max,
      step: step,
      value: value,
      formatter: formatter
    });
    slider.on("slide", (function(_this) {
      return function(event) {
        _this.props.onSlide(event);
        return _this.state.slider.setValue(event);
      };
    })(this));
    slider.on("slideStop", (function(_this) {
      return function(event) {
        _this.props.onSlide(event);
        return _this.state.slider.setValue(event);
      };
    })(this));
    return this.setState({
      slider: slider
    });
  },
  render: function() {
    return React.createElement("div", null);
  }
});
