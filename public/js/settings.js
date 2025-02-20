import axios from 'axios';
import { showAlert } from './alert';
export const updateSettings = async (type, data) => {
  try {
    let url =
      type == 'data'
        ? 'http://127.0.0.1:3000/api/v1/users/updateMe'
        : 'http://127.0.0.1:3000/api/v1/users/updateMyPassword';
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });
    if (res.data.status === 'success') {
      showAlert('success', `updated ${type.toUpperCase()} successfully!!!`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
