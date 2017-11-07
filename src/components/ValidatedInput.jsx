import React from 'react';
import { PropTypes } from 'prop-types';

const ValidatedInput = ({ input, placeholder, disabled, meta: { touched, error }, type }) => (
  <span>
    <input
      {...input}
      placeholder={placeholder}
      type={type}
      disabled={disabled}
    />
  {error && touched && <span>{error}</span>}
  </span>
);
ValidatedInput.propTypes = {
  input: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
  placeholder: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
  type: PropTypes.string.isRequired,
};
export default ValidatedInput;
