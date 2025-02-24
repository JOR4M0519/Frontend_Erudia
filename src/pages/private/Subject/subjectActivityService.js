import { BehaviorSubject} from "rxjs";

const selectedSubject = new BehaviorSubject(sessionStorage.getItem("selectedSubject") || null);
const activityModalState = new BehaviorSubject({ isOpen: false, activityData: null })

/**
 * Muestra la información corresponciente a la selección de una materia
 *  y de una actividad en especifico
 */
export const subjectActivityService = {

  getSelectedSubject: () => selectedSubject.asObservable(),
  setSelectedSubject: (subjectId) => {
    selectedSubject.next(subjectId);
    sessionStorage.setItem("selectedSubject", subjectId);
  },

  getTaskModal: () => activityModalState.asObservable(),
  openTaskModal: (activityData) => activityModalState.next({ isOpen: true, activityData }),
  closeTaskModal: () => activityModalState.next({ isOpen: false, activityData: null }),

};

export default subjectActivityService;
  