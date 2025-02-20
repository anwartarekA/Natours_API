// eslint-disable
export const validationProfile = (
  updateME,
  email,
  currentPassword,
  newPassword,
  confirmPAssword,
) => {

  // validation for name
  updateME.addEventListener('input', function (e) {
    if (e.target.value.length >= 1) {
      updateME.style.borderBottom = 'solid 2px #28b487';
    } else {
      updateME.style.borderBottom = 'solid 2px orange';
    }
  });
  // validation for email
  let regEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  email.addEventListener('input', function () {
    regEx.test(this.value)
      ? (email.style.borderBottom = 'solid 2px #28b487')
      : (email.style.borderBottom = 'solid 2px orange');
  });
  // validation for passwords
  currentPassword.addEventListener('input', function () {
    if (this.value.length >= 8) {
      this.style.borderBottom = 'solid 2px #28b487';
    } else {
      this.style.borderBottom = 'solid 2px orange';
    }
  });
  newPassword.addEventListener('input', function () {
    if (this.value.length >= 8) {
      newPassword.style.borderBottom = 'solid 2px #28b487';
    } else {
      newPassword.style.borderBottom = 'solid 2px orange';
    }
  });
  confirmPAssword.addEventListener('input', function () {
    if (this.value.length >= 8) {
      this.style.borderBottom = 'solid 2px #28b487';
    } else {
      this.style.borderBottom = 'solid 2px orange';
    }
  });
};
