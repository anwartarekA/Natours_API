import { login } from './login';
import { validateLogin } from './validationsLogin';
import { signup } from './signup';
import { validationSignup } from './validationsSignup';
import { displayMap } from './mapBox';
import { logoutAct } from './logout';
import { validationProfile } from './accountValidation';
import { updateSettings } from './settings';
import { chargeCreditCard } from './stripe';

// elements
let updateME = document.querySelector('.update-mynameing');
let email = document.querySelector('.update-mymail');
let currentPassword = document.querySelector('.current-password');
let newPassword = document.querySelector('.new-password');
let confirmPAssword = document.querySelector('.confirm-password');
let form = document.querySelector('.formloginOrsignup');
let updateData = document.querySelector('.updateData');
let updatePasswords = document.querySelector('.updatePasswords');
const buyBtn = document.querySelector('.inner-link');
if (form) {
  form.addEventListener('submit', (e) => {
    let email = document.querySelector('#email').value;
    let password = document.querySelector('#pass').value;
    e.preventDefault();
    if (!document.querySelector('#name')) {
      login(email, password);
    } else {
      signup(
        document.querySelector('#name').value,
        email,
        password,
        document.querySelector('#confirmPass').value,
      );
    }
  });
  if (!document.querySelector('#confirmPass') && !updateME) validateLogin();
  else if (document.querySelector('#confirmPass') && !updateME)
    validationSignup();
}
const locEle = document.getElementById('map');
if (locEle) {
  const locations = JSON.parse(locEle.dataset.locations);
  mapboxgl.accessToken =
    'pk.eyJ1IjoiYW53YXItdGFyZWsxMjMiLCJhIjoiY20zdW1wM2V5MGpkZDJrczUwNHg5enowZiJ9.YR1WGDizc4k24svThskBQQ';
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/anwar-tarek123/cm3vpqcgm00e401sd8eha05vb',
    scrollZoom: false,
  });
  displayMap(locations, map);
}
//logout
let outBtn = document.querySelector('.nav__el1');
if (outBtn) {
  outBtn.addEventListener('click', logoutAct);
}
if (updateME) {
  validationProfile(
    updateME,
    email,
    currentPassword,
    newPassword,
    confirmPAssword,
  );
}
if (updateData) {
  updateData.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.querySelector('.update-mynameing').value);
    form.append('email', document.querySelector('.update-mymail').value);
    form.append('photo', document.getElementById('photo').files[0]);
    updateSettings('data', form);
  });
}
if (updatePasswords) {
  updatePasswords.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.submitPass').textContent = 'Updating...';
    let currentPassword = document.querySelector('.current-password').value;
    let password = document.querySelector('.new-password').value;
    let passwordConfirm = document.querySelector('.confirm-password').value;
    await updateSettings('password', {
      currentPassword,
      password,
      passwordConfirm,
    });
    document.querySelector('.submitPass').textContent = 'save password';
    document.querySelector('.current-password').value = '';
    document.querySelector('.new-password').value = '';
    document.querySelector('.confirm-password').value = '';
  });
}
if (buyBtn) {
  buyBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    chargeCreditCard(tourId);
  });
}
