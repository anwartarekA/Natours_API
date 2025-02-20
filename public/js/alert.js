/* eslint-disable */
// display alert
const hideAlert = () => {
  const ele = document.querySelector('.alert');
  if (ele) ele.parentElement.removeChild(ele);
};
// show alert
export const showAlert = (type, msg) => {
  hideAlert();
  const markUP = `<div class='alert alert--${type}'>${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markUP);
  window.setTimeout(hideAlert, 2000);
};
