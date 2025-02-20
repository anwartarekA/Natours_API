/* eslint-disable */
export const validationSignup = () => {
  let email = document.querySelector('.email');
  let password = document.querySelector('.pass');
  let confirmPassword = document.querySelector('.confirm-pass');
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
  confirmPassword.addEventListener('input', function () {
    if (this.value.length >= 8) {
      confirmPassword.style.borderBottom = '3px solid green';
    } else {
      confirmPassword.style.borderBottom = '3px solid orange';
    }
  });
}