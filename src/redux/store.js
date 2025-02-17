import { configureStore } from "@reduxjs/toolkit";
import userSliceReducer, { selectedUserReducer } from './states/user';

export default configureStore({
    reducer: {
      user: userSliceReducer,           // 🔹 Usuario bloqueado
      selectedUser: selectedUserReducer // 🔹 Usuario seleccionado
    },
    devTools: true
});
