import React, { Component } from 'react'
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';
import register from '../apis/register';
import { Field, reset, SubmissionError, reduxForm } from 'redux-form'
import ValidatedInput from './ValidatedInput';
import RecaptchaInput from './RecaptchaInput';

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
function RegisterFormView({
  handleRecaptchaResponse,
  handleSubmit,
  recaptchaResetCount,
  recaptchaResponded,
  submitFailed,
  submitting,
  valid,
  recaptchaWrong,
}) {
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
      <RecaptchaInput
        onResponse={handleRecaptchaResponse}
        resetCount={recaptchaResetCount}
        sitekey={RECAPTCHA_SITE_KEY}
      />
    {recaptchaWrong && <div>Wrong Recaptcha</div>}
      {submitFailed && !submitting && <div>Failed to add</div>}
      <button type="submit" disabled={!valid || submitting || !recaptchaResponded}>Submit</button>
    </form>
  );
}
RegisterFormView.propTypes = {
  handleRecaptchaResponse: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  recaptchaResetCount: PropTypes.number.isRequired,
  recaptchaResponded: PropTypes.bool.isRequired,
  recaptchaWrong: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  submitFailed: PropTypes.bool.isRequired,
  valid: PropTypes.bool.isRequired,
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
    this.handleRecaptchaResponse = this.handleRecaptchaResponse.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      recaptchaResetCount: 0,
      recaptchaResponse: null,
      recaptchaWrong: false,
    };
  }
  handleRecaptchaResponse(response) {
    const { recaptchaResetCount } = this.state;
    this.setState({
      recaptchaResetCount,
      recaptchaResponse: response,
      recaptchaWrong: false,
    });
  }
  handleSubmit(data) {
    const { resetForm } = this.props;
    const { recaptchaResetCount, recaptchaResponse } = this.state;
    data.gRecaptchaResponse = recaptchaResponse;
    this.setState({
      recaptchaResetCount: recaptchaResetCount + 1,
      recaptchaResponse: null,
      recaptchaWrong: false,
    });
    return register(data)
      .then(
        () => {
          resetForm();
        },
        (error) => {
          if (error.message === 'email_taken') throw new SubmissionError({ email: 'Email taken' });
          if (error.message === 'wrong_captcha') {
            this.setState({
              recaptchaResetCount,
              recaptchaResponse: null,
              recaptchaWrong: true,
            });
          }
          throw new SubmissionError({});
        },
      )
  }
  render() {
    const { recaptchaResetCount, recaptchaResponse, recaptchaWrong } = this.state;
    const { handleRecaptchaResponse, handleSubmit } = this;
    return (
      <RegisterFormRedux
        handleRecaptchaResponse={handleRecaptchaResponse}
        recaptchaResetCount={recaptchaResetCount}
        recaptchaResponded={recaptchaResponse !== null}
        recaptchaWrong={recaptchaWrong}
        onSubmit={handleSubmit}
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
