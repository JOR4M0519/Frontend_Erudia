import { X, ChevronLeft, Maximize2, Minimize2, Download, ChevronRight } from 'lucide-react';

import { GradesStudent } from '../Dashboard/StudentLayout';
import { useEffect, useState } from 'react';
import { CancelButton, XButton } from '../../../components';
import { encryptData } from '../../../utilities';
import { Roles } from '../../../models';



const GradesStudentModal = ({
    student,
    students,
    currentIndex,
    onChangeStudent,
    isTeacher,
    onClose,
    handleStudentReverse }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);


    useEffect(() => {
        // Animación de entrada
        const timer = setTimeout(() => setAnimateIn(true), 50);

        // Bloquear el scroll del body cuando el modal está abierto
        document.body.style.overflow = 'hidden';

        return () => {
            clearTimeout(timer);
            document.body.style.overflow = 'auto';
        };
    }, []);

    const handleClose = () => {
        handleStudentReverse()
        setAnimateIn(false);
        setIsLoading(true);

        // Esperar a que termine la animación de salida
        setTimeout(() => {
            onClose();
        }, 300);
    };

    // Comprobar si hay estudiante anterior o siguiente disponible
    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < students.length - 1;

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const goToPreviousStudent = () => {
        if (!hasPrevious) return;

        setIsLoading(true);

        // Preparar el objeto del estudiante anterior
        const prevIndex = currentIndex - 1;
        const prevStudent = students[prevIndex];

        const prevStudentObj = {
            id: prevStudent.id,
            name: prevStudent.name,
            email: prevStudent.email ?? "NA",
            roles: [encryptData(Roles.TEACHER),] ?? "NA",
            // Otros campos si son necesarios
        };
        // Cambiar al estudiante anterior
        onChangeStudent(prevStudentObj, prevIndex);

        // Desactivar la carga después de un breve tiempo
        setTimeout(() => setIsLoading(false), 300);
    };

    const goToNextStudent = () => {
        if (!hasNext) return;

        setIsLoading(true);

        // Preparar el objeto del estudiante siguiente
        const nextIndex = currentIndex + 1;
        const nextStudent = students[nextIndex];

        const nextStudentObj = {
            id: nextStudent.id,
            name: nextStudent.name,
            email: nextStudent.email ?? "NA",
            roles: [encryptData(Roles.TEACHER),] ?? "NA",
            // Otros campos si son necesarios
        };

        // Cambiar al estudiante siguiente
        onChangeStudent(nextStudentObj, nextIndex);

        // Desactivar la carga después de un breve tiempo
        setTimeout(() => setIsLoading(false), 300);
    };

    return (
        // Modal overlay con transición
        <div className={`fixed inset-0 backdrop-blur-md transition-opacity duration-300 z-50 flex items-center justify-center ${animateIn ? 'bg-opacity-70' : 'bg-opacity-0'}`}>
            {/* Modal content con animación */}
            <div
                className={`bg-white rounded-lg shadow-2xl transition-all duration-300 overflow-hidden
            ${isFullscreen ? 'fixed inset-0 rounded-none' : 'w-full max-w-5xl max-h-[90vh]'}
            ${animateIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            >
                {/* Header del modal con navegación entre estudiantes */}
                <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Volver"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>

                        <div className="flex-1">
                            <h2 className="text-lg font-bold text-gray-800">Calificaciones Estudiante</h2>
                            <div className="flex items-center">
                                <p className="text-sm text-gray-500">
                                    {student?.name || "Estudiante"} • {student?.grade || "Grado"}
                                </p>
                                <span className="text-xs text-gray-400 ml-2">
                                    {currentIndex + 1} de {students.length}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Controles de navegación entre estudiantes */}
                    <div className="flex items-center space-x-2 mr-4">
                        <button
                            onClick={goToPreviousStudent}
                            disabled={!hasPrevious}
                            className={`p-2 rounded-full transition-colors ${hasPrevious
                                    ? 'hover:bg-gray-100 text-gray-700'
                                    : 'text-gray-300 cursor-not-allowed'
                                }`}
                            aria-label="Estudiante anterior"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <button
                            onClick={goToNextStudent}
                            disabled={!hasNext}
                            className={`p-2 rounded-full transition-colors ${hasNext
                                    ? 'hover:bg-gray-100 text-gray-700'
                                    : 'text-gray-300 cursor-not-allowed'
                                }`}
                            aria-label="Estudiante siguiente"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={toggleFullscreen}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                        >
                            {isFullscreen ?
                                <Minimize2 className="w-5 h-5 text-gray-600" /> :
                                <Maximize2 className="w-5 h-5 text-gray-600" />
                            }
                        </button>

                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Cerrar"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </header>

                {/* Contenedor con scroll para el contenido */}
                <div className="overflow-y-auto p-6" style={{ height: "calc(90vh - 10rem)" }}>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full min-h-[400px]">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <GradesStudent
                            student={student}
                            isTeacher={isTeacher}
                        />
                    )}
                </div>

                {/* Footer del modal con acciones y navegación */}
                <footer className="border-t border-gray-200 px-6 py-4 bg-gray-50 sticky bottom-0">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500 flex items-center">
                            {/* Añadir controles de navegación en el footer también para dispositivos móviles */}
                            <div className="flex items-center md:hidden">
                                <button
                                    onClick={goToPreviousStudent}
                                    disabled={!hasPrevious}
                                    className={`mr-2 p-1.5 rounded transition-colors ${hasPrevious
                                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                    aria-label="Estudiante anterior"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                <span className="text-xs mr-2">
                                    {currentIndex + 1}/{students.length}
                                </span>

                                <button
                                    onClick={goToNextStudent}
                                    disabled={!hasNext}
                                    className={`p-1.5 rounded transition-colors ${hasNext
                                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                    aria-label="Estudiante siguiente"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            <span className="ml-2 hidden sm:inline">
                                {isTeacher ?
                                    "Vista de calificaciones en modo profesor" :
                                    "Vista de calificaciones en modo estudiante"}
                            </span>
                        </div>

                        <div className="flex space-x-3">
                            <CancelButton onClick={handleClose} />

                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Descargar Boletín
                            </button>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default GradesStudentModal;