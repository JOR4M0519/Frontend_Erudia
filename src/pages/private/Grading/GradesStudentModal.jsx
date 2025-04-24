import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, Maximize2, Minimize2, Download, ChevronRight } from 'lucide-react';
import { GradesStudent, } from '../Dashboard/StudentLayout';
import { CancelButton } from '../../../components';
import {gradingService} from './';

const GradesStudentModal = ({
    student,
    students,
    currentIndex,
    onChangeStudent,
    isTeacher,
    onClose,
    handleStudentReverse,
    isLoading,
    setIsLoading,
    hasPrevious,
    hasNext,
    goToPreviousStudent,
    goToNextStudent
}) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setAnimateIn(true), 50);
        document.body.style.overflow = 'hidden';

        return () => {
            clearTimeout(timer);
            document.body.style.overflow = 'auto';
        };
    }, []);

    const handleClose = () => {
        handleStudentReverse();
        setAnimateIn(false);
        setIsLoading(true);
        setTimeout(() => onClose(), 300);
    };

    

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    // Manejadores para la navegación
    const handlePrevious = () => {
        if (hasPrevious && goToPreviousStudent) {
            goToPreviousStudent();
        }
    };

    const handleNext = () => {
        if (hasNext && goToNextStudent) {
            goToNextStudent();
        }
    };

    return (
        <div className={`fixed inset-0 backdrop-blur-md transition-opacity duration-300 z-50 flex items-center justify-center ${animateIn ? 'bg-opacity-70' : 'bg-opacity-0'}`}>
            <div
                className={`bg-white rounded-lg shadow-2xl transition-all duration-300 overflow-hidden
                    ${isFullscreen ? 'fixed inset-0 rounded-none' : 'w-full max-w-5xl max-h-[90vh]'}
                    ${animateIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            >
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

                    <div className="flex items-center space-x-4 mr-4">
                        <button
                            onClick={handlePrevious}
                            disabled={!hasPrevious}
                            className={`
                                flex items-center justify-center
                                px-3 py-2 rounded-lg
                                transition-all duration-200
                                ${hasPrevious 
                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm active:bg-gray-300' 
                                    : 'bg-gray-50 text-gray-300 cursor-not-allowed opacity-50'
                                }
                            `}
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span className="hidden sm:inline ml-1 text-sm font-medium">
                                Anterior
                            </span>
                        </button>

                        <button
                            onClick={handleNext}
                            disabled={!hasNext}
                            className={`
                                flex items-center justify-center
                                px-3 py-2 rounded-lg
                                transition-all duration-200
                                ${hasNext 
                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm active:bg-gray-300' 
                                    : 'bg-gray-50 text-gray-300 cursor-not-allowed opacity-50'
                                }
                            `}
                        >
                            <span className="hidden sm:inline mr-1 text-sm font-medium">
                                Siguiente
                            </span>
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

                <footer className="border-t border-gray-200 px-6 py-4 bg-gray-50 sticky bottom-0">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500 flex items-center">
                            <div className="flex items-center md:hidden">
                                <button
                                    onClick={handlePrevious}
                                    disabled={!hasPrevious}
                                    className={`mr-2 p-1.5 rounded transition-colors ${
                                        hasPrevious
                                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                <span className="text-xs mr-2">
                                    {currentIndex + 1}/{students.length}
                                </span>

                                <button
                                    onClick={handleNext}
                                    disabled={!hasNext}
                                    className={`p-1.5 rounded transition-colors ${
                                        hasNext
                                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            <span className="ml-2 hidden sm:inline">
                                {isTeacher ? "Vista de calificaciones en modo profesor" : "Vista de calificaciones en modo estudiante"}
                            </span>
                        </div>

                        <div className="flex space-x-3">
                            <CancelButton onClick={handleClose} />

                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default GradesStudentModal;