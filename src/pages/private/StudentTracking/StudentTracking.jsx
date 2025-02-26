import React, { useEffect, useState } from "react";
import { Download, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { studentDataService } from "../Dashboard/StudentLayout";
import { BackButton } from "../../../components";

import {TrackingHeader} from "./";

import {StudentModal} from "./";
import {ObservationModal} from "./";
import StudentList from "./StudenList";

export default function StudentTracking() {
  const [selectedObservation, setSelectedObservation] = useState(null);
  const [observations, setObservations] = useState([]);
  const [filteredObservations, setFilteredObservations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const navigate = useNavigate();
  const userState = useSelector((store) => store.selectedUser);
  const isTeacher = userState.role === "teacher";

  useEffect(() => {
    if (!userState.id) return;
    // Se obtienen las observaciones (para profesor y estudiante se usa el mismo endpoint)
    const fetchObservations = async () => {
      const data = await studentDataService.getStudentObservations(userState.id);
      setObservations(data);
      setFilteredObservations(data);
    };
    fetchObservations();
  }, [userState]);

  useEffect(() => {
    let filtered = observations;
    if (searchTerm.length >= 4) {
      filtered = filtered.filter((obs) => {
        // Para profesores, se busca en el nombre del estudiante
        if (isTeacher) {
          const studentName = `${obs.student.firstName} ${obs.student.lastName}`.toLowerCase();
          return studentName.includes(searchTerm.toLowerCase());
        }
        // Para estudiantes, se busca en el título de la observación
        return obs.title.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
    if (dateFilter) {
      filtered = filtered.filter((obs) => obs.date === dateFilter);
    }
    setFilteredObservations(filtered);
  }, [searchTerm, dateFilter, observations, isTeacher]);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleDateFilter = (e) => setDateFilter(e.target.value);

  const handleEditObservation = (observation, e) => {
    e.stopPropagation();
    console.log("Editando observación:", observation.id);
    // Aquí se podría abrir el ObservationModal en modo edición
    setSelectedObservation(observation);
  };

  const handleDeleteObservation = (observation, e) => {
    e.stopPropagation();
    console.log("Eliminando observación:", observation.id);
    // Implementar lógica de eliminación
  };

  const handleItemClick = (observation) => {
    if (isTeacher) {
      // Al hacer clic en la fila, el profesor ve la información académica del estudiante
      setSelectedStudent(observation.student);
      setShowStudentModal(true);
    } else {
      setSelectedObservation(observation);
    }
  };

  const handleCreateObservation = () => {
    console.log("Creando nueva observación");
    // Implementar la lógica para crear observación
  };

  const handleExport = () => {
    console.log("Exportando observador...");
    // Lógica para exportar datos (CSV/PDF)
  };

  return (
    <div className="space-y-4">
      <TrackingHeader 
        isTeacher={isTeacher}
        userState={userState}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onDateFilter={handleDateFilter}
        onCreateObservation={handleCreateObservation}
      />

      <StudentList
        observations={filteredObservations}
        isTeacher={isTeacher}
        onEditObservation={handleEditObservation}
        onDeleteObservation={handleDeleteObservation}
        onItemClick={handleItemClick}
      />

      <div className="flex justify-end">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Exportar observador</span>
        </button>
      </div>

      {isTeacher && (
        <div className="fixed bottom-8 right-8">
          <button
            onClick={handleCreateObservation}
            className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      )}

      <BackButton onClick={() => navigate("/dashboard")} />

      {selectedObservation && (
        <ObservationModal
          isOpen={!!selectedObservation}
          observation={selectedObservation}
          onClose={() => setSelectedObservation(null)}
        />
      )}

      {selectedStudent && (
        <StudentModal
          student={selectedStudent}
          isOpen={showStudentModal}
          onClose={() => {
            setShowStudentModal(false);
            setSelectedStudent(null);
          }}
        />
      )}
    </div>
  );
}
