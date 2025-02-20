/* eslint-disable */
import { showAlert } from './alert.js';
import axios from 'axios';
export const login = async (email, password) => {
  try {
    const result = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    // go to home page after 1500 milleseconds
    if (result.data.status === 'success') {
      showAlert('success', 'successfully loging ✅');
      // go to home page after 1500 milleseconds
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', `${err.response.data.message}🔥`);
    window.setTimeout(() => {
      location.reload(true);
    }, 1500);
  }
};

