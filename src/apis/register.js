import 'whatwg-fetch';

const URL = 'https://charterhook.app/api/register';
export default ({
  firstName,
  lastName,
  email,
  gRecaptchaResponse,
  password,
  signupType,
}) => {
  return window.fetch(URL, {
    body: window.JSON.stringify({
      'first_name': firstName,
      'last_name': lastName,
      'email': email,
      'g-recaptcha-response': gRecaptchaResponse,
      'password': password,
      'signup-type': signupType,
    }),
    headers: {
     'Content-Type': 'application/json',
    },
    method: 'POST',
  } )
  .then(response => Promise.all([
    Promise.resolve(response.status),
    response.json(),
  ]))
  .then(([status, data]) => {
    if (status === 200) return null;
    if (status === 409) throw new Error(data[0]);
    throw new Error('unexpected');
  });
};
