import React, { Component } from 'react';
import PropTypes from 'prop-types';

class RecaptchaInput extends Component {
  constructor(props) {
    super(props);
    this.mount = false;
    this.recaptchaEl = null;
    this.recaptchaId = null;
    this.state = {
      recaptchaReady: false,
    };
    this.checkRecaptchaReady = this.checkRecaptchaReady.bind(this);
  }
  checkRecaptchaReady() {
    const { onResponse, sitekey } = this.props;
    const { mount, recaptchaEl } = this;
    if (!mount) return;
    if (window.recaptchaReady) {
      this.setState({
        recaptchaReady: true,
      });
      this.recaptchaId = window.grecaptcha.render(recaptchaEl, {
        sitekey,
        callback: onResponse,
      });
      return;
    }
    window.setTimeout(this.checkRecaptchaReady, 500);
  }
  componentDidMount() {
    this.mount = true;
    this.checkRecaptchaReady();
  }
  componentWillUnmount() {
    this.mount = false;
  }
  componentWillReceiveProps(nextProps) {
    const { resetCount } = this.props;
    const { recaptchaId } = this;
    if (resetCount === nextProps.resetCount) return;
    window.grecaptcha.reset(recaptchaId);
  }
  shouldComponentUpdate() {
    return false;
  }
  render() {
    return (
      <div
        ref={(elementEl) => { this.recaptchaEl = elementEl; }}
      />
    );
  }
}
RecaptchaInput.propTypes = {
  onResponse: PropTypes.func.isRequired,
  resetCount: PropTypes.number.isRequired,
  sitekey: PropTypes.string.isRequired,
};
export default RecaptchaInput;
