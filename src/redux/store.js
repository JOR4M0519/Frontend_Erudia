import { configureStore } from "@reduxjs/toolkit";
import userSliceReducer, { selectedUserReducer } from './states/user';
import dateSlice from './states/dateSlice';
//import dateReducer  from './states/dateSlice';

export default configureStore({
    reducer: {
      user: userSliceReducer,           //  Usuario bloqueado
      selectedUser: selectedUserReducer,
      date: dateSlice //  Usuario seleccionado
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false, //  Evita errores con datos serializables
      }),
    devTools: true
});
