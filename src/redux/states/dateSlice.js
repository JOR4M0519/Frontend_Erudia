import { createSlice } from "@reduxjs/toolkit";
import { getCurrentDateInTimeZone } from "../../utilities";


const initialState = {
  selectedDate: getCurrentDateInTimeZone("America/Bogota").toISOString(), //  Guardamos como string ISO
};

const dateSlice = createSlice({
  name: "date",
  initialState,
  reducers: {
    setDate: (state, action) => {
      state.selectedDate = new Date(action.payload).toISOString(); //  Guardamos como string ISO
    },
  },
});

export const { setDate } = dateSlice.actions;
export default dateSlice.reducer;
