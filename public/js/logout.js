/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';
export const logoutAct = async () => {
  try {
    const result = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users/logout',
    });
    if (result.data.status === 'success') {
      showAlert('success', 'Successfully logged out ✅');
      window.setTimeout(() => {
        location.assign('/');
      }, 2000);
    }
  } catch (err) {
    // error in case of no internet as there is no error at logging out
    console.log(err);
    showAlert('error', 'No Internet please connect first ');
  }
};
