import React, { Component } from 'react'
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';
import register from '../apis/register';
import { Field, reset, SubmissionError, reduxForm } from 'redux-form'
import ValidatedInput from './ValidatedInput';

const FORM = 'register';
const RECAPTCHA_SITE_KEY = '6LcDhzcUAAAAAD3fNalyA9gRcopXUhudBoNRNGQI';
const required = value => (value ? undefined : 'Required');
const maxLength = max => value =>
  value && value.length > max ? `Must be ${max} characters or less` : undefined;
const maxLength50 = maxLength(50);
const maxLength255 = maxLength(255);
export const minLength = min => value =>
  value && value.length < min ? `Must be ${min} characters or more` : undefined;
const minLength6 = minLength(6);
const email = value =>
  value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)
    ? 'Invalid email address'
    : undefined;
class RegisterFormView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recaptchaReady: false,
    };
    this.checkRecaptchaReady = this.checkRecaptchaReady.bind(this);
  }
  checkRecaptchaReady() {
    if (window.recaptchaReady) {
      this.setState({
        recaptchaReady: true,
      });
      window.grecaptcha.render('recaptcha', {
        'sitekey' : RECAPTCHA_SITE_KEY,
      });
      return;
    }
    window.setTimeout(this.checkRecaptchaReady, 500);
  }
  componentDidMount() {
    this.checkRecaptchaReady();
  }
  render() {
    const { handleSubmit, submitFailed, submitting, valid, wrongRecaptcha } = this.props;
    const { recaptchaReady } = this.state;
    return (
      <form onSubmit={ handleSubmit }>
        <div>
          <label htmlFor="firstName">First Name</label>
          <Field
            component={ValidatedInput}
            disabled={submitting}
            name="firstName"
            props={{ placeholder: 'First Name' }}
            type="text"
            validate={[required, maxLength50]}
          />
        </div>
        <div>
          <label htmlFor="lastName">Last Name</label>
          <Field
            component={ValidatedInput}
            disabled={submitting}
            name="lastName"
            props={{ placeholder: 'Last Name' }}
            type="text"
            validate={[required, maxLength50]}
          />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <Field
            component={ValidatedInput}
            disabled={submitting}
            name="email"
            props={{ placeholder: 'Email' }}
            type="email"
            validate={[required, email, maxLength255]}
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <Field
            component={ValidatedInput}
            disabled={submitting}
            name="password"
            props={{ placeholder: 'Password' }}
            type="password"
            validate={[required, minLength6]}
          />
        </div>
        <div>
          <label htmlFor="passwordConfirm">Password Confirm</label>
          <Field
            component={ValidatedInput}
            disabled={submitting}
            name="passwordConfirm"
            props={{ placeholder: 'Password Confirm' }}
            type="password"
            validate={[required, minLength6]}
          />
        </div>
        <div>
          <label htmlFor="signupType">Signup Type</label>
          <Field
            component={ValidatedInput}
            disabled={submitting}
            name="signupType"
            props={{ placeholder: 'Signup Type' }}
            type="text"
            validate={[required]}
          />
        </div>
        <div
          id="recaptcha"
          style={{ visibility: recaptchaReady ? 'visible' : 'hidden' }}
        />
        {wrongRecaptcha && <div>Wrong Recaptcha</div>}
        {submitFailed && !submitting && <div>Failed to add</div>}
        <button type="submit" disabled={!valid || submitting || !recaptchaReady}>Submit</button>
      </form>
    );
  }
}
RegisterFormView.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  submitFailed: PropTypes.bool.isRequired,
  valid: PropTypes.bool.isRequired,
  wrongRecaptcha: PropTypes.bool.isRequired,
};
const RegisterFormRedux = reduxForm({
  form: FORM,
  validate: ({ password, passwordConfirm }) => {
    const errors = {};
    if (
      password !== undefined &&
      passwordConfirm !== undefined &&
      password !== passwordConfirm
    ) errors.passwordConfirm = 'Does not match password'
    return errors;
  },
})(RegisterFormView);
class RegisterForm extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      wrongRecaptcha: false,
    };
  }
  handleSubmit(data) {
    const { resetForm } = this.props;
    data['gRecaptchaResponse'] = document.getElementById('g-recaptcha-response').value;
    this.setState({
      wrongRecaptcha: false,
    });
    window.grecaptcha.reset();
    return register(data)
      .then(
        () => {
          resetForm();
        },
        (error) => {
          if (error.message === 'email_taken') throw new SubmissionError({ email: 'Email taken' });
          if (error.message === 'wrong_captcha') {
            this.setState({
              wrongRecaptcha: true,
            });
          }
          throw new SubmissionError({});
        },
      )
  }
  render() {
    const { wrongRecaptcha } = this.state;
    return (
      <RegisterFormRedux
        onSubmit={this.handleSubmit}
        wrongRecaptcha={wrongRecaptcha}
      />
    );
  }
};
RegisterForm.propTypes = {
  resetForm: PropTypes.func.isRequired,
};
export default connect(
  null,
  {
    resetForm: () => reset(FORM),
  }
)(RegisterForm);
