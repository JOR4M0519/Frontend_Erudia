import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
import { StudentModal } from "../StudentLayout";

const DirectionGroupsGrid = () => {
  const [students, setStudents] = useState([]);
  const userState = useSelector((store) => store.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  const [showGradesModal, setShowGradesModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);


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

  useEffect(() => {
    const subscription = teacherDataService
      .getStudentGroupListData()
      .subscribe((data) => {
        if (data?.studentGroupList?.students) {
          setStudents(data.studentGroupList.students);
        }
      });
    return () => subscription.unsubscribe();
  }, []);
  const onclickStudent = (student, type) => {
    const studentIndex = students.findIndex(s => s.id === student.id);
    const selectedStudentObj = {
      id: student.id,
      name: student.name,
      email: student.email ?? "NA",
      roles: [encryptData(Roles.TEACHER),] ?? "NA",
    };
    setSelectedStudent(selectedStudentObj);
    setSelectedStudentIndex(studentIndex);
    dispatch(setSelectedUser(selectedStudentObj));
    if (type === 'grades') {
      setIsLoading(true);
      setShowStudentModal(false);
      setShowGradesModal(true);
      setTimeout(() => setIsLoading(false), 300);
    } else {
      setShowStudentModal(true);
    }
  };

  const goToPreviousStudent = () => {
    if (selectedStudentIndex <= 0) return;
    setIsLoading(true);
    const prevIndex = selectedStudentIndex - 1;
    const prevStudent = students[prevIndex];
    
    if (!prevStudent) {
      setIsLoading(false);
      return;
    }
    const prevStudentObj = {
      id: prevStudent.id,
      name: prevStudent.name,
      email: prevStudent.email ?? "NA",
      roles: [encryptData(Roles.TEACHER),] ?? "NA",
    };

    setSelectedStudentIndex(prevIndex);
    setSelectedStudent(prevStudentObj);
    dispatch(setSelectedUser(prevStudentObj));

    setTimeout(() => setIsLoading(false), 300);
  };

  const goToNextStudent = () => {
    if (selectedStudentIndex >= students.length - 1) return;
    setIsLoading(true);
    const nextIndex = selectedStudentIndex + 1;
    const nextStudent = students[nextIndex];
    
    if (!nextStudent) {
      setIsLoading(false);
      return;
    }
    const nextStudentObj = {
      id: nextStudent.id,
      name: nextStudent.name,
      email: nextStudent.email ?? "NA",
      roles: [encryptData(Roles.TEACHER),] ?? "NA",
    };

    setSelectedStudentIndex(nextIndex);
    setSelectedStudent(nextStudentObj);
    dispatch(setSelectedUser(nextStudentObj));

    setTimeout(() => setIsLoading(false), 300);
  };

  const handleViewGrades = () => {
    if (!selectedStudent) return;
    
    setIsLoading(true);
    setShowStudentModal(false);
    setTimeout(() => {
      setShowGradesModal(true);
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="space-y-6">
      <SubjectHeader
        subjectName={selectedGroup?.groupName || "Materia no especificada"}
        isTeacher={true}
      />

      <StudentList onStudentClick={onclickStudent} />

      <BackButton
        onClick={() => navigate(PrivateRoutes.DASHBOARD + PrivateRoutes.HOME)}
      />

      {showStudentModal && (
        <StudentModal
          student={selectedStudent}
          isOpen={showStudentModal}
          onClose={() => {
            setShowStudentModal(false);
            setSelectedStudent(null);
            dispatch(setSelectedUser(userState));
          }}
          onViewGrades={handleViewGrades}
        />
      )}
      
      {showGradesModal && (
        <GradesStudentModal
          student={selectedStudent}
          students={students}
          currentIndex={selectedStudentIndex}
          onChangeStudent={(newStudent, newIndex) => {
            setSelectedStudent(newStudent);
            setSelectedStudentIndex(newIndex);
            dispatch(setSelectedUser(newStudent));
          }}
          isTeacher={true}
          onClose={() => {
            setShowGradesModal(false);
            setSelectedStudent(null);
            dispatch(setSelectedUser(userState));
          }}
          handleStudentReverse={() => {
            dispatch(setSelectedUser(userState));
          }}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          hasPrevious={selectedStudentIndex > 0}
          hasNext={selectedStudentIndex < students.length - 1}
          goToPreviousStudent={goToPreviousStudent}
          goToNextStudent={goToNextStudent}
        />
      )}
    </div>
  );
};
export default DirectionGroupsGrid;
