/* eslint-disable */
import { showAlert } from './alert.js';
import axios from 'axios';
export const signup = async (name, email, password, passwordConfirm) => {
  try {
    const result = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });
    console.log(result);
    if (result.data.status === 'success') {
      showAlert('success', 'successfully regiser ✅');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', `${err.response.data.message} 🔥`);
    window.setTimeout(() => {
      location.reload(true);
    }, 1500);
  }
};