/* eslint-disable */
export const validateLogin = () => {
  let email = document.querySelector('.email');
  let password = document.querySelector('.pass');
  let regEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  email.addEventListener('input', function () {
    regEx.test(this.value)
      ? (email.style.borderBottom = '3px solid green')
      : (email.style.borderBottom = '3px solid orange');
  });
  password.addEventListener('input', function () {
    if (this.value.length >= 8) {
      password.style.borderBottom = '3px solid green';
    } else {
      password.style.borderBottom = '3px solid orange';
    }
  });
};