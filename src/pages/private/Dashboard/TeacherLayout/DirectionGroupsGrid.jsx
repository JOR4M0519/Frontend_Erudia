import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { StudentList } from "./";
import { BackButton } from "../../../../components";
import { useNavigate } from "react-router-dom";
import { teacherDataService } from "../StudentLayout";
import { subjectActivityService } from "../../Subject";
import { PrivateRoutes, Roles } from "../../../../models";
import SubjectHeader from "../../Subject/SubjectHeader";
import { setSelectedUser } from "../../../../redux/states/user";
import { encryptData } from "../../../../utilities";
import { GradesStudentModal } from "../../Grading";



const DirectionGroupsGrid = () => {
  const [students, setStudents] = useState([]);
  const userState = useSelector((store) => store.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  // Estado para controlar el modal y el estudiante seleccionado
  const [showGradesModal, setShowGradesModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(-1);

  // 🔹 Suscribirse a la materia seleccionada
  useEffect(() => {
    const subjectSubscription = subjectActivityService
      .getSelectedSubject()
      .subscribe((subjectString) => {
        if (subjectString) {
          setSelectedGroup(JSON.parse(subjectString));
        }
      });
    return () => subjectSubscription.unsubscribe();
  }, []);

  // 🔹 Obtener la lista de estudiantes al cargar el componente
  useEffect(() => {
    const subscription = teacherDataService
      .getStudentGroupListData()
      .subscribe((data) => {
        if (data?.studentGroupList?.students) {
          setStudents(data?.studentGroupList?.students);
        }
      });
    return () => subscription.unsubscribe();
  }, []);

  const onclickStudent = (student) => {


    // Encontrar el índice del estudiante en la lista
    const studentIndex = students.findIndex(s => s.id === student.id);

    // Crear objeto con los datos relevantes del estudiante
    const selectedStudentObj = {
      id: student.id,
      name: student.name,
      email: student.email ?? "NA",
      roles: [encryptData(Roles.TEACHER),] ?? "NA",
      // Agrega otros campos si los necesitas
    };
    dispatch(setSelectedUser(selectedStudentObj)); // Enviar el objeto completo al estado global
    setSelectedStudent(selectedStudentObj);
    setSelectedStudentIndex(studentIndex);
    setShowGradesModal(true); // Abrir el modal en lugar de navegar
    console.log(`Cambiando estudiante a ${selectedStudentObj.id}`);
  };


console.log(students)
  return (
    <div className="space-y-6">
      {/* 🔹 Header */}
      <SubjectHeader
        subjectName={selectedGroup?.groupName || "Materia no especificada"}
        isTeacher={true}
      />

      {/* 🔹 Sección de estudiantes con asistencia */}
      <StudentList onStudentClick={onclickStudent} />

      <BackButton
        onClick={() =>
          navigate(PrivateRoutes.DASHBOARD + PrivateRoutes.HOME)
        }
      />

      {/* Renderizamos el modal si está activo */}
      {showGradesModal && (
        <GradesStudentModal
          student={selectedStudent}
          students={students}
          currentIndex={selectedStudentIndex}
          onChangeStudent={(newStudent, newIndex) => {
            console.log(newStudent)
            setSelectedStudent(newStudent);
            setSelectedStudentIndex(newIndex);
            dispatch(setSelectedUser(newStudent));
          }}
          isTeacher={true}
          onClose={() => setShowGradesModal(false)}
          handleStudentReverse={()=> {dispatch(setSelectedUser(userState))}}
        />
      )}
    </div>
  );
};




export default DirectionGroupsGrid;
