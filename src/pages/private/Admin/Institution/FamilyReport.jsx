import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, FileText, Search, Download, Users, UserPlus, User, Home, ArrowUp, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { AdminRoutes } from "../../../../models";
import { institutionService } from "./institutionService";


const FamilyReport = () => {
    const [families, setFamilies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalFamilies, setTotalFamilies] = useState(0);
    const [totalMembers, setTotalMembers] = useState(0);
    const [totalActiveChildren, setTotalActiveChildren] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [sortDirection, setSortDirection] = useState("asc");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFamilies = async () => {
            setLoading(true);
            try {
                // Obtener el array de familias directamente del servicio
                const familiesFromBackend = await institutionService.fetchFaimiliesReport();
                
                // Adaptar los datos del backend al formato esperado por el componente
                const adaptedFamilies = familiesFromBackend.map(family => ({
                    id: family.code, // Usar el código como ID si no hay ID específico
                    code: family.code,
                    name: family.familyName, // Mapear familyName a name
                    memberCount: family.totalMembers, // Este nombre ya coincide
                    activeChildrenCount: family.activeStudents // Mapear activeStudents a activeChildrenCount
                }));
                
                // Calcular totales
                const calculatedTotalMembers = familiesFromBackend.reduce(
                    (total, family) => total + family.totalMembers, 0
                );
                
                const calculatedTotalActiveChildren = familiesFromBackend.reduce(
                    (total, family) => total + family.activeStudents, 0
                );
                
                // Crear objeto con la estructura esperada
                const processedData = {
                    families: adaptedFamilies,
                    totalMembers: calculatedTotalMembers,
                    totalActiveChildren: calculatedTotalActiveChildren
                };
                
                // Actualizar estados
                setFamilies(processedData.families);
                setTotalFamilies(processedData.families.length);
                setTotalMembers(processedData.totalMembers);
                setTotalActiveChildren(processedData.totalActiveChildren);
                
            } catch (err) {
                console.error("Error al cargar datos de familias:", err);
                setError("No se pudieron cargar los datos. Por favor intente nuevamente.");
                toast.error("Error al cargar datos");
            } finally {
                setLoading(false);
            }
        };
    
        fetchFamilies();
    }, []);

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            setSortDirection("asc");
        }
    };

    const filteredFamilies = families.filter(family =>
        family.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        family.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sortedFamilies = [...filteredFamilies].sort((a, b) => {
        const sortOrder = sortDirection === "asc" ? 1 : -1;

        if (sortBy === "name") {
            return a.name.localeCompare(b.name) * sortOrder;
        } else if (sortBy === "code") {
            return a.code.localeCompare(b.code) * sortOrder;
        } else if (sortBy === "memberCount") {
            return (a.memberCount - b.memberCount) * sortOrder;
        } else if (sortBy === "activeChildrenCount") {
            return (a.activeChildrenCount - b.activeChildrenCount) * sortOrder;
        }
        return 0;
    });

    const exportToCsv = () => {
        const headers = ["Código", "Nombre", "Miembros", "Estudiantes Activos"];
        const csvContent = [
            headers.join(","),
            ...sortedFamilies.map(family =>
                [family.code, family.name, family.memberCount, family.activeChildrenCount].join(",")
            )
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `reporte_familias_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <main className="min-h-screen bg-gray-50 pb-10">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate(AdminRoutes.INSTITUTION)}
                            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Reporte de Familias</h1>
                            <p className="mt-1 text-sm text-gray-500">Información detallada sobre las familias registradas</p>
                        </div>
                    </div>
                </div>
            </header>

            <section className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        {/* Tarjetas estadísticas */}
                        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white overflow-hidden shadow rounded-lg"
                            >
                                <div className="px-4 py-5 sm:p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 bg-cyan-100 rounded-md p-3">
                                            <Home className="h-6 w-6 text-cyan-600" />
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">Total Familias</dt>
                                                <dd className="text-3xl font-semibold text-gray-900">{totalFamilies}</dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                                className="bg-white overflow-hidden shadow rounded-lg"
                            >
                                <div className="px-4 py-5 sm:p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 bg-violet-100 rounded-md p-3">
                                            <Users className="h-6 w-6 text-violet-600" />
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">Total Miembros</dt>
                                                <dd className="text-3xl font-semibold text-gray-900">{totalMembers}</dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.2 }}
                                className="bg-white overflow-hidden shadow rounded-lg"
                            >
                                <div className="px-4 py-5 sm:p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 bg-emerald-100 rounded-md p-3">
                                            <UserPlus className="h-6 w-6 text-emerald-600" />
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">Estudiantes Activos</dt>
                                                <dd className="text-3xl font-semibold text-gray-900">{totalActiveChildren}</dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Controles de búsqueda y exportación */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.3 }}
                            className="mb-6 flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm"
                        >
                            <div className="relative w-full md:w-64 mb-4 md:mb-0">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="input input-bordered w-full pl-10"
                                    placeholder="Buscar familias..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div>
                                <button
                                    onClick={exportToCsv}
                                    className="btn btn-outline btn-primary flex items-center"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Exportar CSV
                                </button>
                            </div>
                        </motion.div>

                        {/* Tabla de familias */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.4 }}
                            className="bg-white shadow rounded-lg overflow-hidden"
                        >
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                onClick={() => handleSort("code")}
                                            >
                                                <div className="flex items-center">
                                                    Código
                                                    {sortBy === "code" && (
                                                        sortDirection === "asc" ?
                                                            <ArrowUp className="ml-1 h-4 w-4" /> :
                                                            <ArrowDown className="ml-1 h-4 w-4" />
                                                    )}
                                                </div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                onClick={() => handleSort("name")}
                                            >
                                                <div className="flex items-center">
                                                    Familia
                                                    {sortBy === "name" && (
                                                        sortDirection === "asc" ?
                                                            <ArrowUp className="ml-1 h-4 w-4" /> :
                                                            <ArrowDown className="ml-1 h-4 w-4" />
                                                    )}
                                                </div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                onClick={() => handleSort("memberCount")}
                                            >
                                                <div className="flex items-center">
                                                    Miembros
                                                    {sortBy === "memberCount" && (
                                                        sortDirection === "asc" ?
                                                            <ArrowUp className="ml-1 h-4 w-4" /> :
                                                            <ArrowDown className="ml-1 h-4 w-4" />
                                                    )}
                                                </div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                onClick={() => handleSort("activeChildrenCount")}
                                            >
                                                <div className="flex items-center">
                                                    Estudiantes Activos
                                                    {sortBy === "activeChildrenCount" && (
                                                        sortDirection === "asc" ?
                                                            <ArrowUp className="ml-1 h-4 w-4" /> :
                                                            <ArrowDown className="ml-1 h-4 w-4" />
                                                    )}
                                                </div>
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Acciones
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {sortedFamilies.length > 0 ? (
                                            sortedFamilies.map((family) => (
                                                <tr key={family.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {family.code}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                                <User className="h-5 w-5 text-gray-500" />
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">{family.name}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {family.memberCount}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                            {family.activeChildrenCount}
                                                        </span>
                                                    </td>
                                                    {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button className="text-primary hover:text-primary-dark">Ver detalles</button>
                                                    </td> */}
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500">
                                                    No se encontraron familias que coincidan con la búsqueda
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                    <tfoot className="bg-gray-50">
                                        <tr>
                                            <th scope="row" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Total
                                            </th>
                                            <th scope="row" className="px-6 py-3 text-left text-xs font-medium text-gray-900">
                                                {filteredFamilies.length} familias
                                            </th>
                                            <th scope="row" className="px-6 py-3 text-left text-xs font-medium text-gray-900">
                                                {totalMembers} miembros
                                            </th>
                                            <th scope="row" className="px-6 py-3 text-left text-xs font-medium text-gray-900">
                                                {totalActiveChildren} estudiantes
                                            </th>
                                            <th scope="row" className="px-6 py-3 text-right text-xs font-medium text-gray-500">
                                                &nbsp;
                                            </th>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            {filteredFamilies.length > 5 && (
                                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                                    <div className="text-sm text-gray-700">
                                        Mostrando <span className="font-medium">{filteredFamilies.length}</span> de <span className="font-medium">{totalFamilies}</span> familias
                                    </div>
                                    <div>
                                        <button className="btn btn-sm btn-ghost">Ver todas</button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </section>

            {/* <footer className="bg-white border-t border-gray-200 mt-12">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="text-sm text-gray-500">
                            &copy; {new Date().getFullYear()} Sistema de Gestión Educativa
                        </div>
                        <div className="mt-2 md:mt-0 flex space-x-4">
                            <a href="#" className="text-gray-500 hover:text-gray-700">Ayuda</a>
                            <a href="#" className="text-gray-500 hover:text-gray-700">Soporte</a>
                        </div>
                    </div>
                </div>
            </footer> */}
        </main>
    );
};

export default FamilyReport;


