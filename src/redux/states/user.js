import { createSlice } from '@reduxjs/toolkit';
import { clearStorage, getStorage, persistStorage } from '../../utilities';

export const EmptyUserState = {
    id: null,
    token: '',
    name: '',
    username: '',
    email: '',
    roles: []
};

export const UserKey = 'user';
export const SelectedUserKey = 'selectedUser';

export const userSlice = createSlice({
  name: UserKey,
  
  initialState: 
  localStorage.getItem(UserKey) ? 
  JSON.parse(localStorage.getItem(UserKey)) : EmptyUserState,
  
  reducers: {
    createUser: (state, action) => {
      persistStorage(UserKey, action.payload);
      const selectedUserData = {
        id: action.payload.id,
        roles: action.payload.roles, 
        name: action.payload.name
      };

      persistStorage(SelectedUserKey, selectedUserData);

      return action.payload;
    },
    updateUser: (state, action) => {
      const result = { ...state, ...action.payload };
      persistStorage(UserKey, result);
      return result;
    },
    resetUser: () => {
      sessionStorage.clear()
      clearStorage(UserKey);
      clearStorage(SelectedUserKey); // 🔹 También limpiamos el usuario seleccionado
      return EmptyUserState;
    }
  }
});


export const selectedUserSlice = createSlice({
  name: SelectedUserKey,
  
  initialState: 
  localStorage.getItem(SelectedUserKey) ? 
  JSON.parse(localStorage.getItem(SelectedUserKey)) : EmptyUserState,
  
  reducers: {
    setSelectedUser: (state, action) => {
      persistStorage(SelectedUserKey, action.payload);
      return action.payload;
    },
    clearSelectedUser: () => {
      clearStorage(SelectedUserKey);
      return EmptyUserState;
    }
  }
});

export const { createUser, updateUser, resetUser } = userSlice.actions;
export const { setSelectedUser, clearSelectedUser } = selectedUserSlice.actions;

export default userSlice.reducer;
export const selectedUserReducer = selectedUserSlice.reducer;
