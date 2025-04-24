import React, { useState, useEffect, useRef } from "react";
import { X, Loader, AlertCircle, Download, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import JSZip from "jszip";

const ReportModal = ({ url, isOpen, onClose, isZip }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [extractedFiles, setExtractedFiles] = useState([]);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const iframeRef = useRef(null);
  
  useEffect(() => {
    // Resetear el estado cuando cambia la URL
    if (url) {
      setLoading(true);
      setError(null);
      setExtractedFiles([]);
      setActiveTabIndex(0);
      
      // Si es un archivo ZIP, extraer su contenido
      if (isZip && url) {
        extractZipContents(url);
      } else if (url) {
        // Si es un solo PDF, creamos un único "archivo extraído"
        setExtractedFiles([{
          name: "Reporte",
          url: url,
          type: 'application/pdf'
        }]);
        setLoading(false);
      }
    }
  }, [url, isZip]);
  
  // Función para extraer el contenido del ZIP
  const extractZipContents = async (zipUrl) => {
    try {
      setLoading(true);
      
      // Descargar el archivo ZIP como blob
      const response = await fetch(zipUrl);
      const zipBlob = await response.blob();
      
      // Usar JSZip para extraer los archivos
      const zip = new JSZip();
      const zipContents = await zip.loadAsync(zipBlob);
      
      const files = [];
      
      // Procesar cada archivo en el ZIP
      const fileProcessingPromises = [];
      
      zipContents.forEach((relativePath, zipEntry) => {
        // Solo procesar archivos PDF
        if (!zipEntry.dir && relativePath.endsWith('.pdf')) {
          const promise = zipEntry.async('blob').then(fileBlob => {
            // Crear un objeto URL para el blob
            const fileUrl = URL.createObjectURL(
              new Blob([fileBlob], { type: 'application/pdf' })
            );
            
            // Extraer el nombre del estudiante del nombre del archivo
            const fileName = relativePath.split('/').pop();
            const nameParts = fileName.split('_');
            let studentName = "Estudiante";
            
            // Intentar extraer el ID del estudiante si está en el nombre del archivo
            if (nameParts.length > 2 && nameParts[1] === "estudiante") {
              studentName = `Estudiante ${nameParts[2]}`;
            }
            
            files.push({
              name: studentName,
              originalName: fileName,
              url: fileUrl,
              type: 'application/pdf'
            });
          });
          
          fileProcessingPromises.push(promise);
        }
      });
      
      // Esperar a que todos los archivos se procesen
      await Promise.all(fileProcessingPromises);
      
      // Ordenar los archivos por nombre
      files.sort((a, b) => a.name.localeCompare(b.name));
      
      if (files.length === 0) {
        setError("No se encontraron archivos PDF en el ZIP");
      } else {
        setExtractedFiles(files);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error al procesar el archivo ZIP:", error);
      setError(`Error al procesar el archivo: ${error.message}`);
      setLoading(false);
    }
  };
  
  // Manejar el cierre del modal
  const handleClose = () => {
    // Liberar las URLs de blob al cerrar
    extractedFiles.forEach(file => {
      if (file.url.startsWith('blob:')) {
        URL.revokeObjectURL(file.url);
      }
    });
    onClose();
  };
  
  // Función para descargar el archivo actual
  const handleDownload = () => {
    if (extractedFiles.length > 0 && activeTabIndex < extractedFiles.length) {
      const a = document.createElement("a");
      a.href = extractedFiles[activeTabIndex].url;
      a.download = extractedFiles[activeTabIndex].originalName || "reporte.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };
  
  // Si el modal no está abierto, no renderizamos nada
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 backdrop-blur-md bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
            className="bg-white rounded-lg w-full max-w-5xl h-5/6 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">Vista previa del reporte</h3>
              <div className="flex items-center">
                <button 
                  onClick={handleDownload}
                  className="p-2 mr-2 rounded-full hover:bg-gray-100 text-amber-500"
                  title="Descargar reporte"
                >
                  <Download size={20} />
                </button>
                <button 
                  onClick={handleClose}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* Pestañas para múltiples PDFs */}
            {extractedFiles.length > 1 && (
              <div className="border-b overflow-x-auto">
                <div className="flex">
                  {extractedFiles.map((file, index) => (
                    <button
                      key={index}
                      className={`px-4 py-2 border-r flex items-center ${
                        activeTabIndex === index 
                          ? "bg-amber-50 text-amber-600 border-b-2 border-b-amber-500" 
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => setActiveTabIndex(index)}
                    >
                      <FileText size={16} className="mr-2" />
                      <span className="truncate max-w-xs">{file.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex-1 overflow-hidden relative">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                  <div className="text-center">
                    <Loader size={40} className="animate-spin mx-auto text-amber-500 mb-2" />
                    <p className="text-gray-600">Cargando reporte...</p>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                  <div className="text-center max-w-md p-4">
                    <AlertCircle size={40} className="mx-auto text-red-500 mb-2" />
                    <p className="text-gray-700 font-medium mb-2">Error al cargar el reporte</p>
                    <p className="text-gray-600 text-sm mb-4">{error}</p>
                    <button 
                      onClick={handleDownload}
                      className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors mb-3"
                    >
                      Descargar archivo
                    </button>
                    <button 
                      onClick={handleClose}
                      className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              )}
              
              {/* Visor de PDF usando iframe */}
              {!loading && !error && extractedFiles.length > 0 && activeTabIndex < extractedFiles.length && (
                <div className="h-full flex flex-col">
                  <div className="flex-1 overflow-hidden">
                    <iframe
                      ref={iframeRef}
                      src={extractedFiles[activeTabIndex].url}
                      title="PDF Viewer"
                      className="w-full h-full border-0"
                      onError={() => {
                        setError("No se pudo cargar el documento PDF. Por favor, descárguelo para visualizarlo.");
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReportModal;
